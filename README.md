# AATU Computerized Maintenance Management System (CMMS)

A full-stack, production-quality Computerized Maintenance Management System for Abiola Ajimobi Technical University (AATU), Oyo State, Nigeria. This system replaces the manual, paper-based fault-reporting workflow with a centralized digital platform that automates request triage, work order generation, staff assignment, and real-time status tracking.

## Architecture

Three-tier architecture:

1. **User Interface (Frontend)** — React + TypeScript + TailwindCSS interactive platform
2. **Backend Server** — FastAPI (Python) with JWT auth, RBAC, REST + WebSocket API
3. **Database** — SQLite (dev) / PostgreSQL (production) via SQLAlchemy ORM

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), TypeScript, TailwindCSS, React Router, Recharts |
| Backend | FastAPI, Python 3.11+, Pydantic v2, SQLAlchemy 2.0 |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | SQLAlchemy + Alembic migrations |
| Auth | JWT (access + refresh tokens), bcrypt password hashing |
| Real-time | WebSocket notifications with polling fallback |

## User Roles

| Role | Description |
|------|-------------|
| **Requestor** | Staff/student reporting maintenance faults |
| **Technician** | Executes assigned maintenance work orders |
| **Supervisor** | Triages requests, assigns work, manages inventory |
| **Admin** | System administration, analytics, user management |

## Prerequisites

- Python 3.11+ 
- Node.js 18+ and npm
- Git

## Quick Start

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment config
copy .env.example .env   # Windows
# cp .env.example .env   # Linux/Mac

# Run database migrations
alembic upgrade head

# Seed demo data
python seed.py

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@aatu.edu.ng | Admin@123 |
| Supervisor | folake.adeyemi@aatu.edu.ng | Super@123 |
| Supervisor | ibrahim.yusuf@aatu.edu.ng | Super@123 |
| Technician | tunde.bello@aatu.edu.ng | Tech@123 |
| Requestor | student1@aatu.edu.ng | User@123 |

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
AfolabiProject/
├── README.md
├── .gitignore
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   ├── alembic.ini
│   ├── alembic/
│   ├── seed.py
│   ├── tests/
│   ├── uploads/
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── database.py
│       ├── models/
│       ├── schemas/
│       ├── api/
│       ├── services/
│       ├── core/
│       └── websocket/
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── api/
        ├── components/
        ├── contexts/
        ├── hooks/
        ├── layouts/
        ├── pages/
        └── types/
```

## License

This project is developed as a final-year project for the Department of Building Technology, Abiola Ajimobi Technical University, Oyo State, Nigeria.
