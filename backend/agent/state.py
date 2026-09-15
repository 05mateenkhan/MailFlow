from typing import TypedDict


class EmailAgentState(TypedDict):
    email_id: str
    from_addr: str
    subject: str
    body: str
    attachments: list[dict]
    classification: dict | None
    matched_rule: dict | None
    proposed_action: dict | None
    hitl_required: bool
    human_decision: str | None
    action_result: str | None
    error: str | None


def build_initial_state(
    *,
    email_id: str,
    from_addr: str,
    subject: str,
    body: str = "",
    attachments: list[dict] | None = None,
) -> EmailAgentState:
    return {
        "email_id": email_id,
        "from_addr": from_addr,
        "subject": subject,
        "body": body,
        "attachments": attachments or [],
        "classification": None,
        "matched_rule": None,
        "proposed_action": None,
        "hitl_required": False,
        "human_decision": None,
        "action_result": None,
        "error": None,
    }
