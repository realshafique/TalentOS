from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class Profile(Base):

    __tablename__ = "profiles"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(150),
        unique=True,
        nullable=False
    )

    phone = Column(
        String(20),
        nullable=True
    )

    degree = Column(
        String(200),
        nullable=False
    )

    year = Column(
        String(50),
        nullable=False
    )

    about = Column(
        Text,
        nullable=True
    )

    skills = Column(
        Text,
        nullable=True
    )

    interests = Column(
        Text,
        nullable=True
    )

    availability = Column(
        String(50),
        nullable=False
    )

    projects = relationship(
        "Project",
        back_populates="profile",
        cascade="all, delete-orphan"
    )


class Project(Base):

    __tablename__ = "projects"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    profile_id = Column(
        Integer,
        ForeignKey("profiles.id"),
        nullable=False
    )

    name = Column(
        String(200),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    technologies = Column(
        Text,
        nullable=True
    )

    profile = relationship(
        "Profile",
        back_populates="projects"
    )


class Team(Base):

    __tablename__ = "teams"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(200),
        nullable=False
    )

    project = Column(
        String(300),
        nullable=False
    )

    members = relationship(
        "TeamMember",
        back_populates="team",
        cascade="all, delete-orphan"
    )


class TeamMember(Base):

    __tablename__ = "team_members"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    team_id = Column(
        Integer,
        ForeignKey("teams.id"),
        nullable=False
    )

    profile_id = Column(
        Integer,
        ForeignKey("profiles.id"),
        nullable=False
    )

    role = Column(
        String(100),
        nullable=False,
        default="Member"
    )

    team = relationship(
        "Team",
        back_populates="members"
    )

    profile = relationship(
        "Profile"
    )