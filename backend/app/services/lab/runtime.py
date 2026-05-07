import docker
from abc import ABC, abstractmethod
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.progress import LabSession
from app.models.catalog import LabVersion

# Use timezone-aware UTC now
def utc_now():
    return datetime.now(timezone.utc)

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
    def exec_command(self, session: LabSession, command: str) -> str:
        pass

    @abstractmethod
    def refresh_or_tick_session_state(self, db: Session, session: LabSession) -> LabSession:
        pass

class DockerRuntimeProvider(LabRuntimeProvider):
    def __init__(self):
        try:
            self.client = docker.from_env()
        except Exception as e:
            print(f"Docker not available, falling back to mock: {e}")
            self.client = None

    def create_session(self, db: Session, session: LabSession) -> LabSession:
        session.status = "provisioning"
        session.runtime_provider = "docker"
        session.started_at = utc_now()
        session.expires_at = utc_now() + timedelta(hours=1)
        db.add(session)
        db.commit()
        db.refresh(session)
        
        if not self.client:
            session.status = "failed"
            session.failure_reason = "Docker daemon not reachable"
            db.add(session)
            db.commit()
            return session

        try:
            # Determine image (mock logic for now, should come from lab version)
            image = "alpine:latest"
            container_name = f"devops-lab-{session.id}"
            
            # Remove existing if any
            try:
                old = self.client.containers.get(container_name)
                old.remove(force=True)
            except:
                pass

            container = self.client.containers.run(
                image,
                name=container_name,
                detach=True,
                tty=True,
                command="sh -c 'while true; do sleep 3600; done'",
                labels={"lab_session_id": str(session.id), "managed_by": "devops-guru"}
            )
            
            session.workspace_url = f"container://{container.id[:12]}"
            session.metadata_json = {"container_id": container.id, "image": image}
            session.status = "ready"
            
        except Exception as e:
            session.status = "failed"
            session.failure_reason = str(e)
        
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def get_session_status(self, db: Session, session: LabSession) -> str:
        if not self.client or not session.metadata_json or "container_id" not in session.metadata_json:
            return session.status
            
        try:
            container = self.client.containers.get(session.metadata_json["container_id"])
            return "ready" if container.status == "running" else "stopped"
        except:
            return "failed"

    def reset_session(self, db: Session, session: LabSession) -> LabSession:
        self.stop_session(db, session)
        return self.create_session(db, session)

    def stop_session(self, db: Session, session: LabSession) -> LabSession:
        if self.client and session.metadata_json and "container_id" in session.metadata_json:
            try:
                container = self.client.containers.get(session.metadata_json["container_id"])
                container.stop()
                container.remove()
            except:
                pass
        
        session.status = "stopped"
        session.stopped_at = utc_now()
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def exec_command(self, session: LabSession, command: str) -> str:
        if not self.client or not session.metadata_json or "container_id" not in session.metadata_json:
            return "Error: Container not reachable"
            
        try:
            container = self.client.containers.get(session.metadata_json["container_id"])
            # Enabling TTY can help with output capturing on some Windows environments
            exec_result = container.exec_run(["sh", "-c", command], stdout=True, stderr=True, tty=True)
            exit_code = exec_result.exit_code
            output = exec_result.output
            decoded_output = output.decode('utf-8').strip()
            
            if not decoded_output:
                if exit_code == 0:
                    return "(command executed successfully, no output produced)"
                else:
                    return f"(command failed with exit code {exit_code}, no output produced)"
            
            return decoded_output
        except Exception as e:
            return f"Error executing command: {str(e)}"

    def refresh_or_tick_session_state(self, db: Session, session: LabSession) -> LabSession:
        if session.status == "ready" and session.expires_at:
            if utc_now() > session.expires_at:
                return self.stop_session(db, session)
        return session

class LocalMockRuntimeProvider(LabRuntimeProvider):
    def create_session(self, db: Session, session: LabSession) -> LabSession:
        session.status = "provisioning"
        session.runtime_provider = "mock"
        session.started_at = utc_now()
        session.expires_at = utc_now() + timedelta(hours=2)
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def get_session_status(self, db: Session, session: LabSession) -> str:
        return session.status

    def reset_session(self, db: Session, session: LabSession) -> LabSession:
        session.status = "provisioning"
        session.started_at = utc_now()
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def stop_session(self, db: Session, session: LabSession) -> LabSession:
        session.status = "stopped"
        session.stopped_at = utc_now()
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def refresh_or_tick_session_state(self, db: Session, session: LabSession) -> LabSession:
        if session.status == "provisioning":
            if utc_now() > session.started_at + timedelta(seconds=2):
                session.status = "ready"
                session.workspace_url = f"https://mock-workspace.devops-lab.local/{session.id}"
                db.add(session)
                db.commit()
                db.refresh(session)
        
        if session.status == "ready" and session.expires_at and utc_now() > session.expires_at:
            session.status = "expired"
            db.add(session)
            db.commit()
            db.refresh(session)
            
        return session
