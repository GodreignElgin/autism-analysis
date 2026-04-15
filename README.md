# Autism Detection Platform

An AI-powered web application for early detection of autism in children through facial expression analysis. The platform combines machine learning with a user-friendly interface to help parents and healthcare professionals identify potential autism spectrum characteristics. It now features a **weighted ensemble approach** combining facial image analysis with behavioral pattern recognition for more accurate and balanced results.

## Features

### 1. **AI-Powered Analysis**

- Deep learning CNN model for facial expression analysis
- Detects patterns consistent with autism spectrum characteristics
- Analyzes facial features including:
  - Eye contact patterns
  - Facial symmetry
  - Expression intensity
  - Face positioning
- **New**: Weighted Ensemble system that combines Image Model + Tabular (Behavioral) Model
- Configurable weights via `.env` (Default: 70% Image + 30% Behavioral)
- Graceful fallback and "Insufficient Information" status when behavioral data is missing

### 2. **User-Friendly Interface**

- Homepage with comprehensive information about autism
- Quick image upload and analysis tool
- Detailed results with visual representation
- Mobile-responsive design

### 3. **Parent Dashboard**

- User registration and authentication with JWT
- Add and manage multiple children profiles
- Track assessment history over time
- View progress charts and trends
- Add detailed progress notes

### 4. **Interactive Chatbot**

- AI-powered guidance for parents
- Information about autism spectrum disorder
- Early intervention recommendations
- Support for emergency situations
- Available 24/7

### 5. **Data Management**

- Secure SQLite database
- Encrypted user information
- HIPAA-compliant data storage
- Assessment history tracking

## Technology Stack

### Backend

- **Framework**: Flask
- **Package Manager**: uv (modern Python package manager)
- **Python Version**: 3.11.x
- **Authentication**: Flask-JWT-Extended
- **Database**: SQLAlchemy with SQLite
- **ML**: TensorFlow/Keras, scikit-learn, CatBoost/LightGBM/XGBoost family (via tabular extra)
- **Image Processing**: OpenCV, Pillow, dlib (optional)
- **CORS**: Flask-CORS

### Frontend

- **Library**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: React Icons
- **Styling**: CSS-in-JS

### Machine Learning

- **Deep Learning**: TensorFlow/Keras
- **CNN Architecture**: VGG-inspired model
- **Image Processing**: OpenCV
- **Data Processing**: NumPy, Pandas
- **Ensemble**: Weighted averaging of image and tabular models

## Installation & Setup

### Prerequisites

- Python 3.11.x
- Node.js 14+
- uv (Python package manager)

### Backend Setup

1. **Navigate to backend directory:**

```bash
cd backend
```

2. **Install Python 3.11 and sync dependencies:**

```bash
uv python install 3.11
uv sync --extra tabular        # Use --extra tabular for ensemble support
```

3. **Create environment file:**

```bash
copy .env.example .env     # On Windows
# cp .env.example .env     # On macOS/Linux
```

4. **Place your model file** at `backend/model/best_model.pkl`

5. **Run Flask server:**

```bash
uv run python app.py
```

The backend will start at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**

```bash
cd frontend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start development server:**

```bash
npm run dev
```

The frontend will open at `http://localhost:5173` (or the port shown in terminal).

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires JWT)

### Analysis

- `POST /api/analyze` - Analyze image for autism indicators
  - Supports optional `behavioral_data` (JSON) for weighted ensemble

### Child Management

- `POST /api/children` - Add new child (requires JWT)
- `GET /api/children` - Get all children (requires JWT)
- `GET /api/children/<id>` - Get child details (requires JWT)

### Assessments

- `POST /api/assessment/save` - Save assessment results (requires JWT)
- `GET /api/assessment/<child_id>` - Get assessments for a child (requires JWT)

### Chat

- `POST /api/chat` - Send message to chatbot (requires JWT)
- `GET /api/chat/history` - Get chat history (requires JWT)

## Model Architecture

The autism detection model uses a CNN (Convolutional Neural Network) with the following architecture:

