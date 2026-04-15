# FastAPI Experimental Code

This directory contains experimental FastAPI implementation code. 

**Note**: The main application uses Flask (see `app.py` in the parent directory). This FastAPI code is kept for reference or future migration purposes.

## Contents

- `main.py` - FastAPI application entry point
- `routers/` - FastAPI route handlers
  - `auth.py` - Authentication routes
  - `children.py` - Child profile routes
  - `assessments.py` - Assessment routes
  - `chat.py` - Chatbot routes
  - `analysis.py` - Image analysis routes
- `schemas.py` - Pydantic schemas for request/response validation
- `models.py` - SQLAlchemy models
- `database.py` - Database configuration
- `dependencies.py` - FastAPI dependencies

## Usage

If you want to use FastAPI instead of Flask:

1. Install FastAPI dependencies:
   ```bash
   pip install fastapi uvicorn python-multipart
   ```

2. Update the frontend API base URL to point to FastAPI (port 8000)

3. Run with:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

## Current Status

This code is **not actively used** by the main application. The Flask implementation in `app.py` is the production code.

