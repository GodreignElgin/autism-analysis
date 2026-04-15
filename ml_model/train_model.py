#!/usr/bin/env python3
"""
Data preprocessing script for training the autism detection model
"""

import numpy as np
import cv2
import os
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import pickle

def load_images_from_folder(folder_path, img_size=(224, 224)):
    """
    Load images from folder
    
    Expected folder structure:
    dataset/
    ├── autistic/
    │   ├── image1.jpg
    │   └── image2.jpg
    └── non_autistic/
        ├── image1.jpg
        └── image2.jpg
    """
    images = []
    labels = []
    
    if not os.path.exists(folder_path):
        print(f"Folder not found: {folder_path}")
        return None, None
    
    print(f"Scanning dataset at: {folder_path}")
    
    # Load autistic samples (positive class = 1)
    autistic_path = os.path.join(folder_path, 'autistic')
    if os.path.exists(autistic_path):
        print(f"Loading autistic samples from {autistic_path}...")
        count = 0
        for filename in os.listdir(autistic_path):
            if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp')):
                try:
                    img_path = os.path.join(autistic_path, filename)
                    img = cv2.imread(img_path)
                    if img is not None:
                        img = cv2.resize(img, img_size)
                        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                        images.append(img)
                        labels.append(1)  # Autistic
                        count += 1
                    else:
                        print(f"Warning: Could not read image {filename}")
                except Exception as e:
                    print(f"Error loading {filename}: {e}")
        print(f"Loaded {count} autistic samples")
    else:
        print(f"Warning: 'autistic' folder not found in {folder_path}")
    
    # Load non_autistic samples (negative class = 0)
    non_autistic_path = os.path.join(folder_path, 'non_autistic')
    if os.path.exists(non_autistic_path):
        print(f"Loading non_autistic samples from {non_autistic_path}...")
        count = 0
        for filename in os.listdir(non_autistic_path):
            if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp')):
                try:
                    img_path = os.path.join(non_autistic_path, filename)
                    img = cv2.imread(img_path)
                    if img is not None:
                        img = cv2.resize(img, img_size)
                        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                        images.append(img)
                        labels.append(0)  # Non-Autistic
                        count += 1
                    else:
                        print(f"Warning: Could not read image {filename}")
                except Exception as e:
                    print(f"Error loading {filename}: {e}")
        print(f"Loaded {count} non_autistic samples")
    else:
        print(f"Warning: 'non_autistic' folder not found in {folder_path}")
    
    if len(images) == 0:
        print("No images found in dataset!")
        return None, None
    
    return np.array(images), np.array(labels)

def preprocess_images(images):
    """Normalize image pixel values for MobileNetV2"""
    # MobileNetV2 expects inputs in range [-1, 1]
    return (images.astype('float32') / 127.5) - 1.0

def create_dataset(dataset_path='../dataset', test_size=0.2, val_size=0.1):
    """
    Create training, validation, and test datasets
    
    Usage:
    X_train, X_val, X_test, y_train, y_val, y_test = create_dataset()
    """
    
    # Handle absolute path or relative path
    if not os.path.isabs(dataset_path):
        # Assuming script is in ml_model/, dataset is in root/dataset
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        dataset_path = os.path.join(base_dir, 'dataset')
    
    print(f"Loading images from {dataset_path}...")
    X, y = load_images_from_folder(dataset_path)
    
    if X is None:
        print("Failed to load images. Please ensure dataset structure is correct:")
        print("dataset/")
        print("├── autistic/")
        print("│   └── [images]")
        print("└── non_autistic/")
        print("    └── [images]")
        return None
    
    print(f"Total loaded: {len(X)} images")
    print(f"Autistic samples: {np.sum(y)}")
    print(f"Non-autistic samples: {len(y) - np.sum(y)}")
    
    # Preprocess images
    print("Preprocessing images...")
    X = preprocess_images(X)
    
    # Split into train+val and test
    print("Splitting dataset...")
    X_temp, X_test, y_temp, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42, stratify=y
    )
    
    # Split train+val into train and val
    val_size_adjusted = val_size / (1 - test_size)
    X_train, X_val, y_train, y_val = train_test_split(
        X_temp, y_temp, test_size=val_size_adjusted, random_state=42, stratify=y_temp
    )
    
    print(f"\nDataset split:")
    print(f"Training set: {len(X_train)} samples")
    print(f"Validation set: {len(X_val)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    return X_train, X_val, X_test, y_train, y_val, y_test

def train_model_script():
    """Script to train the model"""
    
    import sys
    # Add current directory to path to import autism_detector
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from autism_detector import AutismDetector
    
    # Create dataset
    result = create_dataset()
    if result is None:
        print("Cannot proceed with training without dataset")
        return
    
    X_train, X_val, X_test, y_train, y_val, y_test = result
    
    # Initialize model
    print("\nInitializing model...")
    detector = AutismDetector()
    
    # Train model
    print("Training model...")
    # Use early stopping to prevent overfitting
    early_stopping = keras.callbacks.EarlyStopping(
        monitor='val_loss',
        patience=10,
        restore_best_weights=True
    )
    
    history = detector.model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=50,
        batch_size=32,
        callbacks=[early_stopping],
        verbose=1
    )
    
    # Evaluate on test set
    print("\nEvaluating on test set...")
    test_loss, test_accuracy = detector.model.evaluate(X_test, y_test, verbose=0)
    print(f"Test Accuracy: {test_accuracy*100:.2f}%")
    print(f"Test Loss: {test_loss:.4f}")
    
    # Save training history
    history_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'training_history.pkl')
    with open(history_path, 'wb') as f:
        pickle.dump(history.history, f)
    
    print("\nModel training complete!")
    # Ensure model is saved
    detector.save_model()

if __name__ == '__main__':
    print("=" * 50)
    print("Autism Detection Model - Training Pipeline")
    print("=" * 50)
    
    # Try to load and train
    try:
        # Check for TensorFlow/Keras
        try:
            import tensorflow as tf
            from tensorflow import keras
            print(f"TensorFlow version: {tf.__version__}")
            gpus = tf.config.list_physical_devices('GPU')
            print(f"GPUs available: {len(gpus)}")
        except ImportError:
            print("Warning: TensorFlow not found or import error.")
            
        train_model_script()
    except Exception as e:
        print(f"Error during training: {e}")
        import traceback
        traceback.print_exc()
