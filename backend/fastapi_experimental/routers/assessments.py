from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
from .. import models, schemas, dependencies
from ..database import get_db

router = APIRouter(
    prefix="/api/assessment",
    tags=["assessments"]
)

@router.post("/save", response_model=dict, status_code=status.HTTP_201_CREATED)
def save_assessment(assessment: schemas.AssessmentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    child = db.query(models.Child).filter(models.Child.id == assessment.child_id, models.Child.parent_id == current_user.id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    
    new_assessment = models.Assessment(
        child_id=child.id,
        autism_score=assessment.autism_score,
        facial_features=json.dumps(assessment.facial_features) if assessment.facial_features else None,
        status=assessment.status,
        image_path=assessment.image_path,
        recommendations=json.dumps(assessment.recommendations) if assessment.recommendations else None
    )
    db.add(new_assessment)
    db.commit()
    db.refresh(new_assessment)
    
    return {
        "message": "Assessment saved successfully",
        "assessment_id": new_assessment.id
    }

@router.get("/{child_id}", response_model=dict)
def get_assessments(child_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    child = db.query(models.Child).filter(models.Child.id == child_id, models.Child.parent_id == current_user.id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    
    assessments = db.query(models.Assessment).filter(models.Assessment.child_id == child_id).all()
    
    return {
        "assessments": [{
            "id": a.id,
            "date": a.assessment_date.isoformat(),
            "score": a.autism_score,
            "status": a.status,
            "facial_features": json.loads(a.facial_features) if a.facial_features else {},
            "recommendations": json.loads(a.recommendations) if a.recommendations else []
        } for a in assessments]
    }
