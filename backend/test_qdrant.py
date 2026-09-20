from vector_db import create_collection
from qdrant_service import client


create_collection()


print(
    client.get_collection(
        "talentos"
    )
)

print("Qdrant connection successful!")