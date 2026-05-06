from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.catalog import Course, Module
from app.schemas.catalog import Course as CourseSchema, CourseCreate, CourseUpdate
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[CourseSchema])
def read_courses(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Retrieve courses."""
    courses = db.query(Course).offset(skip).limit(limit).all()
    return courses

@router.post("/", response_model=CourseSchema)
def create_course(
    *,
    db: Session = Depends(deps.get_db),
    course_in: CourseCreate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """Create new course. Admin only."""
    course = Course(**course_in.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course

@router.get("/{course_id}", response_model=CourseSchema)
def read_course(
    *,
    db: Session = Depends(deps.get_db),
    course_id: int,
) -> Any:
    """Get course by ID."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.put("/{course_id}", response_model=CourseSchema)
def update_course(
    *,
    db: Session = Depends(deps.get_db),
    course_id: int,
    course_in: CourseUpdate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """Update a course. Admin only."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    update_data = course_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)
        
    db.add(course)
    db.commit()
    db.refresh(course)
    return course
