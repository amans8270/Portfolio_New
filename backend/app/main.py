import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.database import connect_db, close_db
from app.auth.router import router as auth_router
from app.projects.router import router as projects_router
from app.resume.router import router as resume_router
from app.contact.router import router as contact_router
from app.chatbot.router import router as chat_router
from app.chatbot.rag import rebuild_index

settings = get_settings()
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    # Build RAG index on startup
    try:
        await rebuild_index()
    except Exception as e:
        print(f"⚠️ RAG index startup failed (check OPENAI_API_KEY): {e}")
    yield
    await close_db()


app = FastAPI(
    title="Aman Singh — Portfolio API",
    description="Production API for Aman Singh's AI Portfolio Platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── Rate limiting ──────────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(resume_router)
app.include_router(contact_router)
app.include_router(chat_router)


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "Aman Singh Portfolio API is running 🚀"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
