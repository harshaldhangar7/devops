# DevOps Lab Platform MVP

## Overview
A real full-stack web application for training students through practical browser-based labs. Features role-based access control (Student, Instructor, Admin), interactive lab sessions with a mock runtime, automated checking, and a clean, modern Next.js frontend.

## Phase 3: Hands-on Practice Workflow
The platform now supports the full end-to-end lab session lifecycle:
- Students can start labs, launching a mock container-like environment.
- Automated checkers validate student work and provide immediate feedback.
- Persistent submissions track progress and scores.
- Instructors can monitor student activity in real-time.

## Architecture & Tech Stack
- **Frontend**: Next.js (App Router), TypeScript, TailwindCSS
- **Backend**: FastAPI, Python, SQLAlchemy, Alembic
- **Database**: SQLite (default for development), PostgreSQL-ready
- **Authentication**: JWT-based with bcrypt password hashing
- **Runtime**: Pluggable provider system (Mock for dev, ready for Docker/Kubernetes)
- **Checker**: Pluggable automated assessment system

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
5. Seed initial data (includes Phase 3 lab versions and sessions):
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
- Student 1: `student1@example.com`
- Student 2: `student2@example.com`

## Running Tests
```bash
cd backend
.\venv\Scripts\activate
pytest
```
