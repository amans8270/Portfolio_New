import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, Request, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address
from pydantic import BaseModel, EmailStr
from app.config import get_settings

settings = get_settings()
limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/contact", tags=["Contact"])


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


@router.post("")
@limiter.limit("5/minute")
async def send_contact(request: Request, payload: ContactRequest):
    # Sanitize inputs
    name = payload.name[:100].strip()
    subject = payload.subject[:200].strip()
    message = payload.message[:2000].strip()

    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        # Dev mode: just log
        print(f"📧 Contact from {payload.email}: {subject}")
        return {"message": "Message received (dev mode — email not configured)"}

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"[Portfolio] {subject} — from {name}"
        msg["From"] = settings.SMTP_USER
        msg["To"] = settings.CONTACT_RECIPIENT or settings.SMTP_USER
        msg["Reply-To"] = payload.email

        html_body = f"""
        <html><body style="font-family: sans-serif; color: #333;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> {name}</p>
          <p><strong>Email:</strong> {payload.email}</p>
          <p><strong>Subject:</strong> {subject}</p>
          <hr/>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">{message}</p>
        </body></html>
        """
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)

        return {"message": "Message sent successfully"}
    except Exception as e:
        print(f"❌ Email error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email")
