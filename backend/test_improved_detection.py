import sys
import os
import numpy as np
import cv2

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_model.autism_detector import AutismDetector

def test_improved_detection():
    print("=== Testing Improved Face Detection ===\n")
    
    try:
        # Initialize detector
        print("Initializing detector (loading cascades)...")
        detector = AutismDetector()
        
        # Check if new cascades are loaded
        if hasattr(detector, 'face_cascade_alt') and hasattr(detector, 'profile_cascade'):
            print("✓ New cascade classifiers loaded successfully")
        else:
            print("✗ Failed to load new cascade classifiers")
            return
            
        # Create a test image with a face
        print("\nCreating test image...")
        test_image = np.zeros((480, 640, 3), dtype=np.uint8)
        test_image[:] = (200, 200, 200)
        
        # Draw a face
        center = (320, 240)
        cv2.circle(test_image, center, 100, (255, 200, 180), -1)
        cv2.circle(test_image, (280, 220), 20, (50, 50, 50), -1)
        cv2.circle(test_image, (360, 220), 20, (50, 50, 50), -1)
        cv2.ellipse(test_image, (320, 280), (40, 20), 0, 0, 180, (100, 50, 50), 2)
        
        # Test detection
        print("Testing detection...")
        faces = detector.detect_faces(test_image)
        
        if len(faces) > 0:
            print(f"✓ Detected {len(faces)} face(s)")
            print("  (Note: Synthetic images are easy, but this confirms the pipeline works)")
        else:
            print("✗ Failed to detect face in synthetic image")
            
        print("\n✓ Code execution successful (no syntax errors in new logic)")
        
    except Exception as e:
        print(f"\n✗ Error during testing: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_improved_detection()
