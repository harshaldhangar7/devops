from sqlalchemy.orm import Session
from app.models.progress import LabSession
from app.models.catalog import Lab, LabVersion
from app.services.lab.runtime import LocalMockRuntimeProvider
from datetime import datetime

class SessionService:
    def __init__(self, db: Session):
        self.db = db
        self.runtime = LocalMockRuntimeProvider()

    def start_session(self, user_id: int, lab_id: int) -> LabSession:
        # Check for active session
        active_session = self.get_active_session(user_id, lab_id)
        if active_session:
            return active_session
            
        # Get latest active version
        lab_version = self.db.query(LabVersion).filter(
            LabVersion.lab_id == lab_id, 
            LabVersion.is_active == True
        ).order_by(LabVersion.version_number.desc()).first()
        
        if not lab_version:
            # Fallback to any version if none marked active for dev
            lab_version = self.db.query(LabVersion).filter(LabVersion.lab_id == lab_id).first()
            
        if not lab_version:
            raise Exception("No active version found for this lab")

        session = LabSession(
            user_id=user_id,
            lab_id=lab_id,
            lab_version_id=lab_version.id,
            status="pending"
        )
        return self.runtime.create_session(self.db, session)

    def get_active_session(self, user_id: int, lab_id: int) -> LabSession:
        session = self.db.query(LabSession).filter(
            LabSession.user_id == user_id,
            LabSession.lab_id == lab_id,
            LabSession.status.in_(["pending", "provisioning", "ready"])
        ).first()
        
        if session:
            return self.runtime.refresh_or_tick_session_state(self.db, session)
        return None

    def get_session_detail(self, session_id: int, user_id: int) -> LabSession:
        session = self.db.query(LabSession).filter(
            LabSession.id == session_id,
            LabSession.user_id == user_id
        ).first()
        if session:
            return self.runtime.refresh_or_tick_session_state(self.db, session)
        return None

    def reset_session(self, session_id: int, user_id: int) -> LabSession:
        session = self.get_session_detail(session_id, user_id)
        if not session:
            raise Exception("Session not found")
        return self.runtime.reset_session(self.db, session)

    def stop_session(self, session_id: int, user_id: int) -> LabSession:
        session = self.get_session_detail(session_id, user_id)
        if not session:
            raise Exception("Session not found")
        return self.runtime.stop_session(self.db, session)

    def list_user_sessions(self, user_id: int):
        return self.db.query(LabSession).filter(LabSession.user_id == user_id).all()
