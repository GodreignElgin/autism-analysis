import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_model.autism_detector import AutismDetector

try:
    detector = AutismDetector()
    if detector.model:
        print("SUCCESS: Model loaded")
    else:
        print("FAILURE: Model not loaded")
except Exception as e:
    print(f"FAILURE: {e}")
