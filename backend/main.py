from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import Profile, Project
from schemas import ProfileCreate


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="TalentOS API",
    description="Backend API for TalentOS",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():

    return {
        "message": "TalentOS backend is running"
    }


@app.post("/profiles")
def create_profile(
    profile: ProfileCreate,
    db: Session = Depends(get_db)
):

    existing_profile = (
        db.query(Profile)
        .filter(Profile.email == profile.email)
        .first()
    )

    if existing_profile:

        raise HTTPException(
            status_code=400,
            detail="A profile with this email already exists."
        )


    new_profile = Profile(
        name=profile.name,
        email=profile.email,
        degree=profile.degree,
        year=profile.year,
        about=profile.about,
        skills=", ".join(profile.skills),
        interests=", ".join(profile.interests),
        availability=profile.availability,
    )


    db.add(new_profile)

    db.flush()


    for project in profile.projects:

        new_project = Project(
            profile_id=new_profile.id,
            name=project.name,
            description=project.description,
            technologies=project.technologies,
        )

        db.add(new_project)


    db.commit()

    db.refresh(new_profile)


    return {
        "message": "Profile created successfully",

        "profile": {
            "id": new_profile.id,
            "name": new_profile.name,
            "email": new_profile.email,
            "degree": new_profile.degree,
            "year": new_profile.year,
            "about": new_profile.about,
            "skills": new_profile.skills,
            "interests": new_profile.interests,
            "availability": new_profile.availability,

            "projects": [
                {
                    "id": project.id,
                    "name": project.name,
                    "description": project.description,
                    "technologies": project.technologies,
                }
                for project in new_profile.projects
            ],
        }
    }


@app.get("/profiles")
def get_profiles(
    db: Session = Depends(get_db)
):

    profiles = db.query(Profile).all()

    return [
        {
            "id": profile.id,
            "name": profile.name,
            "email": profile.email,
            "degree": profile.degree,
            "year": profile.year,
            "about": profile.about,
            "skills": profile.skills,
            "interests": profile.interests,
            "availability": profile.availability,

            "projects": [
                {
                    "id": project.id,
                    "name": project.name,
                    "description": project.description,
                    "technologies": project.technologies,
                }
                for project in profile.projects
            ],
        }
        for profile in profiles
    ]