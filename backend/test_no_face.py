import sys
import os
import numpy as np
import cv2

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_model.autism_detector import AutismDetector

def test_no_face_detection():
    print("=== Testing No Face Detection Logic ===\n")
    
    # Initialize detector
    detector = AutismDetector()
    
    # Create a blank image (gray background, no face)
    print("Creating blank test image...")
    test_image = np.zeros((480, 640, 3), dtype=np.uint8)
    test_image[:] = (200, 200, 200)
    
    # Test prediction
    print("Testing prediction on blank image...")
    result = detector.predict(test_image)
    
    print(f"\nResult Status: {result['status']}")
    print(f"Score: {result['score']}")
    print(f"Recommendations: {result['recommendations']}")
    
    if result['status'] == 'no_face_detected' and result['score'] == 0.0:
        print("\n✓ SUCCESS: Correctly identified no face and aborted prediction.")
    else:
        print("\n✗ FAILURE: Did not handle no-face condition correctly.")

if __name__ == "__main__":
    test_no_face_detection()
