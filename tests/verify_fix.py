import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from ml_model.autism_detector import AutismDetector

print("Initializing AutismDetector...")
try:
    detector = AutismDetector()
    if detector.model:
        print("SUCCESS: Model loaded/created successfully.")
    else:
        print("FAILURE: Model is None.")
except Exception as e:
    print(f"FAILURE: Exception during initialization: {e}")
