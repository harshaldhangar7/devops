from typing import Optional, List, Any
from pydantic import BaseModel
from datetime import datetime

class SubmissionResultItemBase(BaseModel):
    check_key: str
    title: str
    status: str
    score_awarded: float
    max_score: float
    message: Optional[str] = None
    details: Optional[Any] = None
    sort_order: int

class SubmissionResultItem(SubmissionResultItemBase):
    id: int
    submission_id: int

    class Config:
        from_attributes = True

class SubmissionBase(BaseModel):
    session_id: int
    user_id: int
    lab_id: int
    lab_version_id: int
    attempt_number: int
    score: float
    max_score: float
    passed: bool
    checker_provider: str
    summary: Optional[str] = None

class Submission(SubmissionBase):
    id: int
    created_at: datetime
    results: List[SubmissionResultItem] = []

    class Config:
        from_attributes = True

class LabSessionBase(BaseModel):
    user_id: int
    lab_id: int
    lab_version_id: int
    status: str
    runtime_provider: str
    workspace_url: Optional[str] = None
    started_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None

class LabSession(LabSessionBase):
    id: int
    last_activity_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    stopped_at: Optional[datetime] = None
    failure_reason: Optional[str] = None
    metadata_json: Optional[Any] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class LabSessionCreate(BaseModel):
    lab_id: int

class LabSessionUpdate(BaseModel):
    status: Optional[str] = None
