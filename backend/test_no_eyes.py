import sys
import os
import numpy as np
import cv2

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_model.autism_detector import AutismDetector

def test_no_eyes_detection():
    print("=== Testing No Eyes Detection Logic ===\n")
    
    detector = AutismDetector()
    
    # Create a test image with a face but NO EYES
    print("Creating test image (Face with NO eyes)...")
    test_image = np.zeros((480, 640, 3), dtype=np.uint8)
    test_image[:] = (200, 200, 200)
    
    # Draw a face contour
    center = (320, 240)
    cv2.circle(test_image, center, 100, (255, 200, 180), -1)
    
    # Draw nose
    cv2.ellipse(test_image, (320, 250), (10, 25), 0, 0, 360, (100, 50, 50), -1)
    
    # Draw mouth
    cv2.ellipse(test_image, (320, 290), (40, 20), 0, 0, 180, (100, 50, 50), 2)
    
    # NO EYES DRAWN
    
    # Test detection
    print("Testing prediction...")
    result = detector.predict(test_image)
    
    print(f"\nResult Status: {result['status']}")
    print(f"Recommendations: {result['recommendations']}")
    
    # Check if it detected the face but rejected it due to no eyes
    # Note: It's possible the face detector itself won't find the face without eyes.
    # If so, it returns 'no_face_detected' anyway, which is also acceptable behavior for this requirement.
    # But ideally we want to see the specific message about eyes if the face WAS detected.
    
    if result['status'] == 'no_face_detected':
        if "eyes" in result['recommendations'][0].lower():
            print("\n✓ SUCCESS: Face detected but rejected due to missing eyes.")
        else:
            print("\n✓ SUCCESS: No face detected (likely because eyes are missing, so face detector failed).")
            print("  This also meets the requirement of not predicting on this image.")
    else:
        print(f"\n✗ FAILURE: Predicted despite no eyes! Score: {result['score']}")

if __name__ == "__main__":
    test_no_eyes_detection()
