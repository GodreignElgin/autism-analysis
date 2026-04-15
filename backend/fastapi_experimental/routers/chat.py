from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, dependencies
from ..database import get_db

router = APIRouter(
    prefix="/api/chat",
    tags=["chat"]
)

def generate_chatbot_response(user_message):
    """Generate chatbot response based on user message"""
    message_lower = user_message.lower()
    
    if 'autism' in message_lower and 'what is' in message_lower:
        return "Autism Spectrum Disorder (ASD) is a developmental condition characterized by differences in social communication, interaction, and behavior. Early identification and intervention can significantly improve outcomes. Our system helps detect potential signs through facial expression analysis."
    
    elif 'sign' in message_lower and ('autism' in message_lower or 'asd' in message_lower):
        return "Common early signs of autism include: limited eye contact, challenges with social interaction, repetitive behaviors, sensory sensitivities, and differences in facial expression patterns. If you notice these in your child, consider a professional evaluation."
    
    elif 'early' in message_lower and 'intervention' in message_lower:
        return "Early intervention is crucial for children with autism. Therapies like ABA (Applied Behavior Analysis), speech therapy, and occupational therapy can help develop skills. The earlier intervention starts, the better the outcomes."
    
    elif 'facial' in message_lower and 'expression' in message_lower:
        return "Facial expressions play a key role in social communication. Children with autism may show different patterns in expression recognition and production. Our AI analyzes these patterns to assist in early identification."
    
    elif 'progres' in message_lower and 'track' in message_lower:
        return "You can track your child's progress through regular assessments. Keep detailed notes about observations and milestones. Our platform helps you maintain records and identify patterns over time."
    
    elif 'help' in message_lower or 'support' in message_lower:
        return "We're here to support you. You can: 1) Use our diagnosis tool regularly, 2) Keep detailed notes on observations, 3) Track progress over time, 4) Consult with professionals, and 5) Join support communities. Remember, you're not alone in this journey."
    
    elif 'emergency' in message_lower:
        return "If your child is in immediate distress or danger, please contact emergency services (911 in the US). For crisis support, consider contacting the National Suicide Prevention Lifeline or Autism Speaks."
    
    elif 'school' in message_lower or 'education' in message_lower:
        return "Educational support for children with autism may include IEPs (Individualized Education Programs), classroom accommodations, and specialized services. Work with your school to develop appropriate support plans."
    
    else:
        return "I'm here to help you understand and support your child. I can provide information about autism, early intervention, progress tracking, and coping strategies. What would you like to know more about?"

@router.post("/", response_model=schemas.ChatMessageResponse)
def chat(message: schemas.ChatMessageCreate, db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    user_message = message.message
    chatbot_response = generate_chatbot_response(user_message)
    
    chat_msg = models.ChatMessage(
        user_id=current_user.id,
        message=user_message,
        response=chatbot_response
    )
    db.add(chat_msg)
    db.commit()
    db.refresh(chat_msg)
    
    return chat_msg

@router.get("/history", response_model=dict)
def get_chat_history(db: Session = Depends(get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    messages = db.query(models.ChatMessage).filter(models.ChatMessage.user_id == current_user.id).order_by(models.ChatMessage.created_at).all()
    
    return {
        "messages": [{
            "id": m.id,
            "message": m.message,
            "response": m.response,
            "timestamp": m.created_at.isoformat()
        } for m in messages]
    }
