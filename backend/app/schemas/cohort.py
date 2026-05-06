from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class CohortBase(BaseModel):
    name: str
    description: Optional[str] = None

class CohortCreate(CohortBase):
    pass

class CohortUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class Cohort(CohortBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class CohortMemberCreate(BaseModel):
    cohort_id: int
    user_id: int

class EnrollmentCreate(BaseModel):
    cohort_id: int
    course_id: int
