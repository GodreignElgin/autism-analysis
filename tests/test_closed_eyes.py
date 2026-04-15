import sys
import os
import numpy as np
import cv2
from unittest.mock import MagicMock, patch

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Mock dlib before importing autism_detector
mock_dlib = MagicMock()
sys.modules['dlib'] = mock_dlib

from ml_model.autism_detector import AutismDetector

class MockPoint:
    def __init__(self, x, y):
        self.x = x
        self.y = y

class MockShape:
    def __init__(self, landmarks):
        self.landmarks = landmarks
    
    def part(self, i):
        return self.landmarks[i]

def create_closed_eye_landmarks():
    # Create landmarks for a face with CLOSED eyes
    # Landmarks 0-67
    landmarks = [MockPoint(0, 0)] * 68
    
    # Left eye (36-41)
    # Closed: top and bottom points are close
    # 36 (left corner), 39 (right corner)
    # 37, 38 (top)
    # 40, 41 (bottom)
    
    base_x = 100
    base_y = 100
    width = 30
    
    # 36: (100, 100)
    landmarks[36] = MockPoint(base_x, base_y)
    # 39: (130, 100)
    landmarks[39] = MockPoint(base_x + width, base_y)
    
    # Top points (slightly above) - very close to center line for closed eyes
    landmarks[37] = MockPoint(base_x + 10, base_y - 1)
    landmarks[38] = MockPoint(base_x + 20, base_y - 1)
    
    # Bottom points (slightly below)
    landmarks[41] = MockPoint(base_x + 10, base_y + 1)
    landmarks[40] = MockPoint(base_x + 20, base_y + 1)
    
    # Right eye (42-47) - similar structure
    base_x_r = 200
    landmarks[42] = MockPoint(base_x_r, base_y)
    landmarks[45] = MockPoint(base_x_r + width, base_y)
    landmarks[43] = MockPoint(base_x_r + 10, base_y - 1)
    landmarks[44] = MockPoint(base_x_r + 20, base_y - 1)
    landmarks[47] = MockPoint(base_x_r + 10, base_y + 1)
    landmarks[46] = MockPoint(base_x_r + 20, base_y + 1)
    
    return landmarks

def test_closed_eyes_score():
    print("=== Testing Closed Eyes Score ===\n")
    
    # Mock load_model and create_model BEFORE initializing to avoid heavy TF loading
    # Also mock _download_landmark_predictor to avoid downloading
    with patch.object(AutismDetector, 'load_model', return_value=None), \
         patch.object(AutismDetector, 'create_model', return_value=None), \
         patch.object(AutismDetector, '_download_landmark_predictor', return_value=None):
        detector = AutismDetector()
        # Manually set predictor/detector since we mocked init parts or dlib might be mocked
        detector.predictor = MagicMock()
        detector.detector = MagicMock()
    
    # Mock predictor
    detector.predictor = MagicMock()
    detector.detector = MagicMock() # Just to ensure checks pass
    
    # Setup mock return value
    landmarks = create_closed_eye_landmarks()
    detector.predictor.return_value = MockShape(landmarks)
    
    # Create dummy image and face region
    image = np.zeros((300, 300, 3), dtype=np.uint8)
    # Fill eye regions with "iris" color to simulate potential gaze detection if we didn't have closed eyes
    # But since we are mocking landmarks, the gaze detection logic (which uses image data) 
    # might still find something if we are not careful.
    # However, the gaze detection relies on extracting the eye region based on landmarks.
    # If landmarks say eye height is ~2 pixels, the extracted region will be tiny.
    
    # Let's make the image white so it's not all black (which might mess up thresholding)
    image[:] = 200
    
    # Face region
    face = (50, 50, 200, 200) # x, y, w, h
    
    # Call _analyze_eye_gaze_advanced
    score = detector._analyze_eye_gaze_advanced(image, face)
    
    print(f"Calculated Eye Contact Score with Closed Eyes: {score}")
    
    # With current logic:
    # EAR should be very small (~2/30 = 0.06).
    # eyes_open_score = min(1.0, max(0.0, (0.06 - 0.15) / 0.15)) = 0.0
    # gaze_score: might be anything, let's assume it defaults to 0.5 or finds something.
    # If gaze_score is 0.5: final = 0.5 * 0.7 + 0 * 0.3 = 0.35
    # If gaze_score is 1.0: final = 1.0 * 0.7 + 0 * 0.3 = 0.7
    
    # We want the score to be significantly lower (e.g. < 0.2)
    
    if score > 0.3:
        print("FAIL: Score is too high for closed eyes.")
    else:
        print("PASS: Score is appropriately low for closed eyes.")

def create_open_eye_landmarks():
    # Create landmarks for a face with OPEN eyes
    landmarks = [MockPoint(0, 0)] * 68
    
    base_x = 100
    base_y = 100
    width = 30
    
    # 36: (100, 100)
    landmarks[36] = MockPoint(base_x, base_y)
    # 39: (130, 100)
    landmarks[39] = MockPoint(base_x + width, base_y)
    
    # Top points (arched up)
    landmarks[37] = MockPoint(base_x + 10, base_y - 10)
    landmarks[38] = MockPoint(base_x + 20, base_y - 10)
    
    # Bottom points (arched down)
    landmarks[41] = MockPoint(base_x + 10, base_y + 10)
    landmarks[40] = MockPoint(base_x + 20, base_y + 10)
    
    # Right eye (42-47)
    base_x_r = 200
    landmarks[42] = MockPoint(base_x_r, base_y)
    landmarks[45] = MockPoint(base_x_r + width, base_y)
    landmarks[43] = MockPoint(base_x_r + 10, base_y - 10)
    landmarks[44] = MockPoint(base_x_r + 20, base_y - 10)
    landmarks[47] = MockPoint(base_x_r + 10, base_y + 10)
    landmarks[46] = MockPoint(base_x_r + 20, base_y + 10)
    
    return landmarks

def test_open_eyes_score():
    print("\n=== Testing Open Eyes Score ===\n")
    
    # Mock load_model and create_model BEFORE initializing
    with patch.object(AutismDetector, 'load_model', return_value=None), \
         patch.object(AutismDetector, 'create_model', return_value=None), \
         patch.object(AutismDetector, '_download_landmark_predictor', return_value=None):
        detector = AutismDetector()
        detector.predictor = MagicMock()
        detector.detector = MagicMock()
    
    # Setup mock return value
    landmarks = create_open_eye_landmarks()
    detector.predictor.return_value = MockShape(landmarks)
    
    # Create dummy image
    image = np.zeros((300, 300, 3), dtype=np.uint8)
    image[:] = 200
    face = (50, 50, 200, 200)
    
    # Call _analyze_eye_gaze_advanced
    score = detector._analyze_eye_gaze_advanced(image, face)
    
    print(f"Calculated Eye Contact Score with Open Eyes: {score}")
    
    # EAR should be high (~20/30 = 0.66).
    # eyes_open_score = 1.0
    # gaze_score: defaults to 0.2 (was 0.5) since iris detection fails on blank image
    # final = 0.2 * 0.7 + 1.0 * 0.3 = 0.14 + 0.3 = 0.44
    
    if score > 0.4:
        print("PASS: Score is reasonably high for open eyes.")
    else:
        print(f"FAIL: Score is too low for open eyes. Got {score}")

if __name__ == "__main__":
    test_closed_eyes_score()
    test_open_eyes_score()
