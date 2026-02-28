import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from datetime import datetime
from app.database import get_db
from app.auth.utils import get_current_admin
from app.config import get_settings

router = APIRouter(prefix="/resume", tags=["Resume"])
settings = get_settings()


def validate_pdf(file: UploadFile):
    if file.content_type not in ("application/pdf",):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")


@router.post("/upload", status_code=201)
async def upload_resume(file: UploadFile = File(...), _=Depends(get_current_admin)):
    validate_pdf(file)
    
    contents = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File too large (max {settings.MAX_UPLOAD_SIZE_MB}MB)")
    
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    safe_filename = "resume.pdf"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    db = get_db()
    # Deactivate all previous entries
    await db.resume_meta.update_many({}, {"$set": {"is_active": False}})
    await db.resume_meta.insert_one({
        "filename": safe_filename,
        "file_path": file_path,
        "uploaded_at": datetime.utcnow(),
        "is_active": True,
    })

    # Rebuild RAG index with new resume
    try:
        from app.chatbot.rag import rebuild_index
        await rebuild_index()
    except Exception as e:
        print(f"⚠️ RAG index rebuild failed: {e}")

    return {"message": "Resume uploaded successfully", "filename": safe_filename}


@router.get("/download")
async def download_resume():
    db = get_db()
    meta = await db.resume_meta.find_one({"is_active": True})
    if not meta:
        raise HTTPException(status_code=404, detail="No resume uploaded yet")
    
    file_path = meta["file_path"]
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Resume file not found on server")
    
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename="Aman_Singh_Resume.pdf",
        headers={"Content-Disposition": "attachment; filename=Aman_Singh_Resume.pdf"},
    )


@router.get("/info")
async def resume_info():
    db = get_db()
    meta = await db.resume_meta.find_one({"is_active": True})
    if not meta:
        return {"available": False}
    return {
        "available": True,
        "uploaded_at": meta["uploaded_at"],
        "filename": meta["filename"],
    }
