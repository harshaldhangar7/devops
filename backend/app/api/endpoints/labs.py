from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.api import deps
from app.models.catalog import Lab, LabVersion
from app.schemas.catalog import Lab as LabSchema, LabCreate, LabUpdate
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[LabSchema])
def read_labs(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Retrieve labs."""
    labs = db.query(Lab).options(joinedload(Lab.versions)).offset(skip).limit(limit).all()
    return labs

@router.post("/", response_model=LabSchema)
def create_lab(
    *,
    db: Session = Depends(deps.get_db),
    lab_in: LabCreate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """Create new lab. Admin only."""
    lab = Lab(**lab_in.model_dump())
    db.add(lab)
    db.commit()
    db.refresh(lab)
    return lab

@router.get("/{lab_id}", response_model=LabSchema)
def read_lab(
    *,
    db: Session = Depends(deps.get_db),
    lab_id: int,
) -> Any:
    """Get lab by ID."""
    lab = db.query(Lab).options(joinedload(Lab.versions)).filter(Lab.id == lab_id).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
    return lab

@router.put("/{lab_id}", response_model=LabSchema)
def update_lab(
    *,
    db: Session = Depends(deps.get_db),
    lab_id: int,
    lab_in: LabUpdate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """Update a lab. Admin only."""
    lab = db.query(Lab).filter(Lab.id == lab_id).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab not found")
    
    update_data = lab_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lab, field, value)
        
    db.add(lab)
    db.commit()
    db.refresh(lab)
    return lab
