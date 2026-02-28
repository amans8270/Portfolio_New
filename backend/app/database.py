from motor.motor_asyncio import AsyncIOMotorClient
from app.config import get_settings

settings = get_settings()

client = None
db = None

async def connect_db():
    global client, db
    try:
        # Reduced timeout logic ensures it fails fast if connection gives issues
        client = AsyncIOMotorClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)
        await client.server_info()  # Test connection
        db = client[settings.DB_NAME]
        # Create indexes
        await db.users.create_index("email", unique=True)
        await db.projects.create_index("order")
        print("✅ Connected to MongoDB")
    except Exception as e:
        print(f"⚠️ Could not connect to MongoDB: {type(e).__name__} - {e}")
        raise e  # Fail loudly so we know the new connection string has issues

async def close_db():
    global client
    if client and hasattr(client, "close"):
        client.close()
        print("🔌 Disconnected from MongoDB")


def get_db():
    return db
