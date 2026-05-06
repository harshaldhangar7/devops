from typing import Any, Dict
from fastapi import APIRouter, Depends
from app.api import deps
from app.models.user import User

router = APIRouter()

@router.get("/student/stats")
def get_student_dashboard_stats(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get dashboard stats for student.
    """
    if current_user.role != "student" and current_user.role != "admin":
        return {"error": "Not a student"}
    
    return {
        "enrolled_courses": 0,
        "in_progress_labs": 0,
        "completed_labs": 0,
        "recent_score": 0,
    }
