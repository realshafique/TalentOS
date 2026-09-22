import os
import requests

from dotenv import load_dotenv

load_dotenv()

JINA_API_KEY = os.getenv("JINA_API_KEY")

JINA_URL = "https://api.jina.ai/v1/embeddings"

MODEL_NAME = "jina-embeddings-v3"
EMBEDDING_DIMENSION = 512


def create_embedding(
    text: str,
    task: str = "retrieval.query"
):
    if not JINA_API_KEY:
        raise RuntimeError("JINA_API_KEY is not set")

    response = requests.post(
        JINA_URL,
        headers={
            "Authorization": f"Bearer {JINA_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": MODEL_NAME,
            "task": task,
            "dimensions": EMBEDDING_DIMENSION,
            "late_chunking": False,
            "input": [text],
        },
        timeout=60,
    )

    if response.status_code != 200:
        raise RuntimeError(
            f"Jina embedding request failed: "
            f"{response.status_code} - {response.text}"
        )

    data = response.json()

    if "data" not in data or not data["data"]:
        raise RuntimeError(
            "Jina API returned no embedding."
        )

    embedding = data["data"][0]["embedding"]

    if len(embedding) != EMBEDDING_DIMENSION:
        raise RuntimeError(
            f"Expected {EMBEDDING_DIMENSION} dimensions, "
            f"but received {len(embedding)}."
        )

    return embedding