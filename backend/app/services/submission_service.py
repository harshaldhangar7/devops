from sqlalchemy.orm import Session
from app.models.progress import LabSession, Submission
from app.models.catalog import Lab, LabVersion
from app.services.lab.checker import LocalMockCheckerProvider
from datetime import datetime

class SubmissionService:
    def __init__(self, db: Session):
        self.db = db
        self.checker = LocalMockCheckerProvider()

    def run_checks(self, user_id: int, session_id: int) -> Submission:
        session = self.db.query(LabSession).filter(
            LabSession.id == session_id,
            LabSession.user_id == user_id
        ).first()
        
        if not session:
            raise Exception("Active session not found")
            
        if session.status != "ready":
            raise Exception(f"Session is not ready for checks (current status: {session.status})")
            
        lab_version = self.db.get(LabVersion, session.lab_version_id)
        
        # Enforce max attempts
        lab = self.db.get(Lab, session.lab_id)
        attempt_count = self.db.query(Submission).filter(
            Submission.session_id == session.id
        ).count()
        
        if lab.max_attempts and attempt_count >= lab.max_attempts:
            raise Exception(f"Maximum attempts ({lab.max_attempts}) reached for this session")

        submission = self.checker.run_checks(self.db, session, lab_version)
        return submission

    def get_submission_detail(self, submission_id: int, user_id: int) -> Submission:
        return self.db.query(Submission).filter(
            Submission.id == submission_id,
            Submission.user_id == user_id
        ).first()

    def list_session_submissions(self, session_id: int, user_id: int):
        return self.db.query(Submission).filter(
            Submission.session_id == session_id,
            Submission.user_id == user_id
        ).order_by(Submission.created_at.desc()).all()

    def list_lab_submissions(self, lab_id: int, user_id: int):
        return self.db.query(Submission).filter(
            Submission.lab_id == lab_id,
            Submission.user_id == user_id
        ).order_by(Submission.created_at.desc()).all()
