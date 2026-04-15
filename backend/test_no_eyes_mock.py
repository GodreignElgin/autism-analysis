import sys
import os
import numpy as np
import cv2
from unittest.mock import patch

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_model.autism_detector import AutismDetector

def test_mocked_eye_detection():
    print("=== Testing Eye Enforcement with Mocking ===\n")
    
    detector = AutismDetector()
    
    # Create a GOOD face image (so face detection works)
    print("Creating valid face image...")
    test_image = np.zeros((480, 640, 3), dtype=np.uint8)
    test_image[:] = (200, 200, 200)
    center = (320, 240)
    cv2.circle(test_image, center, 100, (255, 200, 180), -1)
    cv2.circle(test_image, (280, 220), 20, (50, 50, 50), -1) # Eyes
    cv2.circle(test_image, (360, 220), 20, (50, 50, 50), -1)
    cv2.ellipse(test_image, (320, 280), (40, 20), 0, 0, 180, (100, 50, 50), 2) # Mouth
    
    # Mock detect_eyes to return EMPTY list (simulating no eyes found)
    # We need to patch the method on the INSTANCE or the CLASS
    # Since we already have the instance, we can just replace the method
    
    original_detect_eyes = detector.detect_eyes
    detector.detect_eyes = lambda img, face: [] # Return no eyes
    
    print("Mocked detect_eyes to return [] (no eyes found)...")
    
    # Test prediction
    print("Testing prediction...")
    result = detector.predict(test_image)
    
    print(f"\nResult Status: {result['status']}")
    print(f"Recommendations: {result['recommendations']}")
    
    if result['status'] == 'no_face_detected':
        if "eyes" in result['recommendations'][0].lower():
            print("\n✓ SUCCESS: Logic correctly rejected face due to missing eyes.")
        else:
            print("\n✗ FAILURE: Rejected face but gave wrong reason.")
    else:
        print(f"\n✗ FAILURE: Predicted despite no eyes! Score: {result['score']}")

if __name__ == "__main__":
    test_mocked_eye_detection()
