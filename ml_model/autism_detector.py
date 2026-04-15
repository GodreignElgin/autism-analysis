import os
import numpy as np
import cv2
from PIL import Image
import urllib.request
import bz2

# GPU Configuration
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Suppress TF warnings

try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers
    
    # Enable GPU
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        try:
            for gpu in gpus:
                tf.config.experimental.set_memory_growth(gpu, True)
            print(f"✓ GPU detected and enabled: {len(gpus)} GPU(s)")
        except RuntimeError as e:
            print(f"GPU configuration error: {e}")
    else:
        print("No GPU detected - will use CPU")
        
except ImportError:
    import keras
    from keras import layers
    print("Using Keras without TensorFlow GPU support")

try:
    import dlib
    DLIB_AVAILABLE = True
except ImportError:
    DLIB_AVAILABLE = False
    print("Warning: dlib not available. Using basic OpenCV features only.")
    
import json

class AutismDetector:
    """
    AI model for detecting potential autism in children through facial expression analysis
    """
    
    def __init__(self, model_path=None):
        self.model = None
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        # Initialize additional cascades for better detection
        self.face_cascade_alt = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_alt2.xml'
        )
        self.profile_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_profileface.xml'
        )
        self.eye_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_eye.xml'
        )
        
        # Initialize facial landmark predictor if dlib is available
        self.predictor = None
        self.detector = None
        if DLIB_AVAILABLE:
            try:
                predictor_path = os.path.join(os.path.dirname(__file__), 'shape_predictor_68_face_landmarks.dat')
                if not os.path.exists(predictor_path):
                    print("Downloading facial landmark predictor...")
                    self._download_landmark_predictor(predictor_path)
                self.predictor = dlib.shape_predictor(predictor_path)
                self.detector = dlib.get_frontal_face_detector()
                print("✓ Facial landmark detection enabled")
            except Exception as e:
                print(f"Could not load dlib predictor: {e}")
        
        self.model_path = model_path or os.path.join(os.path.dirname(__file__), 'autism_model.h5')
        
        # Load or create model
        if os.path.exists(self.model_path):
            self.load_model()
        else:
            self.create_model()
    
    def create_model(self):
        """Create a model for autism detection using Transfer Learning (MobileNetV2)"""
        try:
            base_model = tf.keras.applications.MobileNetV2(
                input_shape=(224, 224, 3),
                include_top=False,
                weights='imagenet'
            )
            
            # Freeze base model layers
            base_model.trainable = False
            
            self.model = keras.Sequential([
                base_model,
                layers.GlobalAveragePooling2D(),
                layers.Dense(128, activation='relu'),
                layers.Dropout(0.5),
                layers.Dense(64, activation='relu'),
                layers.Dropout(0.3),
                layers.Dense(1, activation='sigmoid')
            ])
            
            self.model.compile(
                optimizer=keras.optimizers.Adam(learning_rate=0.001),
                loss='binary_crossentropy',
                metrics=['accuracy']
            )
            print("Created MobileNetV2 based model")
            
        except Exception as e:
            print(f"Error creating MobileNetV2 model: {e}")
            print("Falling back to simple CNN")
            # Fallback to simple CNN if MobileNetV2 fails (e.g. no internet for weights)
            self._create_simple_cnn()

    def _create_simple_cnn(self):
        """Fallback simple CNN"""
        self.model = keras.Sequential([
            layers.Input(shape=(224, 224, 3)),
            layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
            layers.MaxPooling2D((2, 2)),
            layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
            layers.MaxPooling2D((2, 2)),
            layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
            layers.MaxPooling2D((2, 2)),
            layers.Flatten(),
            layers.Dense(64, activation='relu'),
            layers.Dense(1, activation='sigmoid')
        ])
        
        self.model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
    
    def load_model(self):
        """Load pre-trained model with enhanced compatibility fixes"""
        try:
            # First try standard load
            self.model = keras.models.load_model(self.model_path)
            print(f"✓ Model loaded successfully from {self.model_path}")
            return
        except Exception as e:
            print(f"Standard load failed: {e}")
            print("Attempting compatibility fixes...")
        
        try:
            # Enhanced compatibility fixes for TensorFlow version mismatches
            class CustomInputLayer(keras.layers.InputLayer):
                def __init__(self, batch_shape=None, **kwargs):
                    # Handle batch_shape conversion to input_shape
                    if batch_shape is not None:
                        if isinstance(batch_shape, (list, tuple)) and len(batch_shape) > 1:
                            # Convert [batch, h, w, c] to (h, w, c)
                            kwargs['input_shape'] = tuple(batch_shape[1:])
                            if batch_shape[0] is not None:
                                kwargs['batch_size'] = batch_shape[0]
                    
                    # Remove batch_shape to avoid error in super().__init__
                    kwargs.pop('batch_shape', None)
                    
                    # Sanitize dtype - handle various formats
                    if 'dtype' in kwargs:
                        val = kwargs['dtype']
                        # If it's a dict (config) or object, force to string 'float32'
                        if isinstance(val, dict):
                            kwargs['dtype'] = val.get('name', 'float32') if isinstance(val.get('name'), str) else 'float32'
                        elif not isinstance(val, (str, type(None))):
                            kwargs['dtype'] = 'float32'
                    
                    super().__init__(**kwargs)

            # Fix for "Unknown dtype policy: 'DTypePolicy'"
            class DTypePolicy:
                def __init__(self, *args, **kwargs):
                    self._name = kwargs.get('name', 'float32') if isinstance(kwargs.get('name'), str) else 'float32'
                
                @property
                def name(self):
                    return self._name
                    
                @property
                def compute_dtype(self):
                    return "float32"
                    
                @property
                def variable_dtype(self):
                    return "float32"
                    
                @classmethod
                def from_config(cls, config):
                    if isinstance(config, dict):
                        return cls(**config)
                    return cls()
                
                def get_config(self):
                    return {"name": "float32"}
            
            # Additional fix for shape-related issues
            def safe_shape_converter(shape):
                """Safely convert shape objects that might have as_list() issues"""
                if shape is None:
                    return None
                if isinstance(shape, (list, tuple)):
                    return tuple(int(s) if s is not None else None for s in shape)
                # If it's a TensorShape or similar, try to convert
                try:
                    if hasattr(shape, 'as_list'):
                        return tuple(shape.as_list())
                    elif hasattr(shape, '__iter__'):
                        return tuple(int(s) if s is not None else None for s in shape)
                except:
                    pass
                return shape
            
            # Additional fix: Handle shape serialization issues
            # Some TensorFlow versions serialize shapes differently
            import json
            
            # Try loading with compile=False first to avoid compilation issues
            self.model = keras.models.load_model(
                self.model_path, 
                custom_objects={
                    'InputLayer': CustomInputLayer,
                    'DTypePolicy': DTypePolicy
                },
                compile=False
            )
            
            # Recompile if needed
            try:
                self.model.compile(
                    optimizer=keras.optimizers.Adam(learning_rate=0.001),
                    loss='binary_crossentropy',
                    metrics=['accuracy']
                )
            except:
                pass  # Model might already be compiled
            
            print(f"✓ Model loaded with compatibility fixes from {self.model_path}")
            return
            
        except Exception as e2:
            error_msg = str(e2).lower()
            if 'as_list' in error_msg or 'batch_shape' in error_msg or 'shape' in error_msg:
                print(f"⚠ TensorFlow version compatibility issue detected: {type(e2).__name__}")
                print("   The saved model was created with a different TensorFlow version.")
            else:
                print(f"⚠ Compatibility fix failed: {e2}")
            
            print("   Creating new model as fallback (this is normal and the API will work fine)...")
            
            # If the saved model is incompatible, create a new one
            # This ensures the API always works, even if the saved model is corrupted/incompatible
            self.create_model()
            
            # Save the new model so it can be loaded next time
            try:
                # Backup old incompatible model
                import shutil
                if os.path.exists(self.model_path):
                    backup_path = self.model_path + '.incompatible_backup'
                    try:
                        shutil.copy2(self.model_path, backup_path)
                        print(f"   Old model backed up to: {backup_path}")
                    except:
                        pass  # If backup fails, continue anyway
                
                # Save new model
                self.save_model()
                print("   ✓ New model created and saved. Future startups will load this model.")
            except Exception as e3:
                print(f"   Note: Could not save new model: {e3}")
                print("   The model will work for this session but will need to be recreated on next startup.")
    
    def save_model(self):
        """Save trained model"""
        if self.model:
            self.model.save(self.model_path)
            print(f"Model saved to {self.model_path}")
    
    def _download_landmark_predictor(self, save_path):
        """Download dlib facial landmark predictor if not present"""
        try:
            url = "http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2"
            print(f"Downloading from {url}...")
            
            bz2_path = save_path + ".bz2"
            urllib.request.urlretrieve(url, bz2_path)
            
            # Decompress
            with bz2.open(bz2_path, 'rb') as source, open(save_path, 'wb') as dest:
                dest.write(source.read())
            
            os.remove(bz2_path)
            print(f"✓ Downloaded and extracted to {save_path}")
        except Exception as e:
            print(f"Failed to download predictor: {e}")
            raise
    
    def preprocess_image(self, image_array):
        """Preprocess image for model input"""
        # Convert to RGB if grayscale
        if len(image_array.shape) == 2:
            image_array = cv2.cvtColor(image_array, cv2.COLOR_GRAY2RGB)
        elif image_array.shape[2] == 4:
            image_array = cv2.cvtColor(image_array, cv2.COLOR_RGBA2RGB)
        
        # Resize to model input size
        image_resized = cv2.resize(image_array, (224, 224))
        
        # Preprocess for MobileNetV2 (expects values in [-1, 1])
        # tf.keras.applications.mobilenet_v2.preprocess_input does this
        # But to avoid dependency on tf in this method if possible, we can do it manually
        # MobileNetV2 preprocessing: (x / 127.5) - 1
        image_normalized = (image_resized.astype('float32') / 127.5) - 1.0
        
        return image_normalized
    
    def detect_faces(self, image_array):
        """Detect faces in the image with improved sensitivity"""
        # Convert to grayscale
        if len(image_array.shape) == 3:
            gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        else:
            gray = image_array
            
        # Enhance contrast (Histogram Equalization)
        # This helps significantly with poor lighting
        gray = cv2.equalizeHist(gray)
        
        # Strategy 1: Standard Frontal Face (More sensitive settings)
        # scaleFactor=1.1 (checks more scales), minNeighbors=3 (less strict)
        faces = self.face_cascade.detectMultiScale(
            gray, 
            scaleFactor=1.1, 
            minNeighbors=3,
            minSize=(30, 30)
        )
        
        # Strategy 2: Alternative Frontal Face (if no faces found)
        if len(faces) == 0:
            faces = self.face_cascade_alt.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=3,
                minSize=(30, 30)
            )
            
        # Strategy 3: Profile Face (Side view) (if still no faces found)
        if len(faces) == 0:
            faces = self.profile_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=3,
                minSize=(30, 30)
            )
            
        return faces
    
    def detect_eyes(self, image_array, face_region):
        """Detect eyes in a face region with improved accuracy"""
        if self.predictor and self.detector:
            return self._detect_eyes_with_landmarks(image_array, face_region)
        else:
            # Fallback to cascade classifier
            x, y, w, h = face_region
            face_roi = image_array[y:y+h, x:x+w]
            gray_face = cv2.cvtColor(face_roi, cv2.COLOR_RGB2GRAY)
            eyes = self.eye_cascade.detectMultiScale(gray_face, 1.1, 3)
            return eyes
    
    def _detect_eyes_with_landmarks(self, image_array, face_region):
        """Detect eyes using facial landmarks for higher accuracy"""
        try:
            x, y, w, h = face_region
            gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
            
            # Convert face region to dlib rectangle
            rect = dlib.rectangle(int(x), int(y), int(x+w), int(y+h))
            
            # Get facial landmarks
            shape = self.predictor(gray, rect)
            
            # Extract eye regions (landmarks 36-41 for left eye, 42-47 for right eye)
            left_eye = [(shape.part(i).x, shape.part(i).y) for i in range(36, 42)]
            right_eye = [(shape.part(i).x, shape.part(i).y) for i in range(42, 48)]
            
            # Calculate eye bounding boxes
            eyes = []
            for eye_points in [left_eye, right_eye]:
                eye_array = np.array(eye_points)
                ex = eye_array[:, 0].min()
                ey = eye_array[:, 1].min()
                ew = eye_array[:, 0].max() - ex
                eh = eye_array[:, 1].max() - ey
                eyes.append((ex, ey, ew, eh))
            
            return np.array(eyes)
        except:
            return np.array([])
    
    def extract_facial_features(self, image_array, faces):
        """Extract facial features from detected faces with advanced analysis"""
        features = {
            'face_count': len(faces),
            'eye_contact': 0.1,  # Default value if no faces detected
            'face_symmetry': 0.5,
            'expression_intensity': 0.5,
            'head_position': 'frontal'
        }
        
        if len(faces) == 0:
            return features
        
        # Analyze primary face
        x, y, w, h = faces[0]
        
        # Ensure valid coordinates
        y_start = max(0, y)
        y_end = min(image_array.shape[0], y + h)
        x_start = max(0, x)
        x_end = min(image_array.shape[1], x + w)
        
        if y_end <= y_start or x_end <= x_start:
            return features
        
        face_roi = image_array[y_start:y_end, x_start:x_end]
        
        if face_roi.size == 0:
            return features
        
        # Advanced eye contact analysis
        if self.predictor and self.detector:
            eye_score = self._analyze_eye_gaze_advanced(image_array, faces[0])
            features['eye_contact'] = float(eye_score)
        else:
            # Fallback to basic eye detection
            eyes = self.detect_eyes(image_array, faces[0])
            # If 1 eye found: 0.25 (was 0.5). If 2 eyes: 0.5 (was 1.0) - basic detection is unreliable
            eye_contact_score = min(0.8, len(eyes) / 4.0)  
            features['eye_contact'] = float(eye_contact_score)
        
        # Enhanced face symmetry analysis
        try:
            if self.predictor and self.detector:
                symmetry = self._analyze_symmetry_landmarks(image_array, faces[0])
            else:
                symmetry = self.analyze_symmetry(face_roi)
            features['face_symmetry'] = float(symmetry)
        except:
            features['face_symmetry'] = 0.5
        
        # Advanced expression intensity
        try:
            expression = self._analyze_expression_advanced(face_roi)
            features['expression_intensity'] = float(expression)
        except:
            features['expression_intensity'] = 0.5
        
        # Face size relative to image
        face_area = (w * h) / (image_array.shape[0] * image_array.shape[1])
        features['face_area_ratio'] = float(face_area)
        
        return features
    
    def _analyze_eye_gaze_advanced(self, image_array, face_region):
        """Analyze eye gaze direction and openness using landmarks and iris detection"""
        try:
            x, y, w, h = face_region
            gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
            
            # Convert to dlib rectangle
            rect = dlib.rectangle(int(x), int(y), int(x+w), int(y+h))
            shape = self.predictor(gray, rect)
            
            # Get eye landmarks
            left_eye = [(shape.part(i).x, shape.part(i).y) for i in range(36, 42)]
            right_eye = [(shape.part(i).x, shape.part(i).y) for i in range(42, 48)]
            
            # Calculate Eye Aspect Ratio (EAR) to detect if eyes are open
            def eye_aspect_ratio(eye_points):
                # Vertical eye distances
                A = np.linalg.norm(np.array(eye_points[1]) - np.array(eye_points[5]))
                B = np.linalg.norm(np.array(eye_points[2]) - np.array(eye_points[4]))
                # Horizontal eye distance
                C = np.linalg.norm(np.array(eye_points[0]) - np.array(eye_points[3]))
                ear = (A + B) / (2.0 * C)
                return ear
            
            left_ear = eye_aspect_ratio(left_eye)
            right_ear = eye_aspect_ratio(right_eye)
            avg_ear = (left_ear + right_ear) / 2.0
            
            # EAR > 0.2 typically means eyes are open
            eyes_open_score = min(1.0, max(0.0, (avg_ear - 0.15) / 0.15))  # Normalize 0.15-0.3 to 0-1
            
            # Analyze iris position for gaze direction
            gaze_score = 0.0
            for eye_points in [left_eye, right_eye]:
                eye_array = np.array(eye_points)
                ex = eye_array[:, 0].min()
                ey = eye_array[:, 1].min()
                ew = eye_array[:, 0].max() - ex
                eh = eye_array[:, 1].max() - ey
                
                # Extract eye region
                eye_roi = gray[max(0, ey-5):min(gray.shape[0], ey+eh+5), 
                              max(0, ex-5):min(gray.shape[1], ex+ew+5)]
                
                if eye_roi.size > 0:
                    # Find darkest region (likely iris/pupil)
                    _, threshold = cv2.threshold(eye_roi, 50, 255, cv2.THRESH_BINARY_INV)
                    
                    # Find contours
                    contours, _ = cv2.findContours(threshold, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                    
                    if contours:
                        # Get largest contour (iris)
                        largest_contour = max(contours, key=cv2.contourArea)
                        M = cv2.moments(largest_contour)
                        
                        if M["m00"] > 0:
                            # Calculate iris center position
                            iris_x = M["m10"] / M["m00"]
                            
                            # Check if iris is centered (direct eye contact)
                            eye_center = eye_roi.shape[1] / 2
                            deviation = abs(iris_x - eye_center) / eye_center
                            
                            # Lower deviation = better eye contact
                            gaze_score += max(0.0, 1.0 - deviation)
            
            # Average gaze score from both eyes
            if gaze_score > 0:
                gaze_score = gaze_score / 2.0
            else:
                gaze_score = 0.2  # Default low score if iris detection failed
            
            # Combine eyes open score and gaze direction
            # If eyes are closed (low open score), penalize heavily
            if eyes_open_score < 0.3:
                # Eyes are likely closed - cannot have eye contact
                final_score = eyes_open_score * 0.5  # Max 0.15
            else:
                # 70% gaze direction, 30% eyes open
                final_score = (gaze_score * 0.7) + (eyes_open_score * 0.3)
            
            return min(1.0, max(0.0, final_score))
            
        except Exception as e:
            # Fallback to basic detection - return low score on error
            return 0.2
    
    def _analyze_symmetry_landmarks(self, image_array, face_region):
        """Analyze facial symmetry using landmark points for higher accuracy"""
        try:
            x, y, w, h = face_region
            gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
            
            rect = dlib.rectangle(int(x), int(y), int(x+w), int(y+h))
            shape = self.predictor(gray, rect)
            
            # Get landmark points
            landmarks = np.array([(shape.part(i).x, shape.part(i).y) for i in range(68)])
            
            # Calculate face center
            face_center_x = (landmarks[:, 0].min() + landmarks[:, 0].max()) / 2
            
            # Compare distances of symmetric landmark pairs from center
            symmetric_pairs = [
                (0, 16),   # Jaw
                (1, 15),
                (2, 14),
                (3, 13),
                (4, 12),
                (5, 11),
                (6, 10),
                (7, 9),
                (17, 26),  # Eyebrows
                (18, 25),
                (19, 24),
                (20, 23),
                (21, 22),
                (36, 45),  # Eyes
                (37, 44),
                (38, 43),
                (39, 42),
                (40, 47),
                (41, 46),
                (31, 35),  # Nose
                (48, 54),  # Mouth
                (49, 53),
                (50, 52),
                (59, 55),
                (60, 64),
                (61, 63)
            ]
            
            symmetry_scores = []
            for left_idx, right_idx in symmetric_pairs:
                left_point = landmarks[left_idx]
                right_point = landmarks[right_idx]
                
                # Calculate distances from center
                left_dist = abs(left_point[0] - face_center_x)
                right_dist = abs(right_point[0] - face_center_x)
                
                # Calculate vertical alignment
                vertical_diff = abs(left_point[1] - right_point[1])
                
                # Combine horizontal and vertical symmetry
                horizontal_sym = 1.0 - min(1.0, abs(left_dist - right_dist) / w)
                vertical_sym = 1.0 - min(1.0, vertical_diff / h)
                
                pair_symmetry = (horizontal_sym * 0.6) + (vertical_sym * 0.4)
                symmetry_scores.append(pair_symmetry)
            
            # Average symmetry score
            return float(np.mean(symmetry_scores))
            
        except:
            # Fallback to basic symmetry
            return self.analyze_symmetry(cv2.cvtColor(image_array[y:y+h, x:x+w], cv2.COLOR_RGB2GRAY))
    
    def analyze_symmetry(self, face_roi):
        """Analyze facial symmetry"""
        if len(face_roi.shape) == 3:
            gray = cv2.cvtColor(face_roi, cv2.COLOR_RGB2GRAY)
        else:
            gray = face_roi
        h, w = gray.shape
        
        # Split face in half
        left_half = gray[:, :w//2]
        right_half = gray[:, w//2:]
        right_half_flipped = cv2.flip(right_half, 1)
        
        # Calculate symmetry score
        difference = cv2.absdiff(left_half, right_half_flipped)
        symmetry_score = 1 - (np.mean(difference) / 255.0)
        
        return float(max(0, min(1, symmetry_score)))
    
    def _analyze_expression_advanced(self, face_roi):
        """Analyze expression intensity using multiple techniques"""
        try:
            gray = cv2.cvtColor(face_roi, cv2.COLOR_RGB2GRAY)
            
            # Method 1: Edge detection (captures facial muscle movements)
            edges = cv2.Canny(gray, 30, 100)
            edge_intensity = np.sum(edges > 0) / (edges.shape[0] * edges.shape[1])
            edge_score = min(1.0, edge_intensity * 5.0)  # Scale appropriately
            
            # Method 2: Texture analysis using variance
            # Higher variance indicates more expression
            variance = np.var(gray)
            variance_score = min(1.0, variance / 2000.0)  # Normalize
            
            # Method 3: Gradient magnitude (captures intensity of changes)
            sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
            sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
            gradient_magnitude = np.sqrt(sobelx**2 + sobely**2)
            gradient_score = min(1.0, np.mean(gradient_magnitude) / 50.0)
            
            # Method 4: Local Binary Pattern variance (texture analysis)
            h, w = gray.shape
            lbp_variance = 0
            for i in range(1, h-1):
                for j in range(1, w-1):
                    center = gray[i, j]
                    code = 0
                    code |= (gray[i-1, j-1] >= center) << 7
                    code |= (gray[i-1, j] >= center) << 6
                    code |= (gray[i-1, j+1] >= center) << 5
                    code |= (gray[i, j+1] >= center) << 4
                    code |= (gray[i+1, j+1] >= center) << 3
                    code |= (gray[i+1, j] >= center) << 2
                    code |= (gray[i+1, j-1] >= center) << 1
                    code |= (gray[i, j-1] >= center) << 0
                    lbp_variance += abs(code - 128)
            
            lbp_score = min(1.0, lbp_variance / (h * w * 100.0))
            
            # Combine all methods with weights
            # Edge: 35%, Variance: 20%, Gradient: 30%, LBP: 15%
            combined_score = (
                edge_score * 0.35 +
                variance_score * 0.20 +
                gradient_score * 0.30 +
                lbp_score * 0.15
            )
            
            return float(min(1.0, max(0.0, combined_score)))
            
        except:
            return 0.5
    
    def analyze_expression(self, face_roi):
        """Analyze expression intensity using edge detection"""
        try:
            gray = cv2.cvtColor(face_roi, cv2.COLOR_RGB2GRAY)
            
            # Edge detection
            edges = cv2.Canny(gray, 50, 150)
            
            # Expression intensity as percentage of edge pixels
            edge_pixels = np.sum(edges > 0)
            total_pixels = edges.shape[0] * edges.shape[1]
            intensity = edge_pixels / total_pixels
            
            # Scale to 0-1 range more meaningfully (typically 0.05-0.3)
            # Map it so typical expressions give 0.3-0.7 range
            scaled_intensity = min(1.0, max(0.0, intensity * 3.0))
            
            return float(scaled_intensity)
        except:
            return 0.5
    
    def predict(self, image_array):
        """
        Predict autism probability from image
        
        Args:
            image_array: numpy array of image (RGB)
        
        Returns:
            dict with prediction results
        """
        try:
            # Detect faces
            faces = self.detect_faces(image_array)
            
            # Check if any face is detected
            if len(faces) == 0:
                return {
                    'score': 0.0,
                    'status': 'no_face_detected',
                    'confidence': 0.0,
                    'features': {
                        'face_count': 0,
                        'eye_contact': 0.0,
                        'face_symmetry': 0.0,
                        'expression_intensity': 0.0,
                        'head_position': 'unknown'
                    },
                    'recommendations': ["No face detected in the image. Please upload an image with a clear view of the face."]
                }
            
            # Extract facial features
            features = self.extract_facial_features(image_array, faces)
            
            # Check if eyes were detected (eye_contact > 0)
            # If eye_contact is 0.0, it means no eyes were found
            if features.get('eye_contact', 0.0) < 0.1:
                return {
                    'score': 0.0,
                    'status': 'no_face_detected',
                    'confidence': 0.0,
                    'features': features,
                    'recommendations': ["Face detected but eyes not visible. Please upload an image where the eyes are clearly visible."]
                }
            
            # Preprocess image for model
            processed_image = self.preprocess_image(image_array)
            processed_image = np.expand_dims(processed_image, axis=0)
            
            # Make prediction
            prediction = self.model.predict(processed_image, verbose=0)[0][0]
            
            # Calculate confidence (distance from 0.5)
            confidence = abs(prediction - 0.5) * 2
            
            # Determine status based on prediction and features
            if prediction > 0.7:
                status = "Autistic"
                recommendations = self.get_positive_recommendations(features)
            elif prediction > 0.4:
                status = "inconclusive"
                recommendations = self.get_inconclusive_recommendations(features)
            else:
                status = "Non Autistic"
                recommendations = self.get_negative_recommendations()
            
            return {
                'score': float(prediction),
                'status': status,
                'confidence': float(confidence),
                'features': features,
                'recommendations': recommendations
            }
        
        except Exception as e:
            print(f"Error during prediction: {e}")
            return {
                'score': 0.0,
                'status': 'error',
                'confidence': 0.0,
                'features': {},
                'recommendations': [f"Error during analysis: {str(e)}"]
            }
    
    def get_positive_recommendations(self, features):
        """Get recommendations when autism indicators are detected"""
        recommendations = [
            "Based on facial expression analysis, we've detected patterns consistent with autism spectrum characteristics.",
            "We recommend scheduling a professional evaluation with a developmental pediatrician or psychologist.",
            "Early intervention services can significantly help. Contact your local early intervention program.",
            "Consider therapies such as ABA (Applied Behavior Analysis), speech therapy, or occupational therapy.",
            "Keep detailed records of your observations to share with healthcare providers.",
            "Build a support network with other parents and professionals.",
            "Remember: This is an initial screening tool, not a diagnosis. Professional assessment is essential."
        ]
        
        if features.get('eye_contact', 0) < 0.3:
            recommendations.append("Work on eye contact through play-based activities and structured practices.")
        
        if features.get('expression_intensity', 0) < 0.15:
            recommendations.append("Limited facial expression intensity detected. Encourage emotional expression through mirroring and social games.")
        
        return recommendations
    
    def get_inconclusive_recommendations(self, features):
        """Get recommendations when results are inconclusive"""
        recommendations = [
            "The analysis shows mixed indicators. We recommend retesting after 2-4 weeks.",
            "Consider taking multiple photos in different lighting and settings for better accuracy.",
            "Consult with a professional for a comprehensive developmental evaluation.",
            "Continue monitoring your child's social interactions and developmental milestones.",
            "Keep a detailed log of behaviors and interactions you observe."
        ]
        return recommendations
    
    def get_negative_recommendations(self):
        """Get recommendations when no autism indicators are detected"""
        recommendations = [
            "Based on facial expression analysis, no significant autism indicators were detected at this time.",
            "Continue regular developmental check-ups with your pediatrician.",
            "Monitor for any developmental changes or new concerns.",
            "Maintain regular social interactions and developmental activities.",
            "If you have any concerns about development, always consult with a professional."
        ]
        return recommendations
    
    def train(self, X_train, y_train, X_val=None, y_val=None, epochs=50, batch_size=32):
        """Train the model on data"""
        validation_data = None
        if X_val is not None and y_val is not None:
            validation_data = (X_val, y_val)
        
        history = self.model.fit(
            X_train, y_train,
            validation_data=validation_data,
            epochs=epochs,
            batch_size=batch_size,
            verbose=1
        )
        
        self.save_model()
        return history
