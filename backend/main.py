from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from agent.graph import build_email_agent, set_email_agent
from api.hitl import router as hitl_router
from api.kb import router as kb_router
from api.logs import router as logs_router
from api.rules import router as rules_router
from api.stream import router as stream_router
from api.webhook import router as webhook_router
from config import get_settings
from models import create_db_and_tables

app = FastAPI(title="MailMind Backend")
settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhook_router)
app.include_router(logs_router)
app.include_router(rules_router)
app.include_router(hitl_router)
app.include_router(stream_router)
app.include_router(kb_router)


@app.on_event("startup")
async def startup_event() -> None:
    create_db_and_tables()

    app.state.checkpointer_cm = AsyncPostgresSaver.from_conn_string(
        settings.database_url
    )
    app.state.checkpointer = await app.state.checkpointer_cm.__aenter__()
    await app.state.checkpointer.setup()
    set_email_agent(build_email_agent(app.state.checkpointer))


@app.on_event("shutdown")
async def shutdown_event() -> None:
    cm = getattr(app.state, "checkpointer_cm", None)
    if cm is not None:
        await cm.__aexit__(None, None, None)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
