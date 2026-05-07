from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.session import Submission
from app.services.submission_service import SubmissionService
from app.models.user import User

router = APIRouter()

@router.post("/session/{session_id}", response_model=Submission)
def run_checks(
    *,
    db: Session = Depends(deps.get_db),
    session_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Run checks for a session and create a submission.
    """
    service = SubmissionService(db)
    try:
        return service.run_checks(user_id=current_user.id, session_id=session_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{submission_id}", response_model=Submission)
def get_submission(
    *,
    db: Session = Depends(deps.get_db),
    submission_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get submission details.
    """
    service = SubmissionService(db)
    submission = service.get_submission_detail(submission_id=submission_id, user_id=current_user.id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission

@router.get("/session/{session_id}", response_model=List[Submission])
def list_session_submissions(
    *,
    db: Session = Depends(deps.get_db),
    session_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    List all submissions for a session.
    """
    service = SubmissionService(db)
    return service.list_session_submissions(session_id=session_id, user_id=current_user.id)

@router.get("/lab/{lab_id}", response_model=List[Submission])
def list_lab_submissions(
    *,
    db: Session = Depends(deps.get_db),
    lab_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    List all submissions for a lab.
    """
    service = SubmissionService(db)
    return service.list_lab_submissions(lab_id=lab_id, user_id=current_user.id)
