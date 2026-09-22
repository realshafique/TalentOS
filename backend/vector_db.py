from qdrant_client.models import VectorParams, Distance

from qdrant_service import client


COLLECTION_NAME = "talentos_v2"

VECTOR_SIZE = 512


def create_collection():

    if not client.collection_exists(COLLECTION_NAME):

        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=VECTOR_SIZE,
                distance=Distance.COSINE,
            ),
        )