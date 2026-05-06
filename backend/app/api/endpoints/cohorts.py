from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.cohort import Cohort
from app.schemas.cohort import Cohort as CohortSchema, CohortCreate, CohortUpdate
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[CohortSchema])
def read_cohorts(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Retrieve cohorts."""
    # For MVP, anyone active can list cohorts.
    cohorts = db.query(Cohort).offset(skip).limit(limit).all()
    return cohorts

@router.post("/", response_model=CohortSchema)
def create_cohort(
    *,
    db: Session = Depends(deps.get_db),
    cohort_in: CohortCreate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """Create new cohort. Admin only."""
    cohort = db.query(Cohort).filter(Cohort.name == cohort_in.name).first()
    if cohort:
        raise HTTPException(status_code=400, detail="Cohort name already exists")
    
    cohort = Cohort(**cohort_in.model_dump())
    db.add(cohort)
    db.commit()
    db.refresh(cohort)
    return cohort

@router.get("/{cohort_id}", response_model=CohortSchema)
def read_cohort(
    *,
    db: Session = Depends(deps.get_db),
    cohort_id: int,
) -> Any:
    """Get cohort by ID."""
    cohort = db.query(Cohort).filter(Cohort.id == cohort_id).first()
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")
    return cohort
