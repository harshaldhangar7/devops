import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_student_token():
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "student1@example.com", "password": "password123"}
    )
    return response.json()["access_token"]

def test_list_my_sessions():
    token = get_student_token()
    response = client.get(
        "/api/v1/sessions/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_start_session_and_check():
    token = get_student_token()
    
    # 1. Start session for lab 2 (Docker Hello World)
    response = client.post(
        "/api/v1/sessions/",
        headers={"Authorization": f"Bearer {token}"},
        json={"lab_id": 2}
    )
    assert response.status_code == 200
    session = response.json()
    session_id = session["id"]
    
    # 2. Try to run checks immediately (it might be provisioning)
    # The LocalMockRuntimeProvider moves it to 'ready' after 5 seconds
    # But for tests, we might need to wait or just accept a 400 if it's still provisioning
    
    check_response = client.post(
        f"/api/v1/submissions/session/{session_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    # In mock, it starts as 'provisioning'. 
    # If we want it to be ready immediately for tests, we can wait or mock the clock.
    # For now, let's just check if the endpoint exists and returns a correct error if not ready.
    if session["status"] != "ready":
        assert check_response.status_code == 400
        assert "not ready" in check_response.json()["detail"]
    else:
        assert check_response.status_code == 200
