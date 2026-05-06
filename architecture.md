# DevOps Lab Platform - Architecture

## Tech Stack
- Frontend: Next.js (App Router), React, TailwindCSS, TypeScript
- Backend: FastAPI, Python, SQLAlchemy, Alembic, SQLite (Development)

## Core Components
- **Catalog Management**: Courses, Modules, Labs, and Lab Versions represent the curriculum structure.
- **Cohorts & Enrollments**: Students belong to cohorts. Cohorts are enrolled in courses.
- **Progress Tracking**: LabSessions track user progress on individual labs.

## Upcoming
- **Runtime Abstraction**: Will introduce a provider pattern (`MockRuntimeProvider`, `DockerRuntimeProvider`) to handle lab execution and environments.
