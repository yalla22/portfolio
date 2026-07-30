# -*- coding: utf-8 -*-
"""Pluggable text embedder for semantic ranking (JD ↔ projects/skills).

Backend resolution (first that works wins):
  1. neural  — sentence-transformers (all-MiniLM-L6-v2); true semantic similarity.
  2. tfidf   — scikit-learn TF-IDF cosine; lexical, zero extra deps, always available.

Public API:
  backend()                 -> "neural" | "tfidf"
  rank(query, items)        -> list[float] cosine similarity of query vs each item
"""
from __future__ import annotations
import numpy as np

_BACKEND: str | None = None
_MODEL = None
_MODEL_NAME = "all-MiniLM-L6-v2"


def backend() -> str:
    """Resolve and cache the embedding backend (loads the neural model once)."""
    global _BACKEND, _MODEL
    if _BACKEND:
        return _BACKEND
    try:
        from sentence_transformers import SentenceTransformer
        _MODEL = SentenceTransformer(_MODEL_NAME)
        _BACKEND = "neural"
    except Exception:
        _BACKEND = "tfidf"
    return _BACKEND


def backend_label() -> str:
    b = backend()
    return f"neural embeddings ({_MODEL_NAME})" if b == "neural" else "TF-IDF cosine (sklearn)"


def _neural_rank(query: str, items: list[str]) -> list[float]:
    embs = _MODEL.encode([query] + items, normalize_embeddings=True,
                         show_progress_bar=False)
    q, mat = embs[0], embs[1:]
    return [float(np.dot(q, m)) for m in mat]


def _tfidf_rank(query: str, items: list[str]) -> list[float]:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    vec = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), sublinear_tf=True)
    X = vec.fit_transform([query] + items)
    return [float(s) for s in cosine_similarity(X[0:1], X[1:])[0]]


def rank(query: str, items: list[str]) -> list[float]:
    """Cosine similarity of `query` against each string in `items` (0..1)."""
    if not items:
        return []
    if not (query or "").strip():
        return [0.0] * len(items)
    if backend() == "neural":
        try:
            return _neural_rank(query, items)
        except Exception:
            pass  # fall through to lexical if the model misbehaves at call time
    return _tfidf_rank(query, items)


def embed(texts: list[str]):
    """Batch-embed texts into L2-normalized vectors (np.ndarray, NxD).

    Returns None when the neural backend isn't available (caller should then
    use its own TF-IDF path — TF-IDF vectors aren't comparable across calls).
    """
    if not texts or backend() != "neural":
        return None
    return np.asarray(
        _MODEL.encode(list(texts), normalize_embeddings=True,
                      batch_size=64, show_progress_bar=False),
        dtype="float32")
