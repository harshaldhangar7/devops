import logging
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed() -> None:
    db = SessionLocal()
    
    users_to_create = [
        {"email": "admin@example.com", "password": "password123", "role": "admin", "full_name": "Admin User"},
        {"email": "instructor@example.com", "password": "password123", "role": "instructor", "full_name": "Instructor User"},
        {"email": "student@example.com", "password": "password123", "role": "student", "full_name": "Student User"}
    ]
    
    for u in users_to_create:
        user = db.query(User).filter(User.email == u["email"]).first()
        if not user:
            user = User(
                email=u["email"],
                hashed_password=get_password_hash(u["password"]),
                role=u["role"],
                full_name=u["full_name"],
            )
            db.add(user)
            logger.info(f"Created user: {u['email']}")
        else:
            logger.info(f"User already exists: {u['email']}")
            
    db.commit()
    db.close()

if __name__ == "__main__":
    logger.info("Seeding database...")
    seed()
    logger.info("Database seeded!")
