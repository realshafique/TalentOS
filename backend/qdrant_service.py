import os

from dotenv import load_dotenv
from qdrant_client import QdrantClient


load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")


if not QDRANT_URL:
    raise RuntimeError("QDRANT_URL is not set")

if not QDRANT_API_KEY:
    raise RuntimeError("QDRANT_API_KEY is not set")


client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
    prefer_grpc=False,
)