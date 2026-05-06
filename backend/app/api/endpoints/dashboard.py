from typing import Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.cohort import CohortMember
from app.models.catalog import Course, Enrollment
from app.models.progress import LabSession

router = APIRouter()

@router.get("/student/stats")
def get_student_dashboard_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get dashboard stats for student.
    """
    if current_user.role != "student" and current_user.role != "admin":
        return {"error": "Not a student"}
    
    # Get user's cohorts
    cohort_memberships = db.query(CohortMember).filter(CohortMember.user_id == current_user.id).all()
    cohort_ids = [m.cohort_id for m in cohort_memberships]

    # Get enrolled courses
    enrollments = db.query(Enrollment).filter(Enrollment.cohort_id.in_(cohort_ids)).all()
    enrolled_courses = len(set(e.course_id for e in enrollments))

    # Get lab stats
    lab_sessions = db.query(LabSession).filter(LabSession.user_id == current_user.id).all()
    completed_labs = sum(1 for s in lab_sessions if s.status == "completed")
    in_progress_labs = sum(1 for s in lab_sessions if s.status == "in_progress")
    
    # Calculate score
    recent_score = 0
    if lab_sessions:
        recent_score = sum(s.score for s in lab_sessions) / len(lab_sessions)

    return {
        "enrolled_courses": enrolled_courses,
        "in_progress_labs": in_progress_labs,
        "completed_labs": completed_labs,
        "recent_score": round(recent_score, 1),
    }

@router.get("/instructor/cohort-summary")
def get_instructor_cohort_summary(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get instructor dashboard summary.
    """
    if current_user.role != "instructor" and current_user.role != "admin":
        return {"error": "Not an instructor"}

    # Just giving dummy stats for now, real implementation would aggregate student stats per cohort
    return {
        "assigned_cohorts": 1,
        "total_students": 5,
        "average_score": 85.5
    }
