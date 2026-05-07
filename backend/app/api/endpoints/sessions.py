from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.session import LabSession, LabSessionCreate
from app.services.session_service import SessionService
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=LabSession)
def start_session(
    *,
    db: Session = Depends(deps.get_db),
    session_in: LabSessionCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Start a new lab session or get active one.
    """
    service = SessionService(db)
    try:
        session = service.start_session(user_id=current_user.id, lab_id=session_in.lab_id)
        return session
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/active/{lab_id}", response_model=Optional[LabSession])
def get_active_session(
    *,
    db: Session = Depends(deps.get_db),
    lab_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get active session for a specific lab.
    """
    service = SessionService(db)
    return service.get_active_session(user_id=current_user.id, lab_id=lab_id)

@router.get("/{session_id}", response_model=LabSession)
def get_session(
    *,
    db: Session = Depends(deps.get_db),
    session_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get session details.
    """
    service = SessionService(db)
    session = service.get_session_detail(session_id=session_id, user_id=current_user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.post("/{session_id}/reset", response_model=LabSession)
def reset_session(
    *,
    db: Session = Depends(deps.get_db),
    session_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Reset a lab session.
    """
    service = SessionService(db)
    try:
        return service.reset_session(session_id=session_id, user_id=current_user.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{session_id}/stop", response_model=LabSession)
def stop_session(
    *,
    db: Session = Depends(deps.get_db),
    session_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Stop a lab session.
    """
    service = SessionService(db)
    try:
        return service.stop_session(session_id=session_id, user_id=current_user.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[LabSession])
def list_my_sessions(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    List all sessions for the current user.
    """
    service = SessionService(db)
    return service.list_user_sessions(user_id=current_user.id)
