from pydantic import BaseModel
from typing import List


# ==================================================
# PROJECT
# ==================================================

class Project(BaseModel):
    id: int
    name: str
    description: str
    technologies: str


# ==================================================
# PROFILE
# ==================================================

class ProfileCreate(BaseModel):
    name: str
    email: str
    phone: str | None = None
    degree: str
    year: str
    about: str
    skills: List[str]
    interests: List[str]
    projects: List[Project]
    availability: str


# ==================================================
# SEARCH
# ==================================================

class SearchRequest(BaseModel):
    query: str
    limit: int = 5


# ==================================================
# TEAM
# ==================================================

class TeamCreate(BaseModel):
    name: str
    project: str


class TeamMemberCreate(BaseModel):
    profile_id: int
    role: str = "Member"