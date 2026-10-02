from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from qdrant_client.models import PointStruct

from database import engine, Base, get_db

from models import (
    User,
    EmailVerificationOTP,
    Profile,
    Project,
    Team,
    TeamMember,
)

from schemas import (
    RegisterRequest,
    LoginRequest,
    VerifyOTPRequest,
    ResendOTPRequest,
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

from llm import generate_ai_recommendation
from otp_service import (
    generate_otp,
    hash_otp,
    send_otp_email,
)

# =========================================================
# STARTUP
# =========================================================

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


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="TalentOS API",
    description="Backend API for TalentOS",
    version="1.0.0",
    lifespan=lifespan,
)


# =========================================================
# CORS
# =========================================================

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


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "message": "TalentOS backend is running"
    }


# =========================================================
# AUTH - REGISTER
# =========================================================

@app.post("/auth/register")
def register(
    register_data: RegisterRequest,
    db: Session = Depends(get_db),
):

    email = register_data.email.lower().strip()

    # -----------------------------------------------------
    # PASSWORD VALIDATION
    # -----------------------------------------------------

    if len(register_data.password) < 8:

        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long.",
        )

    # -----------------------------------------------------
    # CHECK EXISTING USER
    # -----------------------------------------------------

    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    # -----------------------------------------------------
    # ALREADY VERIFIED
    # -----------------------------------------------------

    if existing_user and existing_user.email_verified:

        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists.",
        )

    # -----------------------------------------------------
    # EXISTING UNVERIFIED USER
    # -----------------------------------------------------

    if existing_user:

        existing_user.password_hash = hash_password(
            register_data.password
        )

        user = existing_user

    # -----------------------------------------------------
    # NEW USER
    # -----------------------------------------------------

    else:

        user = User(
            email=email,
            password_hash=hash_password(
                register_data.password
            ),
            email_verified=False,
        )

        db.add(user)

        db.flush()

    # -----------------------------------------------------
    # INVALIDATE PREVIOUS OTPs
    # -----------------------------------------------------

    db.query(EmailVerificationOTP).filter(
        EmailVerificationOTP.user_id == user.id,
        EmailVerificationOTP.used_at.is_(None),
    ).update(
        {
            EmailVerificationOTP.used_at:
                datetime.now(timezone.utc)
        },
        synchronize_session=False,
    )

    # -----------------------------------------------------
    # GENERATE OTP
    # -----------------------------------------------------

    otp = generate_otp()

    otp_record = EmailVerificationOTP(
        user_id=user.id,
        otp_hash=hash_otp(otp),
        expires_at=(
            datetime.now(timezone.utc)
            + timedelta(minutes=5)
        ),
        attempts=0,
    )

    db.add(otp_record)

    db.commit()

    # -----------------------------------------------------
    # SEND OTP EMAIL
    # -----------------------------------------------------

    try:

        send_otp_email(
            email,
            otp,
        )

    except Exception as e:

        db.rollback()

        print(
            f"OTP email error: "
            f"{type(e).__name__}: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to send verification email.",
        )

    return {
        "message": "Verification code sent to your email.",
        "email": email,
    }


# =========================================================
# AUTH - VERIFY OTP
# =========================================================

