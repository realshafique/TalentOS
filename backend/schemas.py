from pydantic import BaseModel, EmailStr
from typing import List, Optional


# =========================================================
# AUTH
# =========================================================

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


class ResendOTPRequest(BaseModel):
    email: EmailStr


# =========================================================
# PROJECT
# =========================================================

class ProjectCreate(BaseModel):
    name: str
    description: str
    technologies: str


# =========================================================
# PROFILE
# =========================================================

class ProfileCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    institution: str
    degree: str
    year: str
    about: str = ""
    skills: List[str] = []
    interests: List[str] = []
    availability: str = "Available"
    projects: List[ProjectCreate] = []


class ProfileUpdate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    institution: str
    degree: str
    year: str
    about: str = ""
    skills: List[str] = []
    interests: List[str] = []
    availability: str = "Available"
    projects: List[ProjectCreate] = []


# =========================================================
# SEARCH
# =========================================================

class SearchRequest(BaseModel):
    query: str
    limit: int = 10


# =========================================================
# TEAMS
# =========================================================

class TeamCreate(BaseModel):
    name: str
    project: str


class TeamMemberCreate(BaseModel):
    profile_id: int
    role: str = ""


# =========================================================
# AI TEAM BUILDER
# =========================================================

class AIRecommendationRequest(BaseModel):
    query: str
    limit: int = 10