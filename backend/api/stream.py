import asyncio
import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

router = APIRouter(tags=["stream"])

_email_queues: dict[str, asyncio.Queue[dict]] = {}
_completed: set[str] = set()


def _queue_for(email_id: str) -> asyncio.Queue[dict]:
    queue = _email_queues.get(email_id)
    if queue is None:
        queue = asyncio.Queue()
        _email_queues[email_id] = queue
    return queue


def publish_event(email_id: str, node: str, data: dict | None = None) -> None:
    payload = {"node": node}
    if data:
        payload.update(data)
    _queue_for(email_id).put_nowait(payload)


def mark_stream_done(email_id: str, action_result: str | None) -> None:
    publish_event(email_id, "done", {"action_result": action_result})
    _completed.add(email_id)


async def _event_generator(email_id: str | None = None):
    if email_id is None:
        while True:
            yield 'data: {"type": "heartbeat"}\n\n'
            await asyncio.sleep(5)

    queue = _queue_for(email_id)
    while True:
        try:
            event = await asyncio.wait_for(queue.get(), timeout=5)
            yield f"data: {json.dumps(event)}\n\n"
        except asyncio.TimeoutError:
            yield 'data: {"type": "heartbeat"}\n\n'

        if email_id in _completed and queue.empty():
            _email_queues.pop(email_id, None)
            _completed.discard(email_id)
            break


@router.get("/stream")
async def stream(email_id: str | None = None) -> StreamingResponse:
    if email_id is None:
        raise HTTPException(status_code=400, detail="email_id query param is required")

    return StreamingResponse(
        _event_generator(email_id=email_id),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )
