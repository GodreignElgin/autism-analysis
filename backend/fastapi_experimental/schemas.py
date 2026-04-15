from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    children_count: Optional[int] = 0

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Child Schemas
class ChildBase(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None

class ChildCreate(ChildBase):
    pass

class ChildResponse(ChildBase):
    id: int
    assessments_count: Optional[int] = 0

    class Config:
        orm_mode = True

# Assessment Schemas
class AssessmentBase(BaseModel):
    child_id: int
    autism_score: Optional[float] = None
    facial_features: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    image_path: Optional[str] = None
    recommendations: Optional[List[str]] = None

class AssessmentCreate(AssessmentBase):
    pass

class AssessmentResponse(AssessmentBase):
    id: int
    date: datetime

    class Config:
        orm_mode = True

# Chat Schemas
class ChatMessageCreate(BaseModel):
    message: str

class ChatMessageResponse(BaseModel):
    id: int
    message: str
    response: str
    timestamp: datetime

    class Config:
        orm_mode = True
