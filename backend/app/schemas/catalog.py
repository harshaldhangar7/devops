from typing import Optional, List, Any
from pydantic import BaseModel
from datetime import datetime

# Courses
class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    is_active: bool = True

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class Course(CourseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Modules
class ModuleBase(BaseModel):
    title: str
    description: Optional[str] = None
    order: int = 0

class ModuleCreate(ModuleBase):
    course_id: int

class ModuleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None

class Module(ModuleBase):
    id: int
    course_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Labs
class LabBase(BaseModel):
    title: str
    slug: str
    description: Optional[str] = None
    difficulty: str = "beginner"
    estimated_minutes: int = 30
    tags: Optional[str] = None
    objectives: Optional[str] = None
    passing_score: int = 100
    max_attempts: int = 3

class LabCreate(LabBase):
    pass

class LabUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[str] = None
    estimated_minutes: Optional[int] = None
    tags: Optional[str] = None
    objectives: Optional[str] = None
    passing_score: Optional[int] = None
    max_attempts: Optional[int] = None

# Lab Versions
class LabVersionBase(BaseModel):
    version_number: int
    instructions_markdown: str
    is_active: bool = False

class LabVersion(LabVersionBase):
    id: int
    lab_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Lab(LabBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    versions: List[LabVersion] = []

    class Config:
        from_attributes = True
