import os
from functools import wraps
from flask import jsonify, request
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_safe_filename(filename):
    """Get safe filename"""
    return secure_filename(filename)

def save_uploaded_file(file, upload_folder):
    """Save uploaded file and return path"""
    if not file or file.filename == '':
        return None
    
    if not allowed_file(file.filename):
        return None
    
    os.makedirs(upload_folder, exist_ok=True)
    
    filename = get_safe_filename(file.filename)
    unique_filename = f"{os.urandom(8).hex()}_{filename}"
    filepath = os.path.join(upload_folder, unique_filename)
    
    file.save(filepath)
    return filepath

def delete_file(filepath):
    """Delete uploaded file"""
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            return True
    except Exception as e:
        print(f"Error deleting file: {e}")
    return False

def token_required(f):
    """Decorator to require JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            token = token.split(" ")[1]
        except IndexError:
            return jsonify({'error': 'Invalid token format'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

def serialize_datetime(obj):
    """JSON serializer for datetime objects"""
    if hasattr(obj, 'isoformat'):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

def paginate_query(query, page=1, per_page=10):
    """Paginate database query"""
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return {
        'items': items,
        'total': total,
        'pages': (total + per_page - 1) // per_page,
        'current_page': page,
        'per_page': per_page
    }

def success_response(data, message="Success", status_code=200):
    """Generate success response"""
    return jsonify({
        'success': True,
        'message': message,
        'data': data
    }), status_code

def error_response(message, status_code=400):
    """Generate error response"""
    return jsonify({
        'success': False,
        'error': message
    }), status_code
