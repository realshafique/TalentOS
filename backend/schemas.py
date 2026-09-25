from pydantic import BaseModel, EmailStr
from typing import List


# =========================
# AUTH
# =========================

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# =========================
# PROFILE
# =========================

class Project(BaseModel):
    id: int
    name: str
    description: str
    technologies: str


class ProfileCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    degree: str
    year: str
    about: str
    skills: List[str]
    interests: List[str]
    projects: List[Project]
    availability: str


# =========================
# SEARCH
# =========================

class SearchRequest(BaseModel):
    query: str
    limit: int = 5


# =========================
# TEAMS
# =========================

class TeamCreate(BaseModel):
    name: str
    project: str


class TeamMemberCreate(BaseModel):
    profile_id: int
    role: str = "Member"