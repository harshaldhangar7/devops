# Development Setup

## Backend
1. `cd backend`
2. `python -m venv venv`
3. `.\venv\Scripts\activate` (or `source venv/bin/activate` on Mac/Linux)
4. `pip install -r requirements.txt`
5. `alembic upgrade head`
6. `python seed.py`
7. `uvicorn app.main:app --reload`

## Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Testing
1. Activate backend venv.
2. `pytest tests/`
