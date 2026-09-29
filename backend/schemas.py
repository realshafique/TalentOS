from pydantic import BaseModel, EmailStr
from typing import List, Optional


# =========================
# AUTH
# =========================

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# =========================
# PROJECT
# =========================

class ProjectCreate(BaseModel):
    name: str
    description: str
    technologies: str


# =========================
# PROFILE
# =========================

class ProfileCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
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
    degree: str
    year: str
    about: str = ""
    skills: List[str] = []
    interests: List[str] = []
    availability: str = "Available"
    projects: List[ProjectCreate] = []


# =========================
# SEARCH
# =========================

class SearchRequest(BaseModel):
    query: str
    limit: int = 10


# =========================
# TEAMS
# =========================

class TeamCreate(BaseModel):
    name: str
    project: str


class TeamMemberCreate(BaseModel):
    profile_id: int
    role: str = ""


# =========================
# AI TEAM BUILDER
# =========================

class AIRecommendationRequest(BaseModel):
    query: str
    limit: int = 10