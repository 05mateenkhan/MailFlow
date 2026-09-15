from models import Rule


def match_rule(classification: dict, db_session) -> Rule | None:
    intent = str(classification.get("intent", "general"))
    urgency = int(classification.get("urgency", 1))

    rules = db_session.query(Rule).filter(Rule.intent_match == intent).all()
    for rule in rules:
        if rule.urgency_min is None or urgency >= rule.urgency_min:
            return rule

    # Fallback rule-like action when nothing matches.
    return Rule(
        user_id="default",
        name="fallback",
        description="Fallback label action",
        intent_match=intent,
        urgency_min=None,
        action_type="label",
        action_value=intent,
        require_hitl=False,
    )
