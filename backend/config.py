"""
Configuration file for Autism Detection Platform
"""

import os
from datetime import timedelta

class Config:
    """Base configuration"""
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///autism_detection.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=30)
    
    # File Upload
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'bmp'}
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    
    # ML Model
    MODEL_PATH = os.getenv('MODEL_PATH', 'ml_model/autism_model.h5')
    TABULAR_MODEL_PATH = os.getenv('TABULAR_MODEL_PATH', 'model/best_model.pkl')
    IMAGE_MODEL_WEIGHT = float(os.getenv('IMAGE_MODEL_WEIGHT', '0.7'))
    TABULAR_MODEL_WEIGHT = float(os.getenv('TABULAR_MODEL_WEIGHT', '0.3'))
    
    # AI Chatbot Configuration (Google Gemini)
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    # Use PostgreSQL in production
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'postgresql://user:password@localhost/autism_detection'
    )

# Get configuration based on environment
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

def get_config(env=None):
    """Get configuration object"""
    if env is None:
        env = os.getenv('FLASK_ENV', 'development')
    
    config_class = config.get(env, config['default'])
    
    # Validate production configuration only when it's actually selected
    if config_class == ProductionConfig:
        if not os.getenv('JWT_SECRET_KEY'):
            raise ValueError('JWT_SECRET_KEY environment variable must be set in production')
    
    return config_class
