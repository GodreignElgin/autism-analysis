from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, dependencies
from ..database import get_db

router = APIRouter(
    prefix="/api/children",
    tags=["children"]
)

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
def add_child(child: schemas.ChildCreate, db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    new_child = models.Child(
        parent_id=current_user.id,
        name=child.name,
        age=child.age,
        gender=child.gender
    )
    db.add(new_child)
    db.commit()
    db.refresh(new_child)
    
    return {
        "message": "Child profile created",
        "child": {
            "id": new_child.id,
            "name": new_child.name,
            "age": new_child.age,
            "gender": new_child.gender
        }
    }

@router.get("/", response_model=dict)
def get_children(db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    children = db.query(models.Child).filter(models.Child.parent_id == current_user.id).all()
    
    return {
        "children": [{
            "id": c.id,
            "name": c.name,
            "age": c.age,
            "gender": c.gender,
            "assessments_count": len(c.assessments)
        } for c in children]
    }

@router.get("/{child_id}", response_model=dict)
def get_child_details(child_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    child = db.query(models.Child).filter(models.Child.id == child_id, models.Child.parent_id == current_user.id).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    
    import json
    assessments = [{
        "id": a.id,
        "date": a.assessment_date.isoformat(),
        "score": a.autism_score,
        "status": a.status,
        "recommendations": json.loads(a.recommendations) if a.recommendations else []
    } for a in child.assessments]
    
    notes = [{
        "id": n.id,
        "date": n.created_at.isoformat(),
        "type": n.note_type,
        "content": n.content
    } for n in child.notes]
    
    return {
        "child": {
            "id": child.id,
            "name": child.name,
            "age": child.age,
            "gender": child.gender
        },
        "assessments": assessments,
        "notes": notes
    }
