from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from qdrant_client.models import PointStruct

from database import engine, Base, get_db
from models import Profile, Project, Team, TeamMember

from schemas import (
    ProfileCreate,
    SearchRequest,
    TeamCreate,
    TeamMemberCreate,
)

from profile_embedding import create_profile_embedding
from embedding import create_embedding

from vector_db import (
    create_collection,
    COLLECTION_NAME,
)

from qdrant_service import client


# ==================================================
# STARTUP
# ==================================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    print("Starting TalentOS backend...")

    try:
        print("Connecting to database...")
        Base.metadata.create_all(bind=engine)
        print("Database ready.")

        print("Connecting to Qdrant...")
        create_collection()
        print("Qdrant ready.")

    except Exception as e:
        print(f"Startup error: {e}")
        raise

    yield

    print("TalentOS backend shutting down...")


# ==================================================
# FASTAPI APP
# ==================================================

app = FastAPI(
    title="TalentOS API",
    description="Backend API for TalentOS",
    version="1.0.0",
    lifespan=lifespan,
)


# ==================================================
# CORS
# ==================================================

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


# ==================================================
# HOME
# ==================================================

@app.get("/")
def home():
    return {
        "message": "TalentOS backend is running"
    }


# ==================================================
# CREATE PROFILE
# ==================================================

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
            detail="A profile with this email already exists.",
        )

    new_profile = Profile(
        name=profile.name,
        email=profile.email,
        phone=profile.phone,
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

    profile_text, embedding = create_profile_embedding(profile)

    qdrant_point = PointStruct(
        id=new_profile.id,
        vector=embedding,
        payload={
            "profile_id": new_profile.id,
            "name": new_profile.name,
            "email": new_profile.email,
            "phone": new_profile.phone,
            "degree": new_profile.degree,
            "year": new_profile.year,
            "skills": profile.skills,
            "interests": profile.interests,
            "availability": profile.availability,
            "profile": profile_text,
        },
    )

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=[qdrant_point],
    )

    return {
        "message": "Profile created successfully",
        "profile": {
            "id": new_profile.id,
            "name": new_profile.name,
            "email": new_profile.email,
            "phone": new_profile.phone,
            "degree": new_profile.degree,
            "year": new_profile.year,
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
                for project in new_profile.projects
            ],
        },
    }


# ==================================================
# GET ALL PROFILES
# ==================================================

@app.get("/profiles")
def get_profiles(db: Session = Depends(get_db)):

    profiles = db.query(Profile).all()

    return [
        {
            "id": profile.id,
            "name": profile.name,
            "email": profile.email,
            "phone": profile.phone,
            "degree": profile.degree,
            "year": profile.year,
            "about": profile.about,
            "skills": profile.skills,
            "interests": profile.interests,
            "availability": profile.availability,
            "projects": profile.projects,
        }
        for profile in profiles
    ]


# ==================================================
# UPDATE PROFILE
# ==================================================

@app.put("/profiles/{profile_id}")
def update_profile(
    profile_id: int,
    profile: ProfileCreate,
    db: Session = Depends(get_db)
):

    existing_profile = (
        db.query(Profile)
        .filter(Profile.id == profile_id)
        .first()
    )

    if not existing_profile:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found.",
        )

    duplicate_email = (
        db.query(Profile)
        .filter(
            Profile.email == profile.email,
            Profile.id != profile_id,
        )
        .first()
    )

    if duplicate_email:
        raise HTTPException(
            status_code=400,
            detail="Another profile with this email already exists.",
        )

    existing_profile.name = profile.name
    existing_profile.email = profile.email
    existing_profile.phone = profile.phone
    existing_profile.degree = profile.degree
    existing_profile.year = profile.year
    existing_profile.about = profile.about
    existing_profile.skills = ", ".join(profile.skills)
    existing_profile.interests = ", ".join(profile.interests)
    existing_profile.availability = profile.availability

    for project in list(existing_profile.projects):
        db.delete(project)

    db.flush()

    for project in profile.projects:
        new_project = Project(
            profile_id=existing_profile.id,
            name=project.name,
            description=project.description,
            technologies=project.technologies,
        )

        db.add(new_project)

    db.commit()
    db.refresh(existing_profile)

    profile_text, embedding = create_profile_embedding(profile)

    qdrant_point = PointStruct(
        id=existing_profile.id,
        vector=embedding,
        payload={
            "profile_id": existing_profile.id,
            "name": existing_profile.name,
            "email": existing_profile.email,
            "phone": existing_profile.phone,
            "degree": existing_profile.degree,
            "year": existing_profile.year,
            "skills": profile.skills,
            "interests": profile.interests,
            "availability": profile.availability,
            "profile": profile_text,
        },
    )

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=[qdrant_point],
    )

    return {
        "message": "Profile updated successfully",
        "profile": {
            "id": existing_profile.id,
            "name": existing_profile.name,
            "email": existing_profile.email,
            "phone": existing_profile.phone,
            "degree": existing_profile.degree,
            "year": existing_profile.year,
            "about": existing_profile.about,
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
                for project in existing_profile.projects
            ],
        },
    }


