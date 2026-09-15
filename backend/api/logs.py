from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from models import EmailLog, get_session

router = APIRouter(tags=["logs"])


@router.get("/logs")
def list_logs(
    limit: int = Query(default=50, ge=1, le=200),
    session: Session = Depends(get_session),
) -> list[dict]:
    rows = (
        session.query(EmailLog).order_by(EmailLog.created_at.desc()).limit(limit).all()
    )
    return [
        {
            "id": row.id,
            "email_id": row.email_id,
            "from_addr": row.from_addr,
            "subject": row.subject,
            "intent": row.intent,
            "urgency": row.urgency,
            "confidence": row.confidence,
            "matched_rule_id": row.matched_rule_id,
            "action_type": row.action_type,
            "action_value": row.action_value,
            "hitl_required": row.hitl_required,
            "human_decision": row.human_decision,
            "action_result": row.action_result,
            "created_at": row.created_at.isoformat(),
        }
        for row in rows
    ]
