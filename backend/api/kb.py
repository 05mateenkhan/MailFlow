from io import BytesIO

from fastapi import APIRouter, File, HTTPException, UploadFile
from pypdf import PdfReader

from services import rag

router = APIRouter(prefix="/kb", tags=["kb"])


@router.post("/upload")
async def upload_kb(file: UploadFile = File(...)) -> dict:
    filename = file.filename or ""
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    content = await file.read()

    if ext == "txt":
        text = content.decode("utf-8", errors="ignore")
    elif ext == "pdf":
        reader = PdfReader(BytesIO(content))
        text = "\n".join((page.extract_text() or "") for page in reader.pages)
    else:
        raise HTTPException(status_code=400, detail="Only .txt and .pdf are supported")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract any text")

    chunks = rag.count_chunks([text])
    rag.build_index([text], user_id="default")
    return {"status": "indexed", "chunks": chunks}
