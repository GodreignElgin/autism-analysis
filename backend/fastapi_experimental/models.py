from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from .database import Base
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20))
    created_at = Column(DateTime, default=func.now())
    
    children = relationship('Child', back_populates='parent', cascade='all, delete-orphan')
    chat_messages = relationship('ChatMessage', back_populates='user')

    def verify_password(self, password):
        return pwd_context.verify(password, self.password_hash)

    @staticmethod
    def get_password_hash(password):
        return pwd_context.hash(password)

class Child(Base):
    __tablename__ = "child"
    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    name = Column(String(255), nullable=False)
    age = Column(Integer)
    gender = Column(String(10))
    created_at = Column(DateTime, default=func.now())
    
    parent = relationship('User', back_populates='children')
    assessments = relationship('Assessment', back_populates='child', cascade='all, delete-orphan')
    notes = relationship('Note', back_populates='child', cascade='all, delete-orphan')

class Assessment(Base):
    __tablename__ = "assessment"
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey('child.id'), nullable=False)
    assessment_date = Column(DateTime, default=func.now())
    autism_score = Column(Float)
    facial_features = Column(Text)  # JSON string
    status = Column(String(20))
    image_path = Column(String(500))
    recommendations = Column(Text)  # JSON string
    
    child = relationship('Child', back_populates='assessments')

class Note(Base):
    __tablename__ = "note"
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey('child.id'), nullable=False)
    created_at = Column(DateTime, default=func.now())
    note_type = Column(String(50))
    content = Column(Text)
    
    child = relationship('Child', back_populates='notes')

class ChatMessage(Base):
    __tablename__ = "chat_message"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    message = Column(Text)
    response = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    user = relationship('User', back_populates='chat_messages')
