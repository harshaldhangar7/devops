from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Course(Base):
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    modules = relationship("Module", back_populates="course")
    enrollments = relationship("Enrollment", back_populates="course")

class Module(Base):
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("course.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    course = relationship("Course", back_populates="modules")
    lab_mappings = relationship("ModuleLabMapping", back_populates="module")

class Lab(Base):
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    difficulty = Column(String, default="beginner")
    estimated_minutes = Column(Integer, default=30)
    tags = Column(String, nullable=True) # Comma separated
    objectives = Column(Text, nullable=True)
    passing_score = Column(Integer, default=100)
    max_attempts = Column(Integer, default=3)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    versions = relationship("LabVersion", back_populates="lab")
    module_mappings = relationship("ModuleLabMapping", back_populates="lab")

class LabVersion(Base):
    id = Column(Integer, primary_key=True, index=True)
    lab_id = Column(Integer, ForeignKey("lab.id"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    instructions_markdown = Column(Text, nullable=False)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    lab = relationship("Lab", back_populates="versions")

class ModuleLabMapping(Base):
    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("module.id"), nullable=False, index=True)
    lab_id = Column(Integer, ForeignKey("lab.id"), nullable=False, index=True)
    order = Column(Integer, default=0)

    module = relationship("Module", back_populates="lab_mappings")
    lab = relationship("Lab", back_populates="module_mappings")

class Enrollment(Base):
    id = Column(Integer, primary_key=True, index=True)
    cohort_id = Column(Integer, ForeignKey("cohort.id"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("course.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    cohort = relationship("Cohort", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
