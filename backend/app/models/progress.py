from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, JSON, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class LabSession(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    lab_id = Column(Integer, ForeignKey("lab.id"), nullable=False)
    lab_version_id = Column(Integer, ForeignKey("labversion.id"), nullable=False)
    
    status = Column(String, default="pending") # pending, provisioning, ready, failed, stopped, expired, completed
    runtime_provider = Column(String, default="mock")
    workspace_url = Column(String, nullable=True)
    
    started_at = Column(DateTime(timezone=True), nullable=True)
    last_activity_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    stopped_at = Column(DateTime(timezone=True), nullable=True)
    failure_reason = Column(Text, nullable=True)
    
    metadata_json = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User")
    lab = relationship("Lab")
    lab_version = relationship("LabVersion")
    submissions = relationship("Submission", back_populates="session", cascade="all, delete-orphan")

class Submission(Base):
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("labsession.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    lab_id = Column(Integer, ForeignKey("lab.id"), nullable=False)
    lab_version_id = Column(Integer, ForeignKey("labversion.id"), nullable=False)
    
    attempt_number = Column(Integer, default=1)
    score = Column(Float, default=0.0)
    max_score = Column(Float, default=100.0)
    passed = Column(Boolean, default=False)
    checker_provider = Column(String, default="mock")
    summary = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("LabSession", back_populates="submissions")
    user = relationship("User")
    lab = relationship("Lab")
    lab_version = relationship("LabVersion")
    results = relationship("SubmissionResultItem", back_populates="submission", cascade="all, delete-orphan")

class SubmissionResultItem(Base):
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submission.id"), nullable=False)
    
    check_key = Column(String, nullable=False)
    title = Column(String, nullable=False)
    status = Column(String, nullable=False) # success, failure, partial
    score_awarded = Column(Float, default=0.0)
    max_score = Column(Float, default=0.0)
    message = Column(Text, nullable=True)
    details = Column(JSON, nullable=True)
    sort_order = Column(Integer, default=0)

    submission = relationship("Submission", back_populates="results")
