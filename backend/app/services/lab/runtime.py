from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.progress import LabSession
from app.models.catalog import LabVersion

class LabRuntimeProvider(ABC):
    @abstractmethod
    def create_session(self, db: Session, session: LabSession) -> LabSession:
        pass

    @abstractmethod
    def get_session_status(self, db: Session, session: LabSession) -> str:
        pass

    @abstractmethod
    def reset_session(self, db: Session, session: LabSession) -> LabSession:
        pass

    @abstractmethod
    def stop_session(self, db: Session, session: LabSession) -> LabSession:
        pass

    @abstractmethod
    def refresh_or_tick_session_state(self, db: Session, session: LabSession) -> LabSession:
        pass

class LocalMockRuntimeProvider(LabRuntimeProvider):
    def create_session(self, db: Session, session: LabSession) -> LabSession:
        session.status = "provisioning"
        session.runtime_provider = "mock"
        session.started_at = datetime.utcnow()
        session.expires_at = datetime.utcnow() + timedelta(hours=2)
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def get_session_status(self, db: Session, session: LabSession) -> str:
        return session.status

    def reset_session(self, db: Session, session: LabSession) -> LabSession:
        session.status = "provisioning"
        session.started_at = datetime.utcnow()
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def stop_session(self, db: Session, session: LabSession) -> LabSession:
        session.status = "stopped"
        session.stopped_at = datetime.utcnow()
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def refresh_or_tick_session_state(self, db: Session, session: LabSession) -> LabSession:
        # Simulate provisioning delay: if provisioning for more than 5 seconds, make it ready
        if session.status == "provisioning":
            if datetime.utcnow() > session.started_at + timedelta(seconds=2):
                session.status = "ready"
                session.workspace_url = f"https://mock-workspace.devops-lab.local/{session.id}"
                db.add(session)
                db.commit()
                db.refresh(session)
        
        # Check for expiry
        if session.status == "ready" and session.expires_at and datetime.utcnow() > session.expires_at:
            session.status = "expired"
            db.add(session)
            db.commit()
            db.refresh(session)
            
        return session
