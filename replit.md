# HANDWERKS SEO | CRM

## Overview
A modern SaaS CRM for lead management, built with React + TypeScript frontend and Express + PostgreSQL backend.

## Architecture
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, TanStack Query, wouter routing
- **Backend**: Express.js with REST API endpoints
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: bcrypt password hashing, express-session with connect-pg-simple
- **Drag & Drop**: @hello-pangea/dnd for Kanban board

## Key Files
- `shared/schema.ts` — Drizzle schema: `leads`, `activities`, `users` tables with enums
- `server/db.ts` — Database connection via @neondatabase/serverless
- `server/storage.ts` — DatabaseStorage class implementing IStorage interface
- `server/auth.ts` — Session auth: login/logout/me/profile routes, requireAuth middleware, user seeding
- `server/routes.ts` — REST API: /api/leads, /api/leads/:id/activities, /api/activities/:id, /api/email-config, /api/seed (all protected with requireAuth)
- `server/email-service.ts` — IMAP email polling service: connects to mailbox every 5 min, auto-creates leads from emails
- `client/src/lib/app-state.tsx` — React context + TanStack Query for API-driven state, auth state
- `client/src/lib/queryClient.ts` — Query client with apiRequest helper

## Pages
- `/` — Redirects to /leads (if logged in) or shows login form
- `/leads` — All leads table view (Neu status)
- `/active-leads` — Kanban board with drag-and-drop
- `/lost-leads` — Lost leads table
- `/email-inbox` — IMAP email configuration page
- `/profile` — Profile settings: change name, username, password

## Authentication
- Session-based auth with PostgreSQL session store
- Login: POST /api/auth/login (username + password)
- Logout: POST /api/auth/logout
- Current user: GET /api/auth/me
- Profile update: PATCH /api/auth/profile
- Default users seeded on startup: andre/andre123, jacob/jacob123
- All API routes protected with requireAuth middleware

## Data Model
- **User**: id (UUID), username (unique), name, password (bcrypt hash)
- **Lead**: id (UUID), name, role, company, status (enum), source (enum), assignedTo (user UUID), lastContact, nextFollowUp, phone, email, website, address, notes, createdAt
- **Activity**: id (UUID), leadId (FK), type (comment/system), text, authorId, timestamp, updatedAt
- **LeadStatus**: Neu, Erstkontakt, Setting, Closing, Wiedervorlage, Verlorener Lead
- **EmailConfig**: id (UUID), imapServer, imapPort, email, password, enabled, lastCheckedUid, createdAt, updatedAt
- **LeadSource**: Google Ads, Organisch, Tool-Import, Manuell, E-Mail

## Design Notes
- Minimal SaaS, Inter font, light theme, color-coded status badges
- Tailwind v4 CSS variables use raw `H S% L%` format in index.css
- InlineEdit.tsx must NOT have a companion barrel file (causes runtime crash)
- Calendar uses table-fixed + w-[14.28%] for weekday alignment
- User avatars show first letter of name (no avatar field)
