from contextlib import asynccontextmanager
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import SessionLocal, init_db
from app.database.connection import engine
from app.routes import admin_router, auth_router, public_router, student_router
from app.services import seed_database


def cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5175,http://127.0.0.1:5175")
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    with SessionLocal() as db:
        seed_database(db)
    yield


app = FastAPI(
    title="Portal Académico de Simulación API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(public_router)
app.include_router(student_router)
app.include_router(admin_router)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "portal-academico-simulacion",
        "database": engine.url.get_backend_name(),
    }
