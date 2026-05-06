# DevOps Lab Platform MVP

## Overview
A real full-stack web application for training students through practical browser-based labs. Features role-based access control (Student, Instructor, Admin), interactive lab sessions with a mock runtime, automated checking, and a clean, modern Next.js frontend.

## Architecture & Tech Stack
- **Frontend**: Next.js (App Router), TypeScript, TailwindCSS
- **Backend**: FastAPI, Python, SQLAlchemy, Alembic
- **Database**: SQLite (default for development), PostgreSQL-ready
- **Authentication**: JWT-based with bcrypt password hashing

## Local Development (No Docker Required)

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` directory.
2. Create and activate a Python virtual environment:
   ```bash
   cd backend
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Linux/Mac:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install fastapi uvicorn sqlalchemy alembic pydantic pydantic-settings python-jose[cryptography] bcrypt pytest httpx
   ```
4. Run migrations:
   ```bash
   alembic upgrade head
   ```
5. Seed initial data:
   ```bash
   python seed.py
   ```
6. Start the backend development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### 2. Frontend Setup
1. Open a terminal and navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

## Demo Credentials
The `seed.py` script provisions the following users (all have the password `password123`):
- Admin: `admin@example.com`
- Instructor: `instructor@example.com`
- Student: `student@example.com`
