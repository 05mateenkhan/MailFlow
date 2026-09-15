from __future__ import annotations

from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEndpointEmbeddings

from config import get_settings

_INDEX_ROOT = Path("./kb_indices")
_CONTEXT_WINDOW_TOKENS = 512


def _embeddings() -> HuggingFaceEndpointEmbeddings:
    settings = get_settings()
    return HuggingFaceEndpointEmbeddings(
        model="BAAI/bge-small-en-v1.5",
        huggingfacehub_api_token=settings.huggingfacehub_api_token,
    )


def _split_documents(documents: list[str]) -> list[str]:
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks: list[str] = []
    for doc in documents:
        for chunk in splitter.split_text(doc):
            chunks.append(_trim_tokens(chunk, _CONTEXT_WINDOW_TOKENS))
    return chunks


def _trim_tokens(text: str, max_tokens: int) -> str:
    # Lightweight token approximation using whitespace-separated words.
    tokens = text.split()
    if len(tokens) <= max_tokens:
        return text
    return " ".join(tokens[:max_tokens])


def build_index(documents: list[str], user_id: str = "default") -> None:
    chunks = _split_documents(documents)
    if not chunks:
        return

    user_dir = _INDEX_ROOT / user_id
    user_dir.mkdir(parents=True, exist_ok=True)
    store = FAISS.from_texts(chunks, embedding=_embeddings())
    store.save_local(str(user_dir))


def count_chunks(documents: list[str]) -> int:
    return len(_split_documents(documents))


def retrieve_context(query: str, user_id: str = "default", k: int = 3) -> str:
    user_dir = _INDEX_ROOT / user_id
    if not user_dir.exists():
        return ""

    try:
        store = FAISS.load_local(
            str(user_dir),
            embeddings=_embeddings(),
            allow_dangerous_deserialization=True,
        )
    except Exception:
        return ""

    docs = store.similarity_search(query, k=k)
    if not docs:
        return ""

    joined = "\n\n".join(doc.page_content for doc in docs)
    return _trim_tokens(joined, _CONTEXT_WINDOW_TOKENS)
