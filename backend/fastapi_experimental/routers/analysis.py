from fastapi import APIRouter, UploadFile, File, HTTPException, status
import numpy as np
from PIL import Image
import io
import os
import sys

# Add parent directory to path so we can import ml_model
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from ml_model.autism_detector import AutismDetector

router = APIRouter(
    prefix="/api/analyze",
    tags=["analysis"]
)

# Initialize ML model
# We initialize it lazily or globally. Here globally for simplicity.
try:
    autism_detector = AutismDetector()
except Exception as e:
    print(f"Error initializing model: {e}")
    autism_detector = None

@router.post("/", response_model=dict)
async def analyze_image(image: UploadFile = File(...)):
    if not autism_detector:
        raise HTTPException(status_code=500, detail="ML Model not initialized")
    
    if not image.filename:
        raise HTTPException(status_code=400, detail="No image selected")
    
    try:
        contents = await image.read()
        pil_image = Image.open(io.BytesIO(contents)).convert('RGB')
        image_array = np.array(pil_image)
        
        result = autism_detector.predict(image_array)
        
        return {
            "success": True,
            "autism_score": float(result['score']),
            "status": result['status'],
            "facial_features": result['features'],
            "recommendations": result['recommendations'],
            "confidence": float(result['confidence'])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
