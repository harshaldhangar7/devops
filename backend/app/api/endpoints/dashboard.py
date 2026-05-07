from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.cohort import CohortMember, Cohort
from app.models.catalog import Course, Enrollment, Lab
from app.models.progress import LabSession, Submission
from sqlalchemy import func

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
    in_progress_labs = sum(1 for s in lab_sessions if s.status in ["pending", "provisioning", "ready"])
    
    # Calculate score from best submissions
    best_submissions = db.query(func.max(Submission.score)).filter(Submission.user_id == current_user.id).group_by(Submission.lab_id).all()
    recent_score = 0
    if best_submissions:
        recent_score = sum(s[0] for s in best_submissions) / len(best_submissions)

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

    # Total students in cohorts the instructor might be interested in
    # (For now, just all students as a simplification)
    total_students = db.query(User).filter(User.role == "student").count()
    assigned_cohorts = db.query(Cohort).count()
    
    # Average score across all submissions
    avg_score = db.query(func.avg(Submission.score)).scalar() or 0.0

    return {
        "assigned_cohorts": assigned_cohorts,
        "total_students": total_students,
        "average_score": round(float(avg_score), 1)
    }

@router.get("/instructor/recent-activity")
def get_instructor_recent_activity(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get recent submissions and sessions for instructor.
    """
    if current_user.role != "instructor" and current_user.role != "admin":
        return {"error": "Not an instructor"}

    recent_submissions = db.query(Submission).order_by(Submission.created_at.desc()).limit(10).all()
    
    activity = []
    for sub in recent_submissions:
        user = db.get(User, sub.user_id)
        lab = db.get(Lab, sub.lab_id)
        activity.append({
            "id": sub.id,
            "student_name": user.full_name if user else "Unknown",
            "lab_title": lab.title if lab else "Unknown Lab",
            "score": sub.score,
            "passed": sub.passed,
            "created_at": sub.created_at,
            "type": "submission"
        })

    return activity