@app.post("/auth/verify-otp")
def verify_otp(
    verification: VerifyOTPRequest,
    db: Session = Depends(get_db),
):

    email = verification.email.lower().strip()

    otp = verification.otp.strip()

    # -----------------------------------------------------
    # OTP FORMAT
    # -----------------------------------------------------

    if not otp.isdigit() or len(otp) != 6:

        raise HTTPException(
            status_code=400,
            detail="OTP must be a 6-digit number.",
        )

    # -----------------------------------------------------
    # FIND USER
    # -----------------------------------------------------

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=400,
            detail="Invalid verification request.",
        )

    # -----------------------------------------------------
    # ALREADY VERIFIED
    # -----------------------------------------------------

    if user.email_verified:

        raise HTTPException(
            status_code=400,
            detail="Email is already verified.",
        )

    # -----------------------------------------------------
    # FIND LATEST ACTIVE OTP
    # -----------------------------------------------------

    otp_record = (
        db.query(EmailVerificationOTP)
        .filter(
            EmailVerificationOTP.user_id == user.id,
            EmailVerificationOTP.used_at.is_(None),
        )
        .order_by(
            EmailVerificationOTP.created_at.desc()
        )
        .first()
    )

    if not otp_record:

        raise HTTPException(
            status_code=400,
            detail="No active verification code found.",
        )

    # -----------------------------------------------------
    # CURRENT TIME
    # -----------------------------------------------------

    now = datetime.now(timezone.utc)

    expires_at = otp_record.expires_at

    if expires_at.tzinfo is None:

        expires_at = expires_at.replace(
            tzinfo=timezone.utc
        )

    # -----------------------------------------------------
    # OTP EXPIRATION
    # -----------------------------------------------------

    if expires_at <= now:

        raise HTTPException(
            status_code=400,
            detail="Verification code has expired.",
        )

    # -----------------------------------------------------
    # MAX ATTEMPTS
    # -----------------------------------------------------

    if otp_record.attempts >= 5:

        raise HTTPException(
            status_code=429,
            detail=(
                "Too many incorrect attempts. "
                "Please request a new code."
            ),
        )

    # -----------------------------------------------------
    # CHECK OTP
    # -----------------------------------------------------

    if hash_otp(otp) != otp_record.otp_hash:

        otp_record.attempts += 1

        db.commit()

        remaining = max(
            0,
            5 - otp_record.attempts
        )

        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid verification code. "
                f"{remaining} attempts remaining."
            ),
        )

    # -----------------------------------------------------
    # OTP SUCCESS
    # -----------------------------------------------------

    user.email_verified = True

    otp_record.used_at = now

    db.commit()

    db.refresh(user)

    # -----------------------------------------------------
    # FIND PROFILE
    # -----------------------------------------------------

    profile = (
        db.query(Profile)
        .filter(Profile.user_id == user.id)
        .first()
    )

    # -----------------------------------------------------
    # CREATE JWT
    # -----------------------------------------------------

    access_token = create_access_token(
        user.id
    )

    return {
        "message": "Email verified successfully.",

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


# =========================================================
# AUTH - RESEND OTP
# =========================================================

@app.post("/auth/resend-otp")
def resend_otp(
    request: ResendOTPRequest,
    db: Session = Depends(get_db),
):

    email = request.email.lower().strip()

    # -----------------------------------------------------
    # FIND USER
    # -----------------------------------------------------

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="Account not found.",
        )

    # -----------------------------------------------------
    # ALREADY VERIFIED
    # -----------------------------------------------------

    if user.email_verified:

        raise HTTPException(
            status_code=400,
            detail="Email is already verified.",
        )

    # -----------------------------------------------------
    # FIND LAST OTP
    # -----------------------------------------------------

    latest_otp = (
        db.query(EmailVerificationOTP)
        .filter(
            EmailVerificationOTP.user_id == user.id
        )
        .order_by(
            EmailVerificationOTP.created_at.desc()
        )
        .first()
    )

    # -----------------------------------------------------
    # 60 SECOND RESEND COOLDOWN
    # -----------------------------------------------------

    if latest_otp and latest_otp.created_at:

        now = datetime.now(timezone.utc)

        created_at = latest_otp.created_at

        if created_at.tzinfo is None:

            created_at = created_at.replace(
                tzinfo=timezone.utc
            )

        seconds_since_last = (
            now - created_at
        ).total_seconds()

        if seconds_since_last < 60:

            remaining = max(
                1,
                int(
                    60 - seconds_since_last
                )
            )

            raise HTTPException(
                status_code=429,
                detail=(
                    f"Please wait {remaining} seconds "
                    "before requesting another code."
                ),
            )

    # -----------------------------------------------------
    # INVALIDATE PREVIOUS OTPs
    # -----------------------------------------------------

    db.query(EmailVerificationOTP).filter(
        EmailVerificationOTP.user_id == user.id,
        EmailVerificationOTP.used_at.is_(None),
    ).update(
        {
            EmailVerificationOTP.used_at:
                datetime.now(timezone.utc)
        },
        synchronize_session=False,
    )

    # -----------------------------------------------------
    # GENERATE NEW OTP
    # -----------------------------------------------------

    otp = generate_otp()

    otp_record = EmailVerificationOTP(
        user_id=user.id,
        otp_hash=hash_otp(otp),
        expires_at=(
            datetime.now(timezone.utc)
            + timedelta(minutes=5)
        ),
        attempts=0,
    )

    db.add(otp_record)

    db.commit()

    # -----------------------------------------------------
    # SEND EMAIL
    # -----------------------------------------------------

    try:

        send_otp_email(
            email,
            otp,
        )

    except Exception as e:

        db.rollback()

        print(
            f"Resend OTP error: "
            f"{type(e).__name__}: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to send verification email.",
        )

    return {
        "message": "A new verification code has been sent."
    }


# =========================================================
# AUTH - LOGIN
# =========================================================

@app.post("/auth/login")
def login(
    login_data: OAuth2PasswordRequestForm = Depends(),

    db: Session = Depends(get_db),
):

    email = login_data.username.lower().strip()

    # -----------------------------------------------------
    # FIND USER
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # PASSWORD
    # -----------------------------------------------------

    if not verify_password(
        login_data.password,
        user.password_hash,
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    # -----------------------------------------------------
    # EMAIL VERIFICATION
    # -----------------------------------------------------

    if not user.email_verified:

        raise HTTPException(
            status_code=403,
            detail="Please verify your email before logging in.",
        )

    # -----------------------------------------------------
    # CREATE JWT
    # -----------------------------------------------------

    access_token = create_access_token(
        user.id
    )

    # -----------------------------------------------------
    # FIND PROFILE
    # -----------------------------------------------------

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


# =========================================================
# AUTH - CURRENT USER
# =========================================================

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


# =========================================================
# BACKGROUND VECTOR INDEXING
# =========================================================

def index_profile_in_background(
    profile_id: int,
    profile: ProfileCreate,
):
    """
    Generate the embedding and update Qdrant after
    the HTTP response.

    Profile creation should not make the user wait
    for external AI/vector services.
    """

    try:

        print(
            f"Starting vector indexing for profile "
            f"{profile_id}..."
        )

        profile_text, embedding = (
            create_profile_embedding(profile)
        )

        qdrant_point = PointStruct(
            id=profile_id,

            vector=embedding,

            payload={
                "profile_id": profile_id,

                "name": profile.name,

                "email": profile.email,

                "phone": profile.phone,

                "institution": profile.institution,

                "degree": profile.degree,

                "year": profile.year,

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

        print(
            f"Vector indexing completed for profile "
            f"{profile_id}."
        )

    except Exception as e:

        print(
            f"Vector indexing failed for profile "
            f"{profile_id}: "
            f"{type(e).__name__}: {e}"
        )


# =========================================================
# CREATE PROFILE
# =========================================================

@app.post("/profiles")
def create_profile(
    profile: ProfileCreate,

    background_tasks: BackgroundTasks,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):

    # -----------------------------------------------------
    # CHECK USER PROFILE
    # -----------------------------------------------------

    existing_user_profile = (
        db.query(Profile)
        .filter(
            Profile.user_id == current_user.id
        )
        .first()
    )

    if existing_user_profile:

        raise HTTPException(
            status_code=400,
            detail="This account already has a profile.",
        )

    # -----------------------------------------------------
    # CHECK DUPLICATE EMAIL
    # -----------------------------------------------------

    existing_profile = (
        db.query(Profile)
        .filter(
            Profile.email == profile.email
        )
        .first()
    )

    if existing_profile:

        raise HTTPException(
            status_code=400,
            detail="A profile with this email already exists.",
        )

    # -----------------------------------------------------
    # CREATE PROFILE
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # PROJECTS
    # -----------------------------------------------------

    for project in profile.projects:

        db.add(
            Project(
                profile_id=new_profile.id,

                name=project.name,

                description=project.description,

                technologies=project.technologies,
            )
        )

    db.commit()

    db.refresh(new_profile)

    # -----------------------------------------------------
    # BACKGROUND VECTOR INDEXING
    # -----------------------------------------------------

    background_tasks.add_task(
        index_profile_in_background,

        new_profile.id,

        profile,
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


# =========================================================
# GET ALL PROFILES
# =========================================================

@app.get("/profiles")
def get_profiles(
    db: Session = Depends(get_db),
):

    profiles = db.query(Profile).all()

    if not profiles:

        return []

    # -----------------------------------------------------
    # FETCH PROJECTS ONCE
    # -----------------------------------------------------

    profile_ids = [
        profile.id
        for profile in profiles
    ]

    all_projects = (
        db.query(Project)
        .filter(
            Project.profile_id.in_(profile_ids)
        )
        .all()
    )

    projects_by_profile = {}

    for project in all_projects:

        projects_by_profile.setdefault(
            project.profile_id,
            []
        ).append(project)

    results = []

    # -----------------------------------------------------
    # BUILD RESPONSE
    # -----------------------------------------------------

    for profile in profiles:

        projects = projects_by_profile.get(
            profile.id,
            []
        )

        results.append({

            "id": profile.id,

            "name": profile.name,

            "email": profile.email,

            "phone": profile.phone,

            "institution": profile.institution,

            "degree": profile.degree,

            "year": profile.year,

            "about": profile.about,

            "skills": [

                skill.strip()

                for skill in profile.skills.split(",")

                if skill.strip()

            ] if profile.skills else [],

            "interests": [

                interest.strip()

                for interest in profile.interests.split(",")

                if interest.strip()

            ] if profile.interests else [],

            "availability": profile.availability,

            "projects": [

                {
                    "id": project.id,

                    "name": project.name,

                    "description": project.description,

                    "technologies": project.technologies,
                }

                for project in projects
            ],
        })

    return results


# =========================================================
# GET SINGLE PROFILE
# =========================================================

@app.get("/profiles/{profile_id}")
def get_profile(
    profile_id: int,

    db: Session = Depends(get_db),
):

    profile = (
        db.query(Profile)

        .filter(
            Profile.id == profile_id
        )

        .first()
    )

    if not profile:

        raise HTTPException(
            status_code=404,
            detail="Profile not found",
        )

    projects = (
        db.query(Project)

        .filter(
            Project.profile_id == profile.id
        )

        .all()
    )

    return {

        "id": profile.id,

        "name": profile.name,

        "email": profile.email,

        "phone": profile.phone,

        "institution": profile.institution,

        "degree": profile.degree,

        "year": profile.year,

        "about": profile.about,

        "skills": [

            skill.strip()

            for skill in profile.skills.split(",")

            if skill.strip()

        ] if profile.skills else [],

        "interests": [

            interest.strip()

            for interest in profile.interests.split(",")

            if interest.strip()

        ] if profile.interests else [],

        "availability": profile.availability,

        "projects": [

            {

                "id": project.id,

                "name": project.name,

                "description": project.description,

                "technologies": project.technologies,
            }

            for project in projects
        ],
    }


# =========================================================
# UPDATE PROFILE
# =========================================================

@app.put("/profiles/{profile_id}")
def update_profile(
    profile_id: int,

    profile: ProfileCreate,

    background_tasks: BackgroundTasks,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):

    existing_profile = (
        db.query(Profile)

        .filter(
            Profile.id == profile_id
        )

        .first()
    )

    if not existing_profile:

        raise HTTPException(
            status_code=404,
            detail="Student profile not found.",
        )

    # -----------------------------------------------------
    # AUTHORIZATION
    # -----------------------------------------------------

    if existing_profile.user_id != current_user.id:

        raise HTTPException(
            status_code=403,
            detail="You are not authorized to edit this profile.",
        )

    # -----------------------------------------------------
    # DUPLICATE EMAIL
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # UPDATE PROFILE
    # -----------------------------------------------------

    existing_profile.name = profile.name

    existing_profile.email = profile.email

    existing_profile.phone = profile.phone

    existing_profile.institution = profile.institution

    existing_profile.degree = profile.degree

    existing_profile.year = profile.year

    existing_profile.about = profile.about

    existing_profile.skills = (
        ", ".join(profile.skills)
    )

    existing_profile.interests = (
        ", ".join(profile.interests)
    )

    existing_profile.availability = (
        profile.availability
    )

    # -----------------------------------------------------
    # REPLACE PROJECTS
    # -----------------------------------------------------

    for project in list(
        existing_profile.projects
    ):

        db.delete(project)

    db.flush()

    for project in profile.projects:

        db.add(
            Project(
                profile_id=existing_profile.id,

                name=project.name,

                description=project.description,

                technologies=project.technologies,
            )
        )

    db.commit()

    db.refresh(existing_profile)

    # -----------------------------------------------------
    # RE-INDEX
    # -----------------------------------------------------

    background_tasks.add_task(
        index_profile_in_background,

        existing_profile.id,

        profile,
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


# =========================================================
# AI TALENT RECOMMENDATION
# =========================================================

@app.post("/ai/recommend")
def ai_recommend(
    search_request: SearchRequest,
):

    try:

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

        profiles = [

            {
                "profile_id": point.payload.get(
                    "profile_id"
                ),

                "name": point.payload.get(
                    "name"
                ),

                "email": point.payload.get(
                    "email"
                ),

                "phone": point.payload.get(
                    "phone"
                ),

                "institution": point.payload.get(
                    "institution"
                ),

                "degree": point.payload.get(
                    "degree"
                ),

                "year": point.payload.get(
                    "year"
                ),

                "skills": point.payload.get(
                    "skills",
                    []
                ),

                "interests": point.payload.get(
                    "interests",
                    []
                ),

                "availability": point.payload.get(
                    "availability"
                ),

                "profile": point.payload.get(
                    "profile"
                ),

                "score": round(
                    point.score,
                    4
                ),
            }

            for point in results.points
        ]

        if not profiles:

            return {

                "query": search_request.query,

                "profiles": [],

                "recommendation": {

                    "requirement_summary":
                        "No matching profiles were found.",

                    "candidate_analysis": [],

                    "skill_coverage": [],

                    "potential_skill_gaps": [],

                    "team_insight":
                        "Try using different skills, technologies, or project requirements.",
                },
            }

        recommendation = generate_ai_recommendation(
            search_request.query,
            profiles,
        )

        return {

            "query": search_request.query,

            "profiles": profiles,

            "recommendation": recommendation,
        }

    except Exception as e:

        print(
            f"AI recommendation error: "
            f"{type(e).__name__}: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail=f"AI recommendation failed: {str(e)}",
        )


# =========================================================
# CREATE TEAM
# =========================================================

@app.post("/teams")
def create_team(

    team: TeamCreate,

    current_user: User = Depends(
        get_current_user
    ),

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


# =========================================================
# GET TEAMS
# =========================================================

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


# =========================================================
# ADD TEAM MEMBER
# =========================================================

@app.post("/teams/{team_id}/members")
def add_team_member(

    team_id: int,

    member: TeamMemberCreate,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):

    team = (
        db.query(Team)

        .filter(
            Team.id == team_id
        )

        .first()
    )

    if not team:

        raise HTTPException(
            status_code=404,
            detail="Team not found.",
        )

    profile = (
        db.query(Profile)

        .filter(
            Profile.id == member.profile_id
        )

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

            TeamMember.profile_id ==
            member.profile_id,
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


# =========================================================
# DELETE TEAM MEMBER
# =========================================================

@app.delete(
    "/teams/{team_id}/members/{member_id}"
)
def delete_team_member(

    team_id: int,

    member_id: int,

    current_user: User = Depends(
        get_current_user
    ),

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


# =========================================================
# DELETE TEAM
# =========================================================

@app.delete("/teams/{team_id}")
def delete_team(

    team_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):

    team = (
        db.query(Team)

        .filter(
            Team.id == team_id
        )

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


# =========================================================
# AI SEARCH
# =========================================================

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

                "profile_id": point.payload.get(
                    "profile_id"
                ),

                "name": point.payload.get(
                    "name"
                ),

                "email": point.payload.get(
                    "email"
                ),

                "phone": point.payload.get(
                    "phone"
                ),

                "institution": point.payload.get(
                    "institution"
                ),

                "degree": point.payload.get(
                    "degree"
                ),

                "year": point.payload.get(
                    "year"
                ),

                "skills": point.payload.get(
                    "skills",
                    []
                ),

                "interests": point.payload.get(
                    "interests",
                    []
                ),

                "availability": point.payload.get(
                    "availability"
                ),

                "profile": point.payload.get(
                    "profile"
                ),

                "score": point.score,
            }

            for point in results.points
        ],
    }