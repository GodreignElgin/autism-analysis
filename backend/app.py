import os
import sys
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import cv2
import numpy as np
from PIL import Image
import tensorflow as tf
import io
import base64

# Load environment variables from .env file
load_dotenv()

# Import configuration
from config import get_config
from utils import allowed_file, get_safe_filename
from ai_chatbot import AIChatbot
from ensemble_inference import (
    TabularBehaviorModel,
    compute_weighted_ensemble_score,
    extract_behavioral_input_from_request,
)

# Add parent directory to path so we can import ml_model
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_model.autism_detector import AutismDetector

# Initialize Flask app
app = Flask(__name__)

# Load configuration from config.py
config_obj = get_config()
app.config.from_object(config_obj)

# Configure CORS with origins from config
CORS(app, origins=config_obj.CORS_ORIGINS)

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Initialize ML model
autism_detector = AutismDetector()
tabular_model = TabularBehaviorModel(config_obj.TABULAR_MODEL_PATH)

IMAGE_MODEL_WEIGHT = max(0.0, float(config_obj.IMAGE_MODEL_WEIGHT))
TABULAR_MODEL_WEIGHT = max(0.0, float(config_obj.TABULAR_MODEL_WEIGHT))
if (IMAGE_MODEL_WEIGHT + TABULAR_MODEL_WEIGHT) <= 0:
    IMAGE_MODEL_WEIGHT, TABULAR_MODEL_WEIGHT = 1.0, 0.0

# Initialize AI Chatbot (Google Gemini)
gemini_api_key = config_obj.GEMINI_API_KEY
if not gemini_api_key:
    print("⚠ WARNING: GEMINI_API_KEY not set. Chatbot will not work.")
    print("  Get your API key from: https://makersuite.google.com/app/apikey")
    print("  Add it to your .env file: GEMINI_API_KEY=your-key-here")
ai_chatbot = AIChatbot(api_key=gemini_api_key) if gemini_api_key else None

# ============== DATABASE MODELS ==============

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    children = db.relationship('Child', backref='parent', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Child(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    assessments = db.relationship('Assessment', backref='child', lazy=True, cascade='all, delete-orphan')
    notes = db.relationship('Note', backref='child', lazy=True, cascade='all, delete-orphan')

class Assessment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    child_id = db.Column(db.Integer, db.ForeignKey('child.id'), nullable=False)
    assessment_date = db.Column(db.DateTime, default=db.func.current_timestamp())
    autism_score = db.Column(db.Float)  # Probability score
    facial_features = db.Column(db.Text)  # JSON string
    status = db.Column(db.String(20))  # 'positive', 'negative', 'inconclusive'
    image_path = db.Column(db.String(500))
    recommendations = db.Column(db.Text)  # JSON string

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    child_id = db.Column(db.Integer, db.ForeignKey('child.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    note_type = db.Column(db.String(50))  # 'observation', 'milestone', 'concern'
    content = db.Column(db.Text)

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text)
    response = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    user = db.relationship('User', backref='chat_messages')

# ============== ROOT ROUTE ==============

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'message': 'Autism Detection Platform API',
        'status': 'running',
        'version': '1.0.0',
        'endpoints': {
            'health': '/api/health',
            'register': '/api/auth/register',
            'login': '/api/auth/login',
            'analyze': '/api/analyze',
            'chat': '/api/chat',
            'chat_history': '/api/chat/history',
            'chat_suggestions': '/api/chat/suggestions'
        }
    }), 200

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'Autism Detection Platform API'
    }), 200

