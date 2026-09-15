import logging
from typing import Any

import requests
import resend

from config import get_settings

LOGGER = logging.getLogger(__name__)


def _settings():
    return get_settings()


def _auth_headers() -> dict[str, str]:
    api_key = _settings().resend_api_key
    if not api_key:
        raise RuntimeError("RESEND_API_KEY is not set")
    resend.api_key = api_key
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }


def _get(path: str) -> dict[str, Any]:
    settings = _settings()
    response = requests.get(
        f"{settings.resend_api_base_url}{path}",
        headers=_auth_headers(),
        timeout=20,
    )
    response.raise_for_status()
    return response.json()


def get_email_body(email_id: str) -> str:
    payload = _get(f"/emails/receiving/{email_id}")
    data = payload.get("data", payload)
    return data.get("text") or data.get("text_body") or data.get("body") or ""


def get_attachments(email_id: str) -> list[dict]:
    payload = _get(f"/emails/receiving/{email_id}/attachments")
    data = payload.get("data", [])
    attachments: list[dict] = []
    for item in data:
        attachments.append(
            {
                "id": item.get("id"),
                "filename": item.get("filename") or item.get("name"),
                "content_type": item.get("content_type") or item.get("mime_type"),
                "size": item.get("size"),
            }
        )
    return attachments


def send_reply(email_id: str, to: str, subject: str, body: str) -> None:
    settings = _settings()
    params = {
        "from": settings.resend_from_email,
        "to": [to],
        "subject": subject,
        "text": body,
        "headers": {
            "In-Reply-To": email_id,
            "References": email_id,
        },
    }
    resend.Emails.send(params)
    LOGGER.info("Sent reply for email_id=%s to=%s", email_id, to)


def noop_label(email_id: str, label: str) -> None:
    LOGGER.info("noop_label called for email_id=%s label=%s", email_id, label)
