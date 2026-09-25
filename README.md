# TalentOS

> AI-powered talent discovery and team formation platform for universities.

🔗 **[Live Demo](https://talentos-sooty.vercel.app)**

TalentOS helps university students discover suitable teammates based on their skills, interests, projects, academic background, and availability. With semantic search, AI-powered matching, authentication, and persistent cloud storage, students can find the right people for their next project.

---

## ✨ Features

- 🔐 User authentication and protected application access
- 👤 Create and manage student profiles
- 🔎 Search for students using natural-language queries
- 🧠 AI-powered semantic talent discovery
- ⚡ Fast vector similarity search using Qdrant
- 📚 Match students based on skills, interests, and experience
- 👥 Create and manage project teams
- ➕ Add students to teams
- 🎯 Assign roles to team members
- 📂 Add projects and skills to profiles
- 🔄 Update student information
- 🗑️ Remove team members and teams
- ☁️ Store application data in Neon PostgreSQL

---

## 💡 Problem

Finding the right teammates at a university can be difficult.

Students often depend on:

- Friends and personal contacts
- WhatsApp groups
- Class groups
- Social media communities
- Random team formation

These methods make it difficult to discover students with the specific skills, interests, and availability needed for a project.

---

## 🚀 Solution

TalentOS provides a centralized platform where authenticated students can create detailed profiles containing:

- Skills
- Interests
- Projects
- Degree program
- Academic year
- Availability
- Personal description
- Previous experience

Students can then search using natural-language queries such as:

> I need someone experienced in Python and machine learning for an AI project.

TalentOS converts the query into a vector embedding and searches for semantically similar student profiles.

---

## 🧠 Semantic Search

Unlike traditional keyword-based search, TalentOS uses vector embeddings to understand the meaning of a query.

### Search Process

```text
User Query
    ↓
Jina AI Embedding Model
    ↓
Vector Embedding
    ↓
Qdrant Similarity Search
    ↓
Ranked Student Profiles
```

TalentOS uses a Jina AI embedding model to generate semantic vectors for both search queries and student profiles. These embeddings are stored and searched using Qdrant, enabling relevant results even when the search wording does not exactly match a profile.

---

## 🔐 Authentication

TalentOS includes authentication so that users can securely access the application and manage their own profiles and teams.

Authentication is used to:

- Sign up and sign in users
- Protect authenticated application routes
- Associate profiles and team activity with the current user
- Keep private application actions available only to authorized users

Configure the authentication-related environment variables required by the frontend and backend implementation before running the application.

---

## 🏗️ System Architecture

```text
React Frontend
      ↓
Authentication + HTTP / JSON API
      ↓
FastAPI Backend
      ├── Neon PostgreSQL Database
      ├── Jina AI Embeddings
      └── Qdrant Vector Database
                  ↓
          Ranked Student Profiles
```

### Main Components

| Component | Purpose |
|---|---|
| React | Frontend user interface |
| TypeScript | Type-safe frontend development |
| Vite | Frontend development and build tooling |
| FastAPI | Backend API framework |
| Neon PostgreSQL | Hosted serverless PostgreSQL database for persistent application data |
| Qdrant | Vector database for semantic search |
| Jina AI | Text embedding generation for semantic search |
| Authentication | User sign-up, sign-in, and protected access |

---

## 📁 Project Structure

```text
TalentOS/
├── frontend/          # React and TypeScript frontend
├── backend/           # FastAPI backend
├── README.md
└── ...
```

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed or available:

- Node.js
- npm
- Python 3.10+
- A Neon PostgreSQL database
- Qdrant
- Jina AI access and credentials, if required by your embedding configuration
- Credentials for the authentication configuration used by the application

### Clone the Repository

```bash
git clone https://github.com/realshafique/TalentOS.git
cd TalentOS
```

---

## 🖥️ Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at the local URL shown in your terminal.

---

## 🔧 Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment.

### Windows

```bash
venv\Scripts\activate
```

### macOS/Linux

```bash
source venv/bin/activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The API documentation will be available at:

```text
http://127.0.0.1:8000/docs
```

---

## 🔐 Environment Variables

Create a `.env` file in the backend directory and configure the Neon database, vector database, Jina AI, and authentication settings required by your implementation.

Example:

```env
# Neon PostgreSQL connection string
DATABASE_URL=postgresql://username:password@your-neon-host/talentos?sslmode=require

# Vector search
QDRANT_URL=http://localhost:6333
JINA_API_KEY=your-jina-api-key

# Add the authentication variables required by your auth implementation
# AUTH_SECRET=your-auth-secret
# AUTH_PROVIDER_URL=your-auth-provider-url
```

The `DATABASE_URL` should be the connection string provided by Neon. Neon connections generally require SSL, so keep `sslmode=require` when it is included in your connection string.

Use the exact authentication variable names expected by the frontend and backend implementation. Never commit passwords, API keys, auth secrets, or other sensitive credentials to the repository.

---

## 🗃️ Data Storage

TalentOS uses **Neon PostgreSQL** to store structured application data, including:

- User and authentication-related data
- Student profiles
- Skills
- Interests
- Projects
- Teams
- Team members
- Assigned roles

Qdrant stores the Jina AI vector embeddings used for semantic student search.

---

## 🔍 Example Search Queries

Users can search for talent using queries such as:

```text
Find a frontend developer interested in education technology.
```

```text
I need a teammate with Python, machine learning, and data analysis experience.
```

```text
Show me students available for a weekend hackathon.
```

---

## 🛠️ Future Improvements

Planned improvements may include:

- 💬 Messaging between students
- 🤝 Team recommendations
- 📅 Calendar and availability integration
- 🏆 Hackathon and competition listings
- 📈 Improved recommendation ranking
- 🏫 University-based filtering
- 📱 Mobile-responsive improvements
- 🔔 Notifications and collaboration updates

---

## 🤝 Contributing

Contributions are welcome.

## 👨‍💻 Author

Created by [realshafique](https://github.com/realshafique).

---

⭐ If you find TalentOS useful, consider giving the project a star!
