from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from qdrant_client.models import PointStruct

from database import engine, Base, get_db
from models import User, Profile, Project, Team, TeamMember
from llm import generate_ai_response
from embedding import create_embedding
from qdrant_service import client


from schemas import (
    RegisterRequest,
    LoginRequest,
    ProfileCreate,
    SearchRequest,
    TeamCreate,
    TeamMemberCreate,
)

from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

from profile_embedding import create_profile_embedding
from embedding import create_embedding

from vector_db import (
    create_collection,
    COLLECTION_NAME,
)

from qdrant_service import client


# ==========================================
# STARTUP
# ==========================================

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


# ==========================================
# APP
# ==========================================

app = FastAPI(
    title="TalentOS API",
    description="Backend API for TalentOS",
    version="1.0.0",
    lifespan=lifespan,
)


# ==========================================
# CORS
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://talentos-sooty.vercel.app",
        "https://frontend-beta-dusky-o2tamwnlh1.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ==========================================
# HOME
# ==========================================

@app.get("/")
def home():
    return {
        "message": "TalentOS backend is running"
    }


# ==========================================
# AUTH - REGISTER
# ==========================================

@app.post("/auth/register")
def register(
    register_data: RegisterRequest,
    db: Session = Depends(get_db),
):
    email = register_data.email.lower().strip()

    if len(register_data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long.",
        )

    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists.",
        )

    new_user = User(
        email=email,
        password_hash=hash_password(register_data.password),
    )

    db.add(new_user)
    db.flush()

    # Automatically connect an existing profile
    # if the email matches.
    existing_profile = (
        db.query(Profile)
        .filter(Profile.email == email)
        .first()
    )

    if existing_profile:
        if existing_profile.user_id is not None:
            db.rollback()

            raise HTTPException(
                status_code=400,
                detail="This profile is already connected to another account.",
            )

        existing_profile.user_id = new_user.id

    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(new_user.id)

    return {
        "message": "Account created successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "profile_id": (
                existing_profile.id
                if existing_profile
                else None
            ),
        },
    }


# ==========================================
# AUTH - LOGIN
# ==========================================

@app.post("/auth/login")
def login(
    login_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    email = login_data.username.lower().strip()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    if not verify_password(
        login_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    access_token = create_access_token(user.id)

    profile = (
        db.query(Profile)
        .filter(Profile.user_id == user.id)
        .first()
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "profile_id": (
                profile.id
                if profile
                else None
            ),
        },
    }
# ==========================================
# AUTH - CURRENT USER
# ==========================================

@app.get("/auth/me")
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(Profile)
        .filter(Profile.user_id == current_user.id)
        .first()
    )

    return {
        "id": current_user.id,
        "email": current_user.email,
        "profile_id": (
            profile.id
            if profile
            else None
        ),
    }


# ==========================================
# CREATE PROFILE
# ==========================================

@app.post("/profiles")
def create_profile(
    profile: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Check if this account already owns a profile.
    existing_user_profile = (
        db.query(Profile)
        .filter(Profile.user_id == current_user.id)
        .first()
    )

    if existing_user_profile:
        raise HTTPException(
            status_code=400,
            detail="This account already has a profile.",
        )

    # Check duplicate email.
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
        user_id=current_user.id,
        name=profile.name,
        email=profile.email,
        phone=profile.phone,
        institution=profile.institution,
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
            "institution": new_profile.institution,
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
            "institution": new_profile.institution,
            "degree": new_profile.degree,
            "year": new_profile.year,
            "about": new_profile.about,
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


# ==========================================
# GET ALL PROFILES
# ==========================================

@app.get("/profiles")
def get_profiles(
    db: Session = Depends(get_db),
):
    profiles = db.query(Profile).all()

    return [
        {
            "id": profile.id,
            "name": profile.name,
            "email": profile.email,
            "phone": profile.phone,
            "institution": profile.institution,
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


# ==========================================
# UPDATE PROFILE
# ==========================================

@app.put("/profiles/{profile_id}")
def update_profile(
    profile_id: int,
    profile: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
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

    # Ownership check
    if existing_profile.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to edit this profile.",
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
    existing_profile.institution = profile.institution
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
            "institution": existing_profile.institution,
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
            "institution": existing_profile.institution,
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


# ==========================================
# CREATE TEAM
# ==========================================

@app.post("/teams")
def create_team(
    team: TeamCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
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


# ==========================================
# GET TEAMS
# ==========================================

@app.get("/teams")
def get_teams(
    db: Session = Depends(get_db),
):
    teams = db.query(Team).all()

    results = []

    for team in teams:
        members = []

        for member in team.members:
            members.append({
                "id": member.id,
                "profile_id": member.profile_id,
                "name": member.profile.name,
                "degree": member.profile.degree,
                "role": member.role,
            })

        results.append({
            "id": team.id,
            "name": team.name,
            "project": team.project,
            "members": members,
        })

    return results


# ==========================================
# ADD TEAM MEMBER
# ==========================================

@app.post("/teams/{team_id}/members")
def add_team_member(
    team_id: int,
    member: TeamMemberCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
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


# ==========================================
# DELETE TEAM MEMBER
# ==========================================

@app.delete("/teams/{team_id}/members/{member_id}")
def delete_team_member(
    team_id: int,
    member_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
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


# ==========================================
# DELETE TEAM
# ==========================================

@app.delete("/teams/{team_id}")
def delete_team(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
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

    db.query(TeamMember).filter(
        TeamMember.team_id == team_id
    ).delete(
        synchronize_session=False
    )

    db.delete(team)
    db.commit()

    return {
        "message": "Team deleted successfully"
    }


# ==========================================
# AI SEARCH
# ==========================================

@app.post("/search")
def search_profiles(
    search_request: SearchRequest,
):
    query_embedding = create_embedding(
        search_request.query,
        task="retrieval.query",
    )

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embedding,
        limit=search_request.limit,
        with_payload=True,
    )

    return {
        "query": search_request.query,
        "results": [
            {
                "profile_id": point.payload.get("profile_id"),
                "name": point.payload.get("name"),
                "email": point.payload.get("email"),
                "phone": point.payload.get("phone"),
                "institution": point.payload.get("institution"),
                "degree": point.payload.get("degree"),
                "year": point.payload.get("year"),
                "skills": point.payload.get("skills", []),
                "interests": point.payload.get("interests", []),
                "availability": point.payload.get("availability"),
                "profile": point.payload.get("profile"),
                "score": point.score,
            }
            for point in results.points
        ],
    }
@app.get("/ai/test")
def test_ai():
    response = generate_ai_response(
        "Explain TalentOS in one short sentence."
    )

    return {
        "response": response
    }
@app.post("/ai/recommend")
def ai_recommend(search_request: SearchRequest):
    try:
        # --------------------------------
        # 1. Convert user query to embedding
        # --------------------------------
        query_embedding = create_embedding(
            search_request.query,
            task="retrieval.query"
        )

        # --------------------------------
        # 2. Search Qdrant
        # --------------------------------
        results = client.query_points(
            collection_name="talentos_v2",
            query=query_embedding,
            limit=5,
            with_payload=True,
        )

        profiles = []

        for point in results.points:
            payload = point.payload or {}

            profiles.append({
                "profile_id": payload.get("profile_id"),
                "name": payload.get("name"),
                "institution": payload.get("institution"),
                "degree": payload.get("degree"),
                "year": payload.get("year"),
                "skills": payload.get("skills", []),
                "interests": payload.get("interests", []),
                "availability": payload.get("availability"),
                "profile": payload.get("profile"),
                "score": round(point.score, 4),
            })

        # --------------------------------
        # 3. Check if profiles were found
        # --------------------------------
        if not profiles:
            return {
                "query": search_request.query,
                "profiles": [],
                "recommendation": (
                    "No matching profiles were found "
                    "for this search."
                ),
            }

        # --------------------------------
        # 4. Prepare profiles for LLM
        # --------------------------------
        profile_context = ""

        for index, profile in enumerate(profiles, start=1):
            profile_context += f"""
Student {index}

Name: {profile["name"]}
Institution: {profile["institution"]}
Degree: {profile["degree"]}
Year: {profile["year"]}
Skills: {", ".join(profile["skills"])}
Interests: {", ".join(profile["interests"])}
Availability: {profile["availability"]}
Profile: {profile["profile"]}
Semantic similarity score: {profile["score"]}
-------------------------
"""

        # --------------------------------
        # 5. Ask LLM to explain matches
        # --------------------------------
        prompt = f"""
You are the AI recommendation assistant for TalentOS,
a university talent discovery and team formation platform.

A student searched for:

"{search_request.query}"

Below are the students retrieved by TalentOS's semantic
search system.

{profile_context}

Your task is to explain which students are relevant to
the user's request.

Rules:
- Only use information provided in the profiles.
- Do not invent skills, projects, experience, or achievements.
- Explain why each relevant student matches the query.
- Mention important matching skills or interests.
- Consider availability when relevant.
- Keep the response concise and useful.
- Do not rank students as "best" or "worst".
- Do not make claims that are not supported by the profiles.

Return a short natural-language recommendation.
"""

        recommendation = generate_ai_response(prompt)

        # --------------------------------
        # 6. Return results
        # --------------------------------
        return {
            "query": search_request.query,
            "profiles": profiles,
            "recommendation": recommendation,
        }

    except Exception as e:
        print(f"AI recommendation error: {e}")

        raise HTTPException(
            status_code=500,
            detail="AI recommendation failed."
        )