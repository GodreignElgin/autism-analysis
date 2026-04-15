from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from .database import engine, Base
from .routers import auth, children, assessments, chat, analysis

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Autism Detection Platform API")

# CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173", # Vite default
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount upload folder
upload_folder = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(upload_folder, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_folder), name="uploads")

# Include routers
app.include_router(auth.router)
app.include_router(children.router)
app.include_router(assessments.router)
app.include_router(chat.router)
app.include_router(analysis.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Autism Detection Platform API"}
