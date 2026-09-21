# TalentOS

> AI-powered talent discovery and team formation platform for universities.

TalentOS helps university students discover people with relevant skills, interests, projects, and availability so they can find suitable teammates for hackathons, projects, competitions, and other collaborative work.

---

## 🚀 Problem

Finding the right teammates in a university can be difficult.

Students often rely on:

- WhatsApp groups
- Personal contacts
- Class groups
- Random team formation
- Asking friends for recommendations

These approaches make it difficult to discover students who have the exact skills or interests needed for a project.

---

## 💡 Solution

TalentOS provides an AI-powered talent discovery platform where students can create profiles containing their:

- Skills
- Interests
- Projects
- Degree
- Academic year
- Availability
- About section

The platform then uses semantic search to find students whose profiles are relevant to a natural-language query.

### Example

Instead of searching only for:

```text
Python


I need someone experienced in Python and machine learning
for an AI project.

✨ Features
👤 Student Profiles

Students can create and update profiles containing:

Name
Email
Phone
Degree
Academic year
About
Skills
Interests
Availability
Projects
🔎 AI-Powered Talent Discovery

TalentOS uses vector embeddings to perform semantic profile search.

Example searches:

Frontend developer for a React project
Someone interested in AI and computer vision
Student experienced with Python and FastAPI

The system finds profiles based on semantic similarity rather than simple keyword matching.

👥 Team Formation

Users can:

Create teams
Add students to teams
Assign roles
View team members
Remove team members
Delete teams

This makes it easier to form project and hackathon teams.

🧠 Semantic Search Architecture

TalentOS uses:

User Query
     ↓
Embedding Model
     ↓
Vector Representation
     ↓
Qdrant Vector Database
     ↓
Similarity Search
     ↓
Relevant Student Profiles

The embedding model currently used is:

sentence-transformers/all-MiniLM-L6-v2

It generates 384-dimensional embeddings.

🏗️ System Architecture
                 ┌──────────────────┐
                 │   React Frontend │
                 │   TypeScript     │
                 └────────┬─────────┘
                          │
                     HTTP / JSON
                          │
                          ▼
                 ┌──────────────────┐
                 │  FastAPI Backend │
                 └───────┬──────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
      ┌───────────────┐      ┌───────────────┐
      │  PostgreSQL   │      │    Qdrant     │
      │               │      │ Vector Search │
      │ Structured DB │      └───────┬───────┘
      └───────────────┘              │
                                     ▼
                           ┌──────────────────┐
                           │ Sentence         │
                           │ Transformers     │
                           │ Embedding Model  │
                           └──────────────────┘
🛠️ Tech Stack
Frontend
React
TypeScript
Vite
Tailwind CSS
React Router
Axios
Backend
Python
FastAPI
SQLAlchemy
Pydantic
Database
PostgreSQL
Vector Database
Qdrant
AI / ML
Sentence Transformers
all-MiniLM-L6-v2
Vector embeddings
Semantic similarity search
Development & Deployment
Git
GitHub
Docker
Vercel
Render
📁 Project Structure
TalentOS/
│
├── backend/
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── embedding.py
│   ├── profile_embedding.py
│   ├── qdrant_service.py
│   ├── vector_db.py
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Discover.tsx
│   │   │   ├── Teams.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── CreateProfile.tsx
│   │   │   └── StudentProfile.tsx
│   │   │
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── package.json
│   └── ...
│
└── README.md
⚙️ Installation
Prerequisites

Make sure you have installed:

Python 3.13+
Node.js
npm
PostgreSQL
Git

You also need accounts/configuration for:

Qdrant Cloud
PostgreSQL database
🔧 Backend Setup

Clone the repository:

git clone https://github.com/realshafique/TalentOS.git

Go to the project:

cd TalentOS

Go to the backend:

cd backend

Create a virtual environment:

Windows
python -m venv venv

Activate it:

.\venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt
🔐 Environment Variables

Create a .env file inside the backend directory:

DATABASE_URL=your_postgresql_database_url

QDRANT_URL=your_qdrant_url

QDRANT_API_KEY=your_qdrant_api_key

Do not commit .env to GitHub.

▶️ Run Backend

From the backend directory:

uvicorn main:app --reload

Backend will run at:

http://127.0.0.1:8000

API documentation:

http://127.0.0.1:8000/docs
🎨 Frontend Setup

Open another terminal:

cd TalentOS/frontend

Install dependencies:

npm install

Run the development server:

npm run dev

The frontend will normally be available at:

http://localhost:5173
🔎 API Endpoints
Profiles
Create Profile
POST /profiles
Get Profiles
GET /profiles
Update Profile
PUT /profiles/{profile_id}
Semantic Search
POST /search

Example request:

{
  "query": "Python developer interested in machine learning",
  "limit": 5
}
Teams
Get Teams
GET /teams
Create Team
POST /teams
Add Team Member
POST /teams/{team_id}/members
Remove Team Member
DELETE /teams/{team_id}/members/{member_id}
Delete Team
DELETE /teams/{team_id}
🧠 How Semantic Search Works

When a student creates or updates a profile, TalentOS creates a text representation of the profile.

For example:

Name: Rahul

Degree: B.Tech Computer Science

Skills:
Python, Machine Learning, FastAPI

Interests:
Artificial Intelligence, NLP

Projects:
AI Resume Analyzer

This text is converted into a vector using:

all-MiniLM-L6-v2

The vector is stored in Qdrant.

When a user searches:

Looking for someone experienced in AI and Python

the search query is also converted into an embedding.

Qdrant then compares the query vector with stored profile vectors and returns the most semantically similar profiles.

🗄️ Data Storage

TalentOS uses two different storage systems for different purposes.

PostgreSQL

Stores structured application data:

Profiles
Projects
Teams
Team Members
Qdrant

Stores:

Profile embeddings
Profile metadata
Vector search payloads

PostgreSQL acts as the structured source of truth, while Qdrant is used for semantic discovery.

🚀 Deployment

TalentOS can be deployed using:

Frontend → Vercel

Backend → Render

PostgreSQL → Render PostgreSQL

Vector Database → Qdrant Cloud

Production architecture:

                 Internet
                    │
                    ▼
             ┌─────────────┐
             │   Vercel    │
             │ React App   │
             └──────┬──────┘
                    │
                    ▼
             ┌─────────────┐
             │   Render    │
             │   FastAPI   │
             └──────┬──────┘
                    │
              ┌─────┴─────┐
              ▼           ▼
        ┌──────────┐  ┌──────────┐
        │PostgreSQL│  │  Qdrant  │
        └──────────┘  └──────────┘
🔒 Security

Sensitive configuration should be stored in environment variables.

Never commit:

.env
API keys
Database passwords
Private credentials

Add .env to .gitignore:

.env
venv/
__pycache__/
node_modules/
🔮 Future Improvements

Planned improvements include:

🔐 Authentication and authorization
🤖 LLM-powered team recommendations
🧩 AI team composition
🎯 Skill-gap analysis
📊 Student skill analytics
💬 AI assistant for team formation
🏆 Hackathon-specific team matching
🔔 Notifications
🏫 University-level deployment
📱 Mobile-friendly improvements
🎯 Vision

TalentOS aims to make talent discovery inside universities more intelligent and accessible.

Instead of asking:

"Who do I know that can help?"

students can ask:

"Who in my university has the skills and interests needed for this project?"

TalentOS turns that question into a searchable talent discovery system.

👨‍💻 Author

Shafiqurrahman Ansari

B.Tech Computer Science & Artificial Intelligence

⭐ Project

If you find TalentOS interesting, consider giving the repository a ⭐ on GitHub.

Built with React, FastAPI, PostgreSQL, Qdrant and AI.

### One important thing before you paste it

Your README currently contains the **GitHub username correctly**, but I intentionally did **not** put your personal email, LinkedIn URL, Qdrant credentials, PostgreSQL credentials, or Render URL into it.

Once your deployment is finished, we can add the **live demo + API URL + screenshots** to the top of the README, which will make the project much more presentable.
