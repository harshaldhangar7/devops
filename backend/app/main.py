from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.endpoints import auth, users, dashboard, courses, labs, cohorts

app = FastAPI(
    title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["dashboard"])
app.include_router(courses.router, prefix=f"{settings.API_V1_STR}/courses", tags=["courses"])
app.include_router(labs.router, prefix=f"{settings.API_V1_STR}/labs", tags=["labs"])
app.include_router(cohorts.router, prefix=f"{settings.API_V1_STR}/cohorts", tags=["cohorts"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
