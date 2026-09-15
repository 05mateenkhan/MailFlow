from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from langgraph.types import Command

from agent.graph import get_email_agent
from models import HitlItem, get_session

router = APIRouter(prefix="/hitl", tags=["hitl"])


class HitlApprovePayload(BaseModel):
    action: dict | None = None


@router.get("")
def list_pending(session: Session = Depends(get_session)) -> list[dict]:
    rows = (
        session.query(HitlItem)
        .filter(HitlItem.status == "pending")
        .order_by(HitlItem.created_at.asc())
        .all()
    )
    return [
        {
            "id": row.id,
            "email_id": row.email_id,
            "subject": row.subject,
            "from_addr": row.from_addr,
            "classification": row.classification,
            "proposed_action": row.proposed_action,
            "status": row.status,
            "human_action": row.human_action,
            "created_at": row.created_at.isoformat(),
        }
        for row in rows
    ]


@router.post("/{email_id}/approve")
async def approve_hitl(
    email_id: str,
    payload: HitlApprovePayload,
    session: Session = Depends(get_session),
) -> dict:
    row = (
        session.query(HitlItem)
        .filter(HitlItem.email_id == email_id, HitlItem.status == "pending")
        .first()
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Pending HITL item not found")

    decision: dict
    if payload.action:
        row.status = "modified"
        row.human_action = payload.action
        decision = {"decision": "modified", "action": payload.action}
    else:
        row.status = "approved"
        decision = {"decision": "approved"}

    session.commit()

    await get_email_agent().ainvoke(
        Command(resume=decision),
        config={"configurable": {"thread_id": email_id}},
    )
    return {"status": "resumed"}


@router.post("/{email_id}/reject")
async def reject_hitl(email_id: str, session: Session = Depends(get_session)) -> dict:
    row = (
        session.query(HitlItem)
        .filter(HitlItem.email_id == email_id, HitlItem.status == "pending")
        .first()
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Pending HITL item not found")

    row.status = "rejected"
    session.commit()

    await get_email_agent().ainvoke(
        Command(resume="reject"),
        config={"configurable": {"thread_id": email_id}},
    )
    return {"status": "rejected"}
