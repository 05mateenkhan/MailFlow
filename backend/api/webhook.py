import json

from fastapi import APIRouter, HTTPException, Request, status
from svix.webhooks import Webhook, WebhookVerificationError

from agent.graph import get_email_agent
from agent.state import build_initial_state
from config import get_settings

router = APIRouter()


@router.post("/webhook")
async def resend_webhook(request: Request) -> dict[str, str]:
    secret = get_settings().resend_webhook_secret
    if not secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="RESEND_WEBHOOK_SECRET is not configured",
        )

    payload = await request.body()
    headers = {
        "svix-id": request.headers.get("svix-id", ""),
        "svix-timestamp": request.headers.get("svix-timestamp", ""),
        "svix-signature": request.headers.get("svix-signature", ""),
    }

    try:
        Webhook(secret).verify(payload, headers)
    except WebhookVerificationError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook signature",
        )

    event = json.loads(payload.decode("utf-8"))
    if event.get("type") != "email.received":
        return {"status": "ignored"}

    data = event.get("data", {})
    email_id = str(data.get("email_id") or data.get("id") or "")
    if not email_id:
        raise HTTPException(
            status_code=400, detail="Missing email_id in webhook payload"
        )
    _to_addr = str(data.get("to", ""))

    initial_state = build_initial_state(
        email_id=email_id,
        from_addr=str(data.get("from", "")),
        subject=str(data.get("subject", "")),
    )

    await get_email_agent().ainvoke(
        initial_state,
        config={"configurable": {"thread_id": email_id}},
    )

    return {"status": "ok"}
