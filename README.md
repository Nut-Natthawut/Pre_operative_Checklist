<h1 align="center">Hospital Pre-Operative Checklist System</h1>

<p align="center">
  Digital pre-operative checklist system for hospital staff to replace paper-based preparation records with a searchable, trackable, and role-based workflow.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Hono-4.x-E36002?logo=hono&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloudflare_Workers-D1-F38020?logo=cloudflare&logoColor=white" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-0.31-C5F74F?logo=drizzle&logoColor=black" />
</p>

## Project Summary

This project digitizes the hospital pre-op checklist workflow. Instead of using paper forms, staff can create, update, search, and track patient preparation records in one system. The dashboard shows readiness status, forms can be reopened for continued work, and audit logs help trace who changed what.

## Problem / Pain Point

- Pre-operative preparation was tracked on paper, which made records harder to search and review.
- Staff needed a clearer way to see whether a patient was not started, in progress, or ready for surgery.
- Multiple people could work on the same case, but it was difficult to trace updates reliably.
- Admins needed controlled user creation instead of open self-registration.

## What This System Solves

- Centralizes pre-op checklist data in one web system.
- Makes patient records searchable by HN.
- Shows checklist progress on a live dashboard.
- Supports role-based access for admin and normal users.
- Adds audit logs for update traceability.

## Screenshots

<table>
  <tr>
    <td align="center" width="33%">
      <strong>1. Homepage</strong><br />
      Entry page for starting the workflow<br /><br />
      <img src="docs/screenshots/homepage.png" alt="Homepage" width="100%" />
    </td>
    <td align="center" width="33%">
      <strong>2. Login</strong><br />
      Role-based access for hospital staff<br /><br />
      <img src="docs/screenshots/login.png" alt="Login" width="100%" />
    </td>
    <td align="center" width="33%">
      <strong>3. Dashboard</strong><br />
      Patient list, search, and readiness overview<br /><br />
      <img src="docs/screenshots/dashboard.png" alt="Dashboard" width="100%" />
    </td>
  </tr>
</table>

## Key Features

- Digital pre-operative checklist form
- Search patient forms by HN
- Dashboard with readiness status
- Role-based authentication with JWT
- Admin user management
- Surgery completion tracking
- Audit log for change history

## Tech Stack

**Frontend**
- React
- TypeScript
- Tailwind CSS
- Vite

**Backend**
- Hono
- Cloudflare Workers
- JWT authentication

**Database**
- Cloudflare D1
- Drizzle ORM

**Deployment**
- GitHub Actions
- Cloudflare Workers

## Architecture

```text
React Frontend
    ->
Hono API on Cloudflare Workers
    ->
Cloudflare D1 via Drizzle ORM
```

## Project Structure

```text
Pre_operative_Checklist/
├── .github/
│   └── workflows/
│       └── deploy-backend.yml  CI/CD backend deployment
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── form/          Form-specific UI components
│   │   │   └── ui/            Shared UI components
│   │   ├── contexts/          Auth context
│   │   ├── hooks/             Custom React hooks
│   │   ├── lib/               API client
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AuditLogs.tsx
│   │   │   ├── FormNew.tsx
│   │   │   ├── FormView.tsx
│   │   │   ├── Search.tsx
│   │   │   └── AdminUsers.tsx
│   │   ├── services/          Frontend service layer
│   │   └── types/             Frontend types
│
├── backend/
│   ├── db/                    Database schema
│   ├── drizzle/               D1 migrations
│   ├── middleware/            Auth middleware
│   ├── routes/                API routes
│   ├── server/                Hono app assembly
│   ├── services/              Business logic
│   ├── types/                 Backend types
│   ├── index.ts               Worker entry point
│   └── wrangler.toml          Cloudflare config
```

## Quick Start

```bash
cd backend
npm install
npm run db:migrate
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

- Backend: `http://localhost:8787`
- Frontend: `http://localhost:5173`

Note: this project uses Cloudflare D1, so new database tables must be migrated before related features can work.

## Test Account

- Username: `Test1`
- Password: `1234`
