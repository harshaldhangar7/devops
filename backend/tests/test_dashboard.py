import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_student_dashboard_unauthorized():
    response = client.get("/api/v1/dashboard/student/stats")
    assert response.status_code == 401

def test_login_and_student_dashboard():
    # Attempt login with seed student
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "student1@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    
    # Access dashboard
    dash_response = client.get(
        "/api/v1/dashboard/student/stats",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert dash_response.status_code == 200
    data = dash_response.json()
    assert "enrolled_courses" in data
    assert "in_progress_labs" in data
    assert data["enrolled_courses"] >= 1
    assert data["completed_labs"] >= 1

def test_instructor_dashboard_access():
    # Attempt login with seed instructor
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "instructor@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    
    # Access instructor summary
    dash_response = client.get(
        "/api/v1/dashboard/instructor/cohort-summary",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert dash_response.status_code == 200
    data = dash_response.json()
    assert data["assigned_cohorts"] >= 1
