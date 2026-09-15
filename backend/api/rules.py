from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models import Rule, get_session

router = APIRouter(prefix="/rules", tags=["rules"])


class RuleCreate(BaseModel):
    user_id: str = Field(default="default")
    name: str
    description: str
    intent_match: str
    urgency_min: int | None = None
    action_type: str
    action_value: str
    require_hitl: bool = False


class RuleUpdate(BaseModel):
    user_id: str | None = None
    name: str | None = None
    description: str | None = None
    intent_match: str | None = None
    urgency_min: int | None = None
    action_type: str | None = None
    action_value: str | None = None
    require_hitl: bool | None = None


@router.get("")
def list_rules(session: Session = Depends(get_session)) -> list[dict]:
    rows = session.query(Rule).order_by(Rule.id.asc()).all()
    return [
        {
            "id": row.id,
            "user_id": row.user_id,
            "name": row.name,
            "description": row.description,
            "intent_match": row.intent_match,
            "urgency_min": row.urgency_min,
            "action_type": row.action_type,
            "action_value": row.action_value,
            "require_hitl": row.require_hitl,
            "created_at": row.created_at.isoformat(),
        }
        for row in rows
    ]


@router.post("")
def create_rule(payload: RuleCreate, session: Session = Depends(get_session)) -> dict:
    row = Rule(**payload.model_dump())
    session.add(row)
    session.commit()
    session.refresh(row)
    return {"id": row.id}


@router.put("/{rule_id}")
def update_rule(
    rule_id: int,
    payload: RuleUpdate,
    session: Session = Depends(get_session),
) -> dict:
    row = session.query(Rule).filter(Rule.id == rule_id).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Rule not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, key, value)

    session.commit()
    return {"status": "updated"}


@router.delete("/{rule_id}")
def delete_rule(rule_id: int, session: Session = Depends(get_session)) -> dict:
    row = session.query(Rule).filter(Rule.id == rule_id).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Rule not found")

    session.delete(row)
    session.commit()
    return {"status": "deleted"}
