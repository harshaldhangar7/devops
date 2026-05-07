# DevOps Lab Platform - Architecture

## Tech Stack
- Frontend: Next.js (App Router), React, TailwindCSS, TypeScript
- Backend: FastAPI, Python, SQLAlchemy, Alembic, SQLite (Development)

## Domain Model
- **Catalog**: Courses -> Modules -> Labs -> LabVersions.
- **Cohorts**: Groups of users (students). Enrollments link cohorts to courses.
- **Sessions**: LabSession represents a student's attempt at a lab.
- **Submissions**: Snapshots of work checked by the automated checker.

## Practice Workflow (Phase 3)
The platform uses a pluggable abstraction layer for environment management and assessment:

### 1. LabRuntimeProvider
Responsible for the lifecycle of the lab environment (provisioning, stopping, resetting).
- `LocalMockRuntimeProvider`: Simulates provisioning delay and state transitions for local development.
- `DockerRuntimeProvider` (Planned): Will manage real Docker containers.

### 2. LabCheckerProvider
Responsible for evaluating student work in the workspace.
- `LocalMockCheckerProvider`: Returns deterministic success/failure results based on mock logic.
- `ScriptCheckerProvider` (Planned): Will execute real validation scripts against the student environment.

## Data Flow
1. **Launch**: Student requests a session -> SessionService -> RuntimeProvider (Provisioning).
2. **Practice**: Student accesses Workspace -> Instructions + Mock Terminal.
3. **Assessment**: Student clicks "Run Checks" -> SubmissionService -> CheckerProvider -> Results stored in DB.
4. **Completion**: If passing score met -> LabSession marked 'completed'.