# ============== AUTHENTICATION ROUTES ==============

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password') or not data.get('full_name'):
            return jsonify({'error': 'Missing required fields'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        user = User(
            email=data['email'],
            full_name=data['full_name'],
            phone=data.get('phone', '')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Registration successful',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Missing email or password'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'id': user.id,
            'email': user.email,
            'full_name': user.full_name,
            'phone': user.phone,
            'children_count': len(user.children)
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============== ANALYSIS ROUTES ==============

@app.route('/api/analyze', methods=['POST'])
@jwt_required()
def analyze_image():
    try:
        app.logger.info("Analyze request received")
        if 'image' not in request.files:
            app.logger.warning("Analyze request missing image")
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            app.logger.warning("Analyze request with empty filename")
            return jsonify({'error': 'No image selected'}), 400
        
        # Validate file extension
        if not allowed_file(file.filename):
            app.logger.warning("Analyze request rejected due to invalid file extension")
            return jsonify({'error': 'Invalid file type. Allowed: jpg, jpeg, png, gif, bmp'}), 400
        
        # Read and process image
        image = Image.open(file.stream).convert('RGB')
        image_array = np.array(image)
        
        # Detect faces and analyze
        image_result = autism_detector.predict(image_array)
        app.logger.info(
            "Image model completed: status=%s score=%.4f confidence=%.4f",
            image_result.get("status"),
            float(image_result.get("score", 0.0)),
            float(image_result.get("confidence", 0.0)),
        )
        
        if image_result['status'] == 'no_face_detected':
            return jsonify({
                'error': 'Make Sure the face is clearly visible with eyes open in the image.',
                'recommendations': image_result['recommendations']
            }), 400

        final_score = float(image_result['score'])
        final_confidence = float(image_result['confidence'])
        status = "Insufficient Information"
        recommendations = [
            "Behavioral information is required for a complete ensemble decision.",
            "Please provide all behavioral input fields and re-run the analysis.",
        ]
        ensemble_info = {
            'enabled': False,
            'reason': 'tabular model or behavioral input not available',
            'image_score': float(image_result['score']),
            'weights': {
                'image_model': IMAGE_MODEL_WEIGHT,
                'tabular_model': TABULAR_MODEL_WEIGHT
            }
        }

        try:
            behavioral_data = extract_behavioral_input_from_request(request)
            app.logger.info(
                "Behavioral payload %s",
                "detected" if behavioral_data is not None else "not provided",
            )
        except ValueError as parse_error:
            app.logger.warning("Behavioral payload parse error: %s", str(parse_error))
            return jsonify({'error': str(parse_error)}), 400

        has_behavioral_data = behavioral_data is not None

        if behavioral_data is not None and tabular_model.is_ready:
            tabular_score, tabular_probabilities, tabular_error = tabular_model.predict_score(behavioral_data)
            if tabular_error:
                app.logger.warning("Tabular model inference failed: %s", tabular_error)
                ensemble_info['reason'] = f'tabular model inference failed: {tabular_error}'
            else:
                app.logger.info(
                    "Tabular model completed: score=%.4f image_weight=%.3f tabular_weight=%.3f",
                    float(tabular_score),
                    IMAGE_MODEL_WEIGHT,
                    TABULAR_MODEL_WEIGHT,
                )
                final_score = compute_weighted_ensemble_score(
                    image_score=float(image_result['score']),
                    tabular_score=tabular_score,
                    image_weight=IMAGE_MODEL_WEIGHT,
                    tabular_weight=TABULAR_MODEL_WEIGHT
                )
                final_confidence = abs(final_score - 0.5) * 2

                if final_score > 0.7:
                    status = "Autistic"
                    recommendations = autism_detector.get_positive_recommendations(image_result['features'])
                elif final_score > 0.4:
                    status = "inconclusive"
                    recommendations = autism_detector.get_inconclusive_recommendations(image_result['features'])
                else:
                    status = "Non Autistic"
                    recommendations = autism_detector.get_negative_recommendations()

                ensemble_info = {
                    'enabled': True,
                    'image_score': float(image_result['score']),
                    'tabular_score': float(tabular_score),
                    'tabular_probabilities': tabular_probabilities,
                    'weights': {
                        'image_model': IMAGE_MODEL_WEIGHT,
                        'tabular_model': TABULAR_MODEL_WEIGHT
                    },
                    'tabular_model_path': tabular_model.model_path
                }
                app.logger.info("Ensemble final score=%.4f confidence=%.4f", float(final_score), float(final_confidence))
        elif behavioral_data is not None and not tabular_model.is_ready:
            app.logger.warning(
                "Behavioral data supplied but tabular model unavailable: %s",
                tabular_model.last_error or "unknown error",
            )
            ensemble_info['reason'] = tabular_model.last_error or 'tabular model unavailable'
        else:
            app.logger.info("Image-only analysis response returned")

        if has_behavioral_data:
            # Strict binary outcome when tabular inputs are present.
            status = "Yes" if final_score >= 0.5 else "No"
            if status == "Yes":
                recommendations = autism_detector.get_positive_recommendations(image_result['features'])
            else:
                recommendations = autism_detector.get_negative_recommendations()
        else:
            app.logger.info("Behavioral inputs missing; returning insufficient information status")
        
        return jsonify({
            'success': True,
            'autism_score': float(final_score),
            'status': status,
            'facial_features': image_result['features'],
            'recommendations': recommendations,
            'confidence': float(final_confidence),
            'ensemble': ensemble_info
        }), 200
    
    except Exception as e:
        app.logger.exception("Analyze endpoint failed")
        return jsonify({'error': str(e)}), 500

# ============== CHILD PROFILE ROUTES ==============

@app.route('/api/children', methods=['POST'])
@jwt_required()
def add_child():
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data or not data.get('name'):
            return jsonify({'error': 'Child name is required'}), 400
        
        child = Child(
            parent_id=user_id,
            name=data['name'],
            age=data.get('age'),
            gender=data.get('gender')
        )
        
        db.session.add(child)
        db.session.commit()
        
        return jsonify({
            'message': 'Child profile created',
            'child': {
                'id': child.id,
                'name': child.name,
                'age': child.age,
                'gender': child.gender
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/children', methods=['GET'])
@jwt_required()
def get_children():
    try:
        user_id = int(get_jwt_identity())
        children = Child.query.filter_by(parent_id=user_id).all()
        
        return jsonify({
            'children': [{
                'id': child.id,
                'name': child.name,
                'age': child.age,
                'gender': child.gender,
                'assessments_count': len(child.assessments)
            } for child in children]
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/children/<int:child_id>', methods=['GET'])
@jwt_required()
def get_child_details(child_id):
    try:
        user_id = get_jwt_identity()
        child = Child.query.filter_by(id=child_id, parent_id=user_id).first()
        
        if not child:
            return jsonify({'error': 'Child not found'}), 404
        
        assessments = [{
            'id': a.id,
            'date': a.assessment_date.isoformat(),
            'score': a.autism_score,
            'status': a.status,
            'recommendations': json.loads(a.recommendations) if a.recommendations else []
        } for a in child.assessments]
        
        notes = [{
            'id': n.id,
            'date': n.created_at.isoformat(),
            'type': n.note_type,
            'content': n.content
        } for n in child.notes]
        
        return jsonify({
            'child': {
                'id': child.id,
                'name': child.name,
                'age': child.age,
                'gender': child.gender
            },
            'assessments': assessments,
            'notes': notes
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============== ASSESSMENT ROUTES ==============

@app.route('/api/assessment/save', methods=['POST'])
@jwt_required()
def save_assessment():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not data.get('child_id'):
            return jsonify({'error': 'Child ID is required'}), 400
        
        child = Child.query.filter_by(id=data['child_id'], parent_id=user_id).first()
        
        if not child:
            return jsonify({'error': 'Child not found'}), 404
        
        assessment = Assessment(
            child_id=child.id,
            autism_score=data.get('autism_score'),
            facial_features=json.dumps(data.get('facial_features', {})),
            status=data.get('status'),
            image_path=data.get('image_path'),
            recommendations=json.dumps(data.get('recommendations', []))
        )
        
        db.session.add(assessment)
        db.session.commit()
        
        return jsonify({
            'message': 'Assessment saved successfully',
            'assessment_id': assessment.id
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/assessment/<int:child_id>', methods=['GET'])
@jwt_required()
def get_assessments(child_id):
    try:
        user_id = get_jwt_identity()
        child = Child.query.filter_by(id=child_id, parent_id=user_id).first()
        
        if not child:
            return jsonify({'error': 'Child not found'}), 404
        
        assessments = Assessment.query.filter_by(child_id=child_id).all()
        
        return jsonify({
            'assessments': [{
                'id': a.id,
                'date': a.assessment_date.isoformat(),
                'score': a.autism_score,
                'status': a.status,
                'facial_features': json.loads(a.facial_features) if a.facial_features else {},
                'recommendations': json.loads(a.recommendations) if a.recommendations else []
            } for a in assessments]
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============== CHATBOT ROUTES ==============

@app.route('/api/chat', methods=['POST'])
@jwt_required()
def chat():
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data or not data.get('message'):
            return jsonify({'error': 'Message is required'}), 400
        
        user_message = data['message']
        
        # Check if AI chatbot is configured
        if not ai_chatbot:
            return jsonify({
                'error': 'Chatbot is not configured. Please set GEMINI_API_KEY in your .env file.',
                'setup_url': 'https://makersuite.google.com/app/apikey'
            }), 503
        
        # Generate AI response using Gemini
        chatbot_response = ai_chatbot.generate_response(user_message)
        
        # Save chat message
        chat_msg = ChatMessage(
            user_id=user_id,
            message=user_message,
            response=chatbot_response
        )
        
        db.session.add(chat_msg)
        db.session.commit()
        
        return jsonify({
            'message': user_message,
            'response': chatbot_response,
            'timestamp': chat_msg.created_at.isoformat()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/history', methods=['GET'])
@jwt_required()
def get_chat_history():
    try:
        user_id = get_jwt_identity()
        messages = ChatMessage.query.filter_by(user_id=user_id).order_by(ChatMessage.created_at).all()
        
        return jsonify({
            'messages': [{
                'id': m.id,
                'message': m.message,
                'response': m.response,
                'timestamp': m.created_at.isoformat()
            } for m in messages]
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/suggestions', methods=['GET'])
def get_chat_suggestions():
    """Get suggested questions for chatbot"""
    try:
        suggestions = [
            {
                'id': 1,
                'question': 'What are the early signs of autism?',
                'category': 'diagnosis',
                'icon': '🔍'
            },
            {
                'id': 2,
                'question': 'How can I support my child with autism?',
                'category': 'support',
                'icon': '❤️'
            },
            {
                'id': 3,
                'question': 'What therapies are available for autism?',
                'category': 'therapy',
                'icon': '🏥'
            },
            {
                'id': 4,
                'question': 'When should I seek professional help?',
                'category': 'guidance',
                'icon': '👨‍⚕️'
            },
            {
                'id': 5,
                'question': 'How does facial expression analysis work?',
                'category': 'technology',
                'icon': '🤖'
            },
            {
                'id': 6,
                'question': 'What is the importance of early intervention?',
                'category': 'intervention',
                'icon': '⏰'
            },
            {
                'id': 7,
                'question': 'How do I track my child\'s progress?',
                'category': 'tracking',
                'icon': '📊'
            },
            {
                'id': 8,
                'question': 'What should I do if I notice signs of autism?',
                'category': 'action',
                'icon': '🚨'
            }
        ]
        
        # Optional: filter by category if provided
        category = request.args.get('category')
        if category:
            suggestions = [s for s in suggestions if s['category'] == category]
        
        return jsonify({
            'suggestions': suggestions,
            'count': len(suggestions)
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============== ERROR HANDLERS ==============

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# ============== MAIN ==============

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