# ==================================================
# CREATE TEAM
# ==================================================

@app.post("/teams")
def create_team(
    team: TeamCreate,
    db: Session = Depends(get_db)
):

    new_team = Team(
        name=team.name,
        project=team.project,
    )

    db.add(new_team)
    db.commit()
    db.refresh(new_team)

    return {
        "message": "Team created successfully",
        "team": {
            "id": new_team.id,
            "name": new_team.name,
            "project": new_team.project,
            "members": [],
        },
    }


# ==================================================
# GET ALL TEAMS
# ==================================================

@app.get("/teams")
def get_teams(
    db: Session = Depends(get_db)
):

    teams = db.query(Team).all()

    results = []

    for team in teams:

        members = []

        for member in team.members:
            members.append(
                {
                    "id": member.id,
                    "profile_id": member.profile_id,
                    "name": member.profile.name,
                    "degree": member.profile.degree,
                    "role": member.role,
                }
            )

        results.append(
            {
                "id": team.id,
                "name": team.name,
                "project": team.project,
                "members": members,
            }
        )

    return results


# ==================================================
# ADD MEMBER TO TEAM
# ==================================================

@app.post("/teams/{team_id}/members")
def add_team_member(
    team_id: int,
    member: TeamMemberCreate,
    db: Session = Depends(get_db)
):

    team = (
        db.query(Team)
        .filter(Team.id == team_id)
        .first()
    )

    if not team:
        raise HTTPException(
            status_code=404,
            detail="Team not found.",
        )

    profile = (
        db.query(Profile)
        .filter(Profile.id == member.profile_id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found.",
        )

    existing_member = (
        db.query(TeamMember)
        .filter(
            TeamMember.team_id == team_id,
            TeamMember.profile_id == member.profile_id,
        )
        .first()
    )

    if existing_member:
        raise HTTPException(
            status_code=400,
            detail="Student is already a member of this team.",
        )

    new_member = TeamMember(
        team_id=team_id,
        profile_id=member.profile_id,
        role=member.role,
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return {
        "message": "Student added to team successfully",
        "member": {
            "id": new_member.id,
            "team_id": new_member.team_id,
            "profile_id": new_member.profile_id,
            "name": profile.name,
            "degree": profile.degree,
            "role": new_member.role,
        },
    }


# ==================================================
# DELETE TEAM MEMBER
# ==================================================

@app.delete("/teams/{team_id}/members/{member_id}")
def delete_team_member(
    team_id: int,
    member_id: int,
    db: Session = Depends(get_db)
):

    member = (
        db.query(TeamMember)
        .filter(
            TeamMember.id == member_id,
            TeamMember.team_id == team_id,
        )
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Team member not found.",
        )

    db.delete(member)
    db.commit()

    return {
        "message": "Team member removed successfully"
    }


# ==================================================
# DELETE TEAM
# ==================================================

@app.delete("/teams/{team_id}")
def delete_team(
    team_id: int,
    db: Session = Depends(get_db)
):

    team = (
        db.query(Team)
        .filter(Team.id == team_id)
        .first()
    )

    if not team:
        raise HTTPException(
            status_code=404,
            detail="Team not found."
        )

    db.query(TeamMember).filter(
        TeamMember.team_id == team_id
    ).delete(synchronize_session=False)

    db.delete(team)
    db.commit()

    return {
        "message": "Team deleted successfully"
    }


# ==================================================
# AI SEMANTIC SEARCH
# ==================================================

@app.post("/search")
def search_profiles(
    search_request: SearchRequest
):

    if not search_request.query.strip():
        raise HTTPException(
            status_code=400,
            detail="Search query cannot be empty.",
        )

    query_embedding = create_embedding(
        search_request.query
    )

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embedding,
        limit=search_request.limit,
        with_payload=True,
    )

    matches = []

    for result in results.points:

        payload = result.payload

        matches.append(
            {
                "profile_id": payload.get("profile_id"),
                "name": payload.get("name"),
                "email": payload.get("email"),
                "phone": payload.get("phone"),
                "degree": payload.get("degree"),
                "year": payload.get("year"),
                "skills": payload.get("skills", []),
                "interests": payload.get("interests", []),
                "availability": payload.get("availability"),
                "profile": payload.get("profile"),
                "score": result.score,
            }
        )

    return {
        "query": search_request.query,
        "results": matches,
    }