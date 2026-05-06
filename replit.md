# HANDWERKS SEO | CRM

## Overview
A modern SaaS CRM for lead management, built with React + TypeScript frontend and Express + PostgreSQL backend.

## Architecture
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, TanStack Query, wouter routing
- **Backend**: Express.js with REST API endpoints
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: bcrypt password hashing, express-session with connect-pg-simple; role stored in session
- **Drag & Drop**: @hello-pangea/dnd for Kanban board

## Key Files
- `shared/schema.ts` — Drizzle schema: `leads`, `activities`, `users` tables with enums (incl. `userRoleEnum`)
- `server/db.ts` — Database connection via node-postgres
- `server/migrate.ts` — Startup migrations: CREATE TABLE IF NOT EXISTS + ALTER TABLE ADD COLUMN IF NOT EXISTS
- `server/storage.ts` — DatabaseStorage class implementing IStorage interface; `getLeadsByAssignee()`
- `server/auth.ts` — Session auth: login/logout/me/profile routes, `requireAuth` + `requireAdmin` middlewares, user seeding
- `server/routes.ts` — REST API with role-based access control (partners filtered/blocked)
- `client/src/lib/app-state.tsx` — React context + TanStack Query; exposes `isPartner` boolean

## Pages
- `/` — Redirects to /leads (if logged in) or shows login form
- `/leads` — Leads table (admin: full CRUD; partner: "Meine Leads" read-only simplified view)
- `/active-leads` — Kanban board with drag-and-drop (admin only)
- `/lost-leads` — Lost leads table (admin only)
- `/customers` — Customers page
- `/import` — Import page
- `/profile` — Profile settings: change name, username, password

## Authentication & Roles
- Session-based auth with PostgreSQL session store; `req.session.userRole` stored on login
- **Admin**: full access — andre/andre123, jacob/jacob123
- **Partner**: restricted — marco/Erfolg!26 (role=partner, seeded on startup)
- `requireAuth` — any logged-in user; `requireAdmin` — admin only
- Partner restrictions: only sees own assigned leads, cannot create/edit/delete leads or activities; can add comments & set deadlines

## Data Model
- **User**: id (UUID), username (unique), name, password (bcrypt hash), role (admin|partner, default admin)
- **Lead**: id (UUID), name, role, company, status (enum), source (text), assignedTo (user UUID), lastContact, nextFollowUp, phone, email, website, address, notes, createdAt
- **Activity**: id (UUID), leadId (FK), type (comment/system), text, authorId, timestamp, updatedAt
- **Notification**: id (UUID), userId (FK), leadId (FK), createdAt, seenAt (nullable) — tracks unseen lead assignments for partners
- **LeadStatus**: Neu, Erstkontakt, Setting, Closing, Wiedervorlage, Verlorener Lead
- **LeadSource**: Tool-Import, Website Leads, Video-Analyse

## Design Notes
- Minimal SaaS, Inter font, light theme, color-coded status badges
- Tailwind v4 CSS variables use raw `H S% L%` format in index.css
- InlineEdit.tsx must NOT have a companion barrel file (causes runtime crash)
- Calendar uses table-fixed + w-[14.28%] for weekday alignment
- User avatars show first letter of name (no avatar field)
- `parseUTC()` used everywhere for consistent timestamp parsing

## Gotchas
- Partner role: `req.session.userRole` set on login; must re-login after role change takes effect
- Activity editing (`PATCH /api/activities/:id`) is admin-only; partners can only POST new comments
- Bulk routes (`/api/leads/bulk-delete`, `/api/leads/bulk-update`) are admin-only
- `ALTER TABLE users ADD COLUMN IF NOT EXISTS role` runs safely on existing DBs
