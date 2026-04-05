# QCC Professional Development Dashboard

## Tech Stack
- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Supabase (free tier) for auth + PostgreSQL database
- Deployed on Vercel (free tier)

## Key Commands
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run lint` - Run ESLint

## Project Structure
- `src/app/` - Pages (App Router)
- `src/components/` - Shared components
- `src/components/admin/` - Admin-specific components
- `src/lib/supabase/` - Supabase client/server/middleware utilities
- `src/lib/types.ts` - TypeScript interfaces
- `supabase/migrations/` - SQL migrations (run in order in Supabase SQL editor)

## Database
6 tables: profiles, courses, pathways, pathway_courses, completions, badges_earned.
Badge trigger auto-issues badges when all courses in a pathway are completed.
Run migrations 001-004 in Supabase SQL editor.

## Auth
- Email/password via Supabase Auth
- Two roles: faculty (default), admin
- Middleware protects /dashboard (auth required) and /admin/* (admin required)
- Set first admin: `UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';`

## Branding
- Primary blue: #1F5A96
- Sky blue: #1BA0D8
- CSS vars defined in globals.css with qcc- prefix
