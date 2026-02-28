from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from pydantic import BaseModel
from app.chatbot.rag import stream_chat_response

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/chat", tags=["Chatbot"])


class ChatRequest(BaseModel):
    message: str
    chat_history: list[list[str]] = []  # [[human, ai], ...]


@router.post("")
@limiter.limit("15/minute")
async def chat(request: Request, payload: ChatRequest):
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Convert [[human, ai]] to [(human, ai)]
    history = [(h, a) for h, a in payload.chat_history if len([h, a]) == 2]

    async def event_stream():
        async for chunk in stream_chat_response(payload.message, history):
            yield chunk

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
