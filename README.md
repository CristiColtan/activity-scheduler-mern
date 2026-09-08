# CCTask — Team Activity Management Platform

A web platform for managing tasks across teams, with role-based workspaces,
real-time notifications, reporting, and an AI assistant. Built as my BSc
thesis project (graded 9.10).

## Overview

CCTask lets teams organise work as tasks and subtasks, track progress, and
report on it. What each person sees depends on their role: regular users work
on their own assignments, team managers oversee their team's workload, and
administrators manage the platform itself.

Beyond task management, the platform includes an AI assistant built on the
OpenAI API, a real-time notification system, dynamic reporting, and a full
audit trail of events backed by Elasticsearch.

## Features

**Authentication and access**
- Email/password authentication plus Google OAuth via Firebase
- Three distinct roles — User, Team Manager, Administrator — each with its own
  interface and permissions
- Two-factor authentication

**Task management**
- Tasks and nested subtasks
- Team and assignment management
- Advanced search and filtering
- Activity timelines and task restoration

**Insight and monitoring**
- Dynamic statistics and reports
- Real-time notifications
- Event logging and traceability through Winston, Elasticsearch and Kibana

**AI assistant**
- Conversational assistant built on the OpenAI API

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Redux, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Auth & storage | Firebase (Google OAuth, Firebase Storage) |
| Observability | Winston, Elasticsearch, Kibana |
| AI | OpenAI API |
| Deployment | Railway |

## Architecture

The React frontend talks to an Express REST API backed by MongoDB. Redux holds
application state; role-based rendering decides what the interface exposes,
while the API enforces the same permissions independently on every request —
the client-side checks are for usability, not security.

Application events flow through Winston into Elasticsearch, with Kibana on top
for querying and dashboards. This turns the audit trail into something you can
actually search rather than a flat log file, which is what makes
per-user traceability and performance monitoring practical.

File uploads are handled by Firebase Storage, keeping binary data out of
MongoDB and off the application server.

## Project structure

├── frontend/ # React application
├── backend/ # Express API, MongoDB models, business logic
├── README.md  


## Running locally

**Prerequisites:** Node.js, MongoDB Atlas, a Firebase
project, an OpenAI API key, and optionally a running Elasticsearch instance.

```bash
git clone https://github.com/CristiColtan/activity-scheduler-mern
cd activity-scheduler-mern

# Backend
cd backend
npm install
cp .env.example .env    # fill in the values below
npm start

# Frontend (second terminal)
cd ../frontend
npm install
npm run dev
```

## Environment variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign auth tokens |
| `OPENAI_API_KEY` | OpenAI API key for the assistant |
| `FIREBASE_*` | Firebase project configuration |
| `ELASTICSEARCH_URL` | Elasticsearch endpoint for logging |

Never commit real values — `.env` is gitignored and `.env.example` holds
placeholders only.

## Notes

Built as a BSc thesis at the Military Technical Academy "Ferdinand I".
