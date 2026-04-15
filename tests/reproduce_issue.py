import tensorflow as tf
from tensorflow import keras
import os

model_path = os.path.join('ml_model', 'autism_model.h5')
print(f"Attempting to load model from {model_path}")

try:
    model = keras.models.load_model(model_path)
    print("Model loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
