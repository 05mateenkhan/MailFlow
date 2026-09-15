# MailMind 🧠✉️

> An agentic email processing system powered by LangGraph — reads incoming emails via Resend webhooks, understands intent using LLMs, and autonomously acts based on user-defined rules.

![Python](https://img.shields.io/badge/Python-3.12+-blue?style=flat-square)
![LangGraph](https://img.shields.io/badge/LangGraph-1.1+-orange?style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-0.135+-green?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## Problem

Professionals deal with 100+ emails daily. Most email clients offer rigid, keyword-based filters with zero semantic understanding. Important emails get missed, repetitive actions pile up, and rule management is painful.

**MailMind** closes this gap. It's an AI agent that:

1. Receives emails in real-time via Resend webhooks (event-driven, no polling)
2. Uses an LLM to classify intent and extract structured metadata
3. Matches classified intent against user-defined natural-language rules
4. Executes the right action — reply, label, forward, or escalate — autonomously
5. Pauses for human approval on ambiguous or high-stakes decisions via a HITL checkpoint

---

## Architecture

![MailMind Architecture Diagram](mailmind-architecture.png)

### Key Design Decisions

| Decision        | Choice                                        | Rationale                                                                 |
| --------------- | --------------------------------------------- | ------------------------------------------------------------------------- |
| Email ingestion | Resend Inbound webhooks                       | Event-driven; no polling overhead; structured JSON payload out of the box |
| Orchestration   | LangGraph `StateGraph` with conditional edges | Non-linear control flow per intent branch; checkpointable state           |
| Classification  | LLM structured output (tool-calling)          | Reliable, type-safe routing — no brittle regex or free-text parsing       |
| HITL mechanism  | `interrupt()` + PostgreSQL checkpointer       | Production-grade pause/resume; graph state survives server restarts       |
| Reply grounding | RAG over user-uploaded KB (FAISS)             | Accurate, citation-backed auto-replies; per-user namespaced indices       |
| Rule storage    | JSON schema rules in PostgreSQL               | Runtime-configurable without redeployment; easy CRUD from dashboard       |

---

## Features

### Core Agent Capabilities

- **Semantic email classification** — intent detection across categories: invoice, support query, meeting request, spam, urgent alert, general
- **Structured metadata extraction** — sender, urgency score, topic, entities (names, amounts, dates) via LLM tool-calling
- **Rule engine** — natural-language rules stored as structured JSON, matched against classified intents at runtime
- **Action nodes** — auto-reply (RAG-grounded), label/archive, forward to contact, escalate to human
- **HITL checkpoint** — agent pauses on low-confidence or high-stakes emails; human approves/modifies proposed action from dashboard before execution resumes
- **Attachment handling** — fetches and processes attachments via Resend Attachments API; extracts text from PDFs for classification context

### Infrastructure

- **Webhook verification** — Resend Svix signature validation on every incoming event
- **Two-step email fetch** — webhook triggers metadata ingest; full body + attachments fetched from Resend Receiving API before agent runs
- **Audit trail** — every email processed, classification result, action taken, and latency logged to PostgreSQL
- **SSE streaming** — FastAPI server-sent events stream agent node transitions to the dashboard in real time

### Dashboard (Next.js)

- Live feed of processed emails with classification badges
- HITL approval queue — view agent reasoning, approve or override the proposed action
- Rule editor — create, edit, delete rules in plain English
- Knowledge base upload — drag-and-drop documents to populate the RAG index
- Audit logs — complete history of processed emails, actions taken, and rule matches

---

## Tech Stack

| Layer               | Technology                                                           |
| ------------------- | -------------------------------------------------------------------- |
| Email ingestion     | Resend Inbound (webhook `email.received`) + Resend SDK + Svix        |
| Agent orchestration | LangGraph 1.1+ `StateGraph` + PostgreSQL checkpointer                |
| LLM                 | Groq via ChatGroq (structured output via JSON schema)                |
| Vector search       | FAISS (in-memory, per-user namespaced indices)                       |
| API                 | FastAPI 0.135+ + SSE streaming                                       |
| Database            | PostgreSQL via SQLAlchemy + sqlmodel                                 |
| Frontend            | Next.js 16 + React 19 + Tailwind CSS v4 + TypeScript                 |
| Document parsing    | PyPDF (PDF extraction for attachments)                               |
| Containerization    | Docker + Docker Compose                                              |

---

## Project Structure

```
mailmind/
├── backend/
│   ├── agent/
│   │   ├── graph.py          # LangGraph StateGraph definition
│   │   ├── nodes.py          # Node functions (classify, rule_match, actions)
│   │   ├── state.py          # EmailAgentState TypedDict
│   │   └── tools.py          # LLM tool schemas for structured output
│   ├── api/
│   │   ├── webhook.py        # POST /webhook — Resend inbound handler
│   │   ├── rules.py          # CRUD /rules endpoints
│   │   ├── hitl.py           # GET/POST /hitl — approval queue
│   │   ├── logs.py           # GET /logs — audit trail and email processing history
│   │   └── stream.py         # GET /stream — SSE node transitions
│   ├── services/
│   │   ├── resend_client.py  # Resend SDK wrapper (fetch body, attachments, reply)
│   │   ├── rag.py            # FAISS index build + retrieval
│   │   └── rules_engine.py   # Rule matching logic
│   ├── models.py             # SQLModel DB schemas
│   └── main.py               # FastAPI app entry
├── frontend/
│   ├── app/
│   │   ├── page.tsx          # Live email feed
│   │   ├── hitl/page.tsx     # HITL approval queue
│   │   └── rules/page.tsx    # Rule editor
│   └── components/
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL
- Resend account (free tier works)
- Groq API key

### 1. Clone and configure

```bash
git clone https://github.com/sujeetgund/mailmind.git
cd mailmind
cp .env.example .env
# Fill in RESEND_API_KEY, GROQ_API_KEY, DATABASE_URL
```

### 2. Run backend

```bash
cd backend
uv sync
uv run uvicorn main:app --reload
```

### 3. Expose webhook for local dev

```bash
# Option A — ngrok
ngrok http 8000

# Option B — Resend CLI
resend emails receiving listen
```

Register your public URL as a webhook in the Resend dashboard and subscribe to `email.received`.

### 4. Run frontend

```bash
cd frontend
pnpm install
pnpm dev
```

### 5. Docker (full stack)

```bash
docker-compose up --build
```

The system will start:

- PostgreSQL on `localhost:5432`
- FastAPI backend on `localhost:8000` (docs at `/docs`)
- Next.js frontend on `localhost:3000`

---

## How It Works — Step by Step

1. **Email arrives** at your `<alias>@<id>.resend.app` address (or custom domain)
2. **Resend fires** a `POST` to `/webhook` with metadata (from, to, subject, attachment IDs)
3. **FastAPI handler** verifies the Svix signature, then calls the Resend Receiving API to fetch the full email body and attachments
4. **LangGraph graph starts** with the full email payload in `EmailAgentState`
5. **`classify` node** calls the LLM with tool-calling — returns structured `EmailClassification` (intent, urgency, entities)
6. **`rule_match` node** compares classification against user's stored rules; selects the best matching action
7. **`hitl_gate` node** checks confidence score and rule flags — if below threshold, calls `interrupt()` to pause the graph
8. **Dashboard shows** the paused email with the agent's proposed action; user approves or overrides
9. **Graph resumes** with the approved action and executes the appropriate node (reply/forward/label)
10. **`log_result` node** writes the full audit record to PostgreSQL and emits an SSE event to the dashboard

---

## LangGraph State Schema

```python
class EmailAgentState(TypedDict):
    email_id: str
    from_addr: str
    subject: str
    body: str
    attachments: list[dict]
    classification: EmailClassification | None
    matched_rule: Rule | None
    proposed_action: Action | None
    hitl_required: bool
    human_decision: str | None
    action_result: str | None
    error: str | None
```

---

## Environment Variables

```env
# Resend
RESEND_API_KEY=re_xxxx
RESEND_WEBHOOK_SECRET=whsec_xxxx   # Svix signing secret

# LLM
GROQ_API_KEY=gsk_xxxx
LLM_MODEL=llama-3.3-70b-versatile

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/mailmind

# App
HITL_CONFIDENCE_THRESHOLD=0.75
```
