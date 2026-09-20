from pydantic import BaseModel
from typing import List


class Project(BaseModel):

    id: int
    name: str
    description: str
    technologies: str


class ProfileCreate(BaseModel):

    name: str

    email: str

    degree: str

    year: str

    about: str

    skills: List[str]

    interests: List[str]

    projects: List[Project]

    availability: str