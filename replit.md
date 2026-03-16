# HANDWERKS SEO | CRM

## Overview
A modern SaaS CRM for lead management, built with React + TypeScript frontend and Express + PostgreSQL backend.

## Architecture
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, TanStack Query, wouter routing
- **Backend**: Express.js with REST API endpoints
- **Database**: PostgreSQL with Drizzle ORM
- **Drag & Drop**: @hello-pangea/dnd for Kanban board

## Key Files
- `shared/schema.ts` — Drizzle schema: `leads`, `activities`, `users` tables with enums
- `server/db.ts` — Database connection via @neondatabase/serverless
- `server/storage.ts` — DatabaseStorage class implementing IStorage interface
- `server/routes.ts` — REST API: /api/leads, /api/leads/:id/activities, /api/activities/:id, /api/seed
- `client/src/lib/app-state.tsx` — React context + TanStack Query for API-driven state
- `client/src/lib/queryClient.ts` — Query client with apiRequest helper

## Pages
- `/` — Login (user select: André, Jacob)
- `/leads` — All leads table view
- `/active-leads` — Kanban board with drag-and-drop
- `/lost-leads` — Lost leads table
- `/email-inbox` — IMAP email configuration page

## Data Model
- **Lead**: id (UUID), name, role, company, status (enum), source (enum), assignedTo, lastContact, nextFollowUp, phone, email, website, address, notes, createdAt
- **Activity**: id (UUID), leadId (FK), type (comment/system), text, authorId, timestamp, updatedAt
- **LeadStatus**: Neu, Erstkontakt, Setting, Closing, Wiedervorlage, Verlorener Lead
- **LeadSource**: Google Ads, Organisch, Tool-Import, Manuell

## Users
- André (user_a), Jacob (user_b) — stored as strings in leads.assignedTo (not FK)

## Design Notes
- Minimal SaaS, Inter font, light theme, color-coded status badges
- Tailwind v4 CSS variables use raw `H S% L%` format in index.css
- InlineEdit.tsx must NOT have a companion barrel file (causes runtime crash)
- Calendar uses table-fixed + w-[14.28%] for weekday alignment
