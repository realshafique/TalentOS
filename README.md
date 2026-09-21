# TalentOS

> AI-powered talent discovery and team formation platform for universities.

TalentOS helps university students discover people with relevant skills, interests, projects, and availability so they can find suitable teammates for projects, hackathons, competitions, and other collaborative work.

---

## 🚀 Features

- 👤 Create and manage student profiles
- 🔎 AI-powered semantic talent discovery
- 🧠 Vector-based profile matching
- 👥 Create and manage teams
- ➕ Add students to teams
- 🎯 Assign roles to team members
- 📂 Add projects and skills to profiles
- 🔄 Update student profiles
- 🗑️ Remove team members and teams
- 📊 Store structured data using PostgreSQL
- ⚡ Fast semantic search using Qdrant

---

## 💡 Problem

Finding the right teammates in a university can be difficult.

Students usually depend on:

- Friends and personal contacts
- WhatsApp groups
- Class groups
- Random team formation

This makes it difficult to discover students who actually have the skills and interests required for a particular project.

---

## 💡 Solution

TalentOS provides an AI-powered platform where students can create profiles containing:

- Skills
- Interests
- Projects
- Degree
- Academic year
- Availability
- About section

Users can then search for students using natural-language queries.

text
For example:

I need someone experienced in Python and machine learning for an AI project.

TalentOS converts the query into an embedding and searches for semantically similar student profiles.

---

## 🧠 Semantic Search

TalentOS uses vector embeddings to understand the meaning of a search query instead of relying only on exact keyword matching.

### Search Flow

User Query
     ↓
Embedding Model
     ↓
Vector Representation
     ↓
Qdrant
     ↓
Similarity Search
     ↓
Relevant Student Profiles

The project currently uses:

sentence-transformers/all-MiniLM-L6-v2

The model generates 384-dimensional embeddings.

---

## 🏗️ System Architecture

React Frontend
      ↓
HTTP / JSON
      ↓
FastAPI Backend
      ↓
PostgreSQL + Qdrant
      ↓
Sentence Transformers
