from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph

from agent.nodes import (
    act_node,
    classify_node,
    fetch_content_node,
    hitl_gate_node,
    log_result_node,
    rule_match_node,
)
from agent.state import EmailAgentState


def _route_after_fetch(state: EmailAgentState) -> str:
    return "log_result" if state.get("error") else "classify"


def _route_after_hitl(state: EmailAgentState) -> str:
    if state.get("hitl_required") and not state.get("human_decision"):
        # hitl_gate_node already calls interrupt and pauses execution.
        return "act"
    return "act"


graph = StateGraph(EmailAgentState)

graph.add_node("fetch_content", fetch_content_node)
graph.add_node("classify", classify_node)
graph.add_node("rule_match", rule_match_node)
graph.add_node("hitl_gate", hitl_gate_node)
graph.add_node("act", act_node)
graph.add_node("log_result", log_result_node)

graph.add_edge(START, "fetch_content")
graph.add_conditional_edges(
    "fetch_content",
    _route_after_fetch,
    {
        "classify": "classify",
        "log_result": "log_result",
    },
)
graph.add_edge("classify", "rule_match")
graph.add_edge("rule_match", "hitl_gate")
graph.add_conditional_edges(
    "hitl_gate",
    _route_after_hitl,
    {
        "act": "act",
    },
)
graph.add_edge("act", "log_result")
graph.add_edge("log_result", END)

_email_agent = graph.compile(checkpointer=MemorySaver())


def build_email_agent(checkpointer):
    return graph.compile(checkpointer=checkpointer)


def set_email_agent(agent) -> None:
    global _email_agent
    _email_agent = agent


def get_email_agent():
    return _email_agent
