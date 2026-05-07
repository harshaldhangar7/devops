from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.progress import LabSession, Submission, SubmissionResultItem
from app.models.catalog import LabVersion

class LabCheckerProvider(ABC):
    @abstractmethod
    def run_checks(self, db: Session, session: LabSession, lab_version: LabVersion) -> Submission:
        pass

class LocalMockCheckerProvider(LabCheckerProvider):
    def run_checks(self, db: Session, session: LabSession, lab_version: LabVersion) -> Submission:
        # Determine attempt number
        attempt_count = db.query(Submission).filter(Submission.session_id == session.id).count()
        
        submission = Submission(
            session_id=session.id,
            user_id=session.user_id,
            lab_id=session.lab_id,
            lab_version_id=lab_version.id,
            attempt_number=attempt_count + 1,
            checker_provider="mock",
            max_score=100.0
        )
        db.add(submission)
        db.flush() # Get submission ID
        
        # Mock checks based on lab slug or just generic
        checks = [
            {"key": "env_setup", "title": "Environment Setup", "weight": 20},
            {"key": "config_correct", "title": "Configuration Correctness", "weight": 40},
            {"key": "service_running", "title": "Service is Running", "weight": 40},
        ]
        
        total_score = 0.0
        result_items = []
        
        # Deterministic but "random-looking" pass/fail for mock
        # Let's say odd attempts fail some, even attempts pass all
        is_even_attempt = (submission.attempt_number % 2 == 0)
        
        for i, check in enumerate(checks):
            passed = is_even_attempt or (i == 0) # First check always passes in mock
            status = "success" if passed else "failure"
            score = float(check["weight"]) if passed else 0.0
            total_score += score
            
            item = SubmissionResultItem(
                submission_id=submission.id,
                check_key=check["key"],
                title=check["title"],
                status=status,
                score_awarded=score,
                max_score=float(check["weight"]),
                message="Check passed successfully" if passed else "Check failed: unexpected configuration state",
                sort_order=i
            )
            result_items.append(item)
            db.add(item)
            
        submission.score = total_score
        submission.passed = (total_score >= 80.0) # Assume 80 is passing
        submission.summary = f"Completed with score {total_score}/100. {'Passed' if submission.passed else 'Failed'}"
        
        if submission.passed:
            session.status = "completed"
            session.completed_at = session.completed_at or datetime.utcnow()
            db.add(session)
            
        db.commit()
        db.refresh(submission)
        return submission