```
Input Layer: 224x224x3 (RGB Image)
↓
Block 1: Conv2D(64) → Conv2D(64) → BatchNorm → MaxPool → Dropout(0.25)
Block 2: Conv2D(128) → Conv2D(128) → BatchNorm → MaxPool → Dropout(0.25)
Block 3: Conv2D(256) × 3 → BatchNorm → MaxPool → Dropout(0.25)
Block 4: Conv2D(512) × 3 → BatchNorm → MaxPool → Dropout(0.25)
↓
Flatten
↓
Dense(512) → BatchNorm → Dropout(0.5)
Dense(256) → BatchNorm → Dropout(0.5)
Dense(128) → Dropout(0.3)
Dense(1, Sigmoid) → Output (Binary Classification)
```

## Feature Analysis

The model extracts the following facial features:

1. **Eye Contact**: Ratio of detected eyes to expected
2. **Facial Symmetry**: Left-right symmetry analysis
3. **Expression Intensity**: Edge-based expression detection
4. **Face Positioning**: Face area relative to image
5. **Face Count**: Number of faces detected

## Training the Model

To train the model with your own dataset:

```python
from ml_model.autism_detector import AutismDetector

detector = AutismDetector()

# Prepare your data
X_train = np.array(...)  # Training images
y_train = np.array(...)  # Labels (0 or 1)
X_val = np.array(...)    # Validation images
y_val = np.array(...)    # Validation labels

# Train model
history = detector.train(
    X_train, y_train,
    X_val, y_val,
    epochs=50,
    batch_size=32
)

# Model is automatically saved
```

## Chatbot Features

The interactive chatbot provides guidance on:

- What is autism spectrum disorder?
- Early signs and indicators
- Early intervention programs
- Therapy options (ABA, speech, occupational)
- School support and IEPs
- Emergency resources
- General parenting support

## Database Schema

### Users Table

- id (Primary Key)
- email (Unique)
- password_hash
- full_name
- phone
- created_at

### Children Table

- id (Primary Key)
- parent_id (Foreign Key)
- name
- age
- gender
- created_at

### Assessments Table

- id (Primary Key)
- child_id (Foreign Key)
- assessment_date
- autism_score (0-1 probability)
- facial_features (JSON)
- status (positive/negative/inconclusive)
- image_path
- recommendations (JSON)

### Notes Table

- id (Primary Key)
- child_id (Foreign Key)
- created_at
- note_type (observation/milestone/concern)
- content

### ChatMessages Table

- id (Primary Key)
- user_id (Foreign Key)
- message
- response
- created_at

## Security Considerations

1. **Authentication**: JWT tokens with 30-day expiration
2. **Password Security**: Werkzeug password hashing
3. **Data Privacy**: Encrypted sensitive information
4. **CORS**: Configured for trusted origins only
5. **File Upload**: File type validation and size limits
6. **Database**: SQLAlchemy ORM prevents SQL injection

## Important Disclaimer

⚠️ **DISCLAIMER**: This application is a screening tool only and is NOT a diagnostic tool.

- Results should not be used as a substitute for professional medical advice
- Always consult with qualified healthcare professionals for proper diagnosis
- Early diagnosis and intervention require professional assessment
- This tool is meant to raise awareness and encourage professional evaluation

## Testing

### Manual Testing Steps

1. **Quick Analysis (No Login)**:

   - Visit homepage
   - Navigate to "Analyze"
   - Upload a photo + optional behavioral inputs
   - View analysis results

2. **User Registration**:

   - Click "Register"
   - Fill in details
   - Create account
   - Redirected to dashboard

3. **Child Profile Management**:

   - Add child from dashboard
   - View child details
   - Add notes and track progress

4. **Chatbot Testing**:
   - Navigate to Chat page
   - Ask predefined questions
   - View AI responses

## Future Enhancements

- [ ] Integrate with professional diagnostic tools
- [ ] Multi-image analysis for better accuracy
- [ ] Video-based real-time analysis
- [ ] Integration with health records
- [ ] Professional appointment scheduling
- [ ] Parent community forum
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Advanced analytics and reporting

## Performance Optimization

- Image preprocessing and resizing
- Model quantization for faster inference
- Caching of user data
- Lazy loading of components
- Database indexing on frequently queried fields

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support & Contact

For support, questions, or feedback:

- Email: info@autismdetection.com
- Phone: 1-800-AUTISM-1
- Emergency: 911

## References

- Autism Spectrum Disorder: https://www.cdc.gov/ncbddd/autism/
- Early Intervention: https://www.nichcy.org/
- Facial Expression Recognition: https://arxiv.org/
- Deep Learning for Medical Imaging: https://www.tensorflow.org/

---

**Last Updated**: April 16, 2026

**Version**: 1.1.0
