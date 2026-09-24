from database import SessionLocal
from models import Profile

from embedding import create_embedding
from profile_embedding import build_profile_text

from qdrant_client.models import PointStruct

from qdrant_service import client
from vector_db import COLLECTION_NAME


def migrate_profiles():

    db = SessionLocal()

    try:
        profiles = db.query(Profile).all()

        print(f"Found {len(profiles)} profiles.")

        points = []

        for profile in profiles:

            print(
                f"Embedding profile {profile.id}: "
                f"{profile.name}"
            )

            profile_text = build_profile_text(profile)

            embedding = create_embedding(
                profile_text,
                task="retrieval.passage"
            )

            point = PointStruct(
                id=profile.id,
                vector=embedding,
                payload={
                    "profile_id": profile.id,
                    "name": profile.name,
                    "email": profile.email,
                    "phone": profile.phone,
                    "degree": profile.degree,
                    "year": profile.year,
                    "skills": profile.skills,
                    "interests": profile.interests,
                    "availability": profile.availability,
                    "profile": profile_text,
                },
            )

            points.append(point)

        if points:

            client.upsert(
                collection_name=COLLECTION_NAME,
                points=points,
            )

        print()
        print("Migration completed successfully.")
        print(f"Migrated profiles: {len(points)}")

    finally:
        db.close()


if __name__ == "__main__":
    migrate_profiles()