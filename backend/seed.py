import logging
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.models.catalog import Course, Module, Lab, LabVersion, ModuleLabMapping, Enrollment
from app.models.cohort import Cohort, CohortMember
from app.models.progress import LabSession
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed() -> None:
    db = SessionLocal()
    
    users_to_create = [
        {"email": "admin@example.com", "password": "password123", "role": "admin", "full_name": "Admin User"},
        {"email": "instructor@example.com", "password": "password123", "role": "instructor", "full_name": "Instructor User"},
        {"email": "student1@example.com", "password": "password123", "role": "student", "full_name": "Student One"},
        {"email": "student2@example.com", "password": "password123", "role": "student", "full_name": "Student Two"}
    ]
    
    user_objects = {}
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
            db.commit()
            logger.info(f"Created user: {u['email']}")
        user_objects[u["email"]] = user

    # Phase 2 Seeds: Cohorts, Courses, Labs
    
    # 1. Cohort
    cohort = db.query(Cohort).filter(Cohort.name == "Spring 2026").first()
    if not cohort:
        cohort = Cohort(name="Spring 2026", description="First cohort of 2026")
        db.add(cohort)
        db.commit()
        
        # Add students to cohort
        for email in ["student1@example.com", "student2@example.com"]:
            db.add(CohortMember(cohort_id=cohort.id, user_id=user_objects[email].id))
        db.commit()
        logger.info("Created Cohort and Members")

    # 2. Course
    course = db.query(Course).filter(Course.title == "DevOps Foundations").first()
    if not course:
        course = Course(title="DevOps Foundations", description="Learn the basics of DevOps, CI/CD, and Containers.")
        db.add(course)
        db.commit()
        
        # Enroll cohort in course
        db.add(Enrollment(cohort_id=cohort.id, course_id=course.id))
        
        # Modules
        mod1 = Module(course_id=course.id, title="Introduction to Linux", order=1)
        mod2 = Module(course_id=course.id, title="Docker Basics", order=2)
        db.add(mod1)
        db.add(mod2)
        db.commit()
        
        # Labs
        lab1 = Lab(title="Linux File Permissions", slug="linux-file-permissions", difficulty="beginner", tags="linux,bash")
        lab2 = Lab(title="Docker Hello World", slug="docker-hello-world", difficulty="beginner", tags="docker")
        db.add(lab1)
        db.add(lab2)
        db.commit()

        # Mappings
        db.add(ModuleLabMapping(module_id=mod1.id, lab_id=lab1.id, order=1))
        db.add(ModuleLabMapping(module_id=mod2.id, lab_id=lab2.id, order=1))
        db.commit()

        # Lab Versions
        db.add(LabVersion(lab_id=lab1.id, version_number=1, instructions_markdown="Change permissions to 755.", is_active=True))
        db.add(LabVersion(lab_id=lab2.id, version_number=1, instructions_markdown="Run a docker hello-world container.", is_active=True))
        db.commit()

        # Add LabSession for student1 so dashboard is not empty
        db.add(LabSession(user_id=user_objects["student1@example.com"].id, lab_id=lab1.id, status="completed", score=100.0))
        db.add(LabSession(user_id=user_objects["student1@example.com"].id, lab_id=lab2.id, status="in_progress", score=0.0))
        db.commit()
        logger.info("Created Catalog Data (Course, Modules, Labs, Progress)")

    db.close()

if __name__ == "__main__":
    logger.info("Seeding database...")
    seed()
    logger.info("Database seeded!")
