# API Specification

## Auth
- `POST /api/v1/auth/login`: Authenticate and obtain JWT token.

## Users
- `GET /api/v1/users/me`: Get current user profile.
- `POST /api/v1/users/`: Create a new user.

## Catalog
- `GET /api/v1/courses/`: List courses
- `POST /api/v1/courses/`: Create course (Admin)
- `GET /api/v1/labs/`: List labs
- `POST /api/v1/labs/`: Create lab (Admin)

## Cohorts
- `GET /api/v1/cohorts/`: List cohorts
- `POST /api/v1/cohorts/`: Create cohort (Admin)

## Dashboards
- `GET /api/v1/dashboard/student/stats`: Get stats for student dashboard.
- `GET /api/v1/dashboard/instructor/cohort-summary`: Get stats for instructor dashboard.
