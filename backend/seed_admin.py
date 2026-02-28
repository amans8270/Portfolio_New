"""
Seed script: creates the initial admin user.
Run once: python seed_admin.py
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime
from app.config import get_settings

settings = get_settings()

MONGO_URI = settings.MONGO_URI
DB_NAME = settings.DB_NAME
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@portfolio.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "ChangeMe123!")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def seed():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if existing:
        print(f"✅ Admin already exists: {ADMIN_EMAIL}")
        client.close()
        return

    await db.users.insert_one({
        "email": ADMIN_EMAIL,
        "hashed_password": pwd_context.hash(ADMIN_PASSWORD),
        "role": "admin",
        "created_at": datetime.utcnow(),
    })
    print(f"🎉 Admin created: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    print("⚠️  Change the password immediately after first login!")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
