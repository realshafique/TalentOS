from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


# ==================================================
# USER / AUTHENTICATION
# ==================================================

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    email = Column(
        String(150),
        unique=True,
        nullable=False,
        index=True
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    profile = relationship(
        "Profile",
        back_populates="user",
        uselist=False
    )


# ==================================================
# PROFILE
# ==================================================

class Profile(Base):

    __tablename__ = "profiles"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # Links a profile to its authenticated account.
    # Nullable because existing profiles may not
    # have authenticated accounts yet.
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        unique=True
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

    # ==================================================
    # UNIVERSITY / COLLEGE
    # ==================================================

    institution = Column(
        String(250),
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

    user = relationship(
        "User",
        back_populates="profile"
    )

    projects = relationship(
        "Project",
        back_populates="profile",
        cascade="all, delete-orphan"
    )


# ==================================================
# PROJECT
# ==================================================

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


# ==================================================
# TEAM
# ==================================================

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


# ==================================================
# TEAM MEMBER
# ==================================================

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