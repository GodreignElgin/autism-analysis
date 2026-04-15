#!/usr/bin/env python3
import sys
sys.path.insert(0, 'ml_model')

from autism_detector import AutismDetector
from PIL import Image
import numpy as np

# Create test image
test_img = Image.new('RGB', (224, 224), color='blue')
test_array = np.array(test_img)

# Try prediction
detector = AutismDetector()
try:
    result = detector.predict(test_array)
    print('✓ Prediction successful')
    print(f'  Score: {result["score"]}')
    print(f'  Status: {result["status"]}')
    print(f'  Confidence: {result["confidence"]}')
except Exception as e:
    print(f'✗ Error: {e}')
    import traceback
    traceback.print_exc()
