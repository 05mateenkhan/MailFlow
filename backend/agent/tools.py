from typing import Literal

from pydantic import BaseModel, Field


class EmailClassification(BaseModel):
    intent: Literal[
        "invoice",
        "support_query",
        "meeting_request",
        "spam",
        "urgent_alert",
        "general",
    ]
    urgency: int = Field(ge=1, le=5)
    summary: str
    entities: dict = Field(default_factory=dict)
    confidence: float = Field(ge=0.0, le=1.0)


email_classification_schema = EmailClassification.model_json_schema()
