from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import reports

app = FastAPI(title="Reports Microservice", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reports.router, prefix="/reports")
