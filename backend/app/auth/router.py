from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends
from app.database import get_db
from app.auth.utils import verify_password, create_access_token, hash_password
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/auth", tags=["Auth"])


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    secret_key: str  # one-time secret to prevent open registration


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_db()
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    token = create_access_token({"sub": user["email"]})
    return TokenResponse(access_token=token)


@router.post("/register", status_code=201)
async def register(payload: RegisterRequest):
    """One-time admin registration protected by a secret key."""
    from app.config import get_settings
    settings = get_settings()
    if payload.secret_key != settings.JWT_SECRET:
        raise HTTPException(status_code=403, detail="Invalid secret key")
    db = get_db()
    existing = await db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=409, detail="User already exists")
    await db.users.insert_one({
        "email": payload.email,
        "hashed_password": hash_password(payload.password),
        "role": "admin",
        "created_at": __import__("datetime").datetime.utcnow(),
    })
    return {"message": "Admin created successfully"}
