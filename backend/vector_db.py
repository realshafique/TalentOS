from qdrant_client.models import Distance, VectorParams

from qdrant_service import client


COLLECTION_NAME = "talentos"


def create_collection():

    if not client.collection_exists(
        COLLECTION_NAME
    ):

        client.create_collection(
            collection_name=COLLECTION_NAME,

            vectors_config=VectorParams(
                size=384,
                distance=Distance.COSINE
            )
        )