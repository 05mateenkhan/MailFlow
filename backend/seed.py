from models import Rule, create_db_and_tables, session_scope


def seed_rules() -> None:
    rules = [
        {
            "name": "Invoice Label",
            "description": "If invoice, label as invoices",
            "intent_match": "invoice",
            "urgency_min": None,
            "action_type": "label",
            "action_value": "invoices",
            "require_hitl": False,
        },
        {
            "name": "Urgent Escalation",
            "description": "If urgent alert, escalate immediately",
            "intent_match": "urgent_alert",
            "urgency_min": None,
            "action_type": "escalate",
            "action_value": "",
            "require_hitl": True,
        },
        {
            "name": "Support Auto Reply",
            "description": "If support query, send acknowledgment reply",
            "intent_match": "support_query",
            "urgency_min": None,
            "action_type": "reply",
            "action_value": "Thanks for reaching out! We'll get back to you within 24 hours.",
            "require_hitl": False,
        },
    ]

    with session_scope() as session:
        for item in rules:
            exists = (
                session.query(Rule)
                .filter(
                    Rule.intent_match == item["intent_match"], Rule.name == item["name"]
                )
                .first()
            )
            if exists is None:
                session.add(Rule(user_id="default", **item))


if __name__ == "__main__":
    create_db_and_tables()
    seed_rules()
    print("Seeded rules")
