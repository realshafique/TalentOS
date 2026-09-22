# TalentOS

> AI-powered talent discovery and team formation platform for universities.

🔗 **[Live Demo](https://talentos-sooty.vercel.app)**

TalentOS helps university students discover suitable teammates based on their skills, interests, projects, academic background, and availability. Using semantic search and AI-powered matching, students can find collaborators who are a strong fit for their projects.

---

## ✨ Features

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
- 📊 Store structured application data using PostgreSQL

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

TalentOS provides a centralized platform where students can create detailed profiles containing:

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

TalentOS uses a Jina AI embedding model to generate semantic vectors for both search queries and student profiles. These embeddings are stored and searched using Qdrant, enabling relevant results even when a query does not use the exact keywords found in a profile.

The embedding model is loaded and used by the FastAPI backend. Keep the model configuration and embedding dimensionality consistent with the Qdrant collection configuration when changing models or rebuilding the index.

---

## 🏗️ System Architecture

```text
React Frontend
      ↓
HTTP / JSON API
      ↓
FastAPI Backend
      ↓
Jina AI Embeddings
      ↓
Qdrant Vector Database
      ↓
Ranked Student Profiles

FastAPI Backend ──→ PostgreSQL Database
```

### Main Components

| Component | Purpose |
|---|---|
| React | Frontend user interface |
| TypeScript | Type-safe frontend development |
| Vite | Frontend development and build tooling |
| FastAPI | Backend API framework |
| PostgreSQL | Persistent structured data storage |
| Qdrant | Vector database for semantic search |
| Jina AI | Text embedding generation for semantic search |

---

## 📁 Project Structure

```text
TalentOS/
├── frontend/          # React and TypeScript frontend
├── backend/            # FastAPI backend
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
- PostgreSQL
- Qdrant
- Jina AI access and credentials, if required by your embedding configuration

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

> Update the commands above if your backend entry file or dependency file uses a different name.

---

## 🔐 Environment Variables

Create a `.env` file in the backend directory and configure your database, vector database, and Jina AI embedding settings.

Example:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/talentos
QDRANT_URL=http://localhost:6333
JINA_API_KEY=your-jina-api-key
```

Use the variable names expected by the backend embedding implementation. If the application uses a hosted Jina AI endpoint, `JINA_API_KEY` must be available to the backend at runtime.

Never commit passwords, API keys, or other sensitive credentials to the repository.

---

## 🗃️ Database

TalentOS uses PostgreSQL to store structured application data, including:

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

- 🔐 User authentication and authorization
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
