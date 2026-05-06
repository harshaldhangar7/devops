from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Cohort(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    members = relationship("CohortMember", back_populates="cohort")
    enrollments = relationship("Enrollment", back_populates="cohort")

class CohortMember(Base):
    id = Column(Integer, primary_key=True, index=True)
    cohort_id = Column(Integer, ForeignKey("cohort.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    cohort = relationship("Cohort", back_populates="members")
    user = relationship("User")
