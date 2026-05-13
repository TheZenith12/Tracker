# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal Income & Expense Tracking Web App (Finance Tracker) — Mongolian-language first, dark/light mode, mobile-first UI.

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS — `frontend/` — runs on port **3000**
- **Backend**: NestJS + Prisma ORM + PostgreSQL — `backend/` — runs on port **4000**
- **Database**: PostgreSQL 16 (local Windows service `postgresql-x64-16`) — port **5432**, db `finance_tracker`, user `postgres`, password `postgres123`

## Dev Commands

### Frontend (`frontend/`)
```bash
npm run dev          # Start Next.js dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint
```

### Backend (`backend/`)
```bash
npm run start:dev    # Start NestJS in watch mode (port 4000)
npm run build        # Compile TypeScript → dist/
npm run start:prod   # Run compiled dist/main.js

npx prisma migrate dev --name <name>   # Create & apply migration
npx prisma migrate deploy              # Apply migrations (prod)
npx prisma generate                    # Regenerate Prisma client
npx prisma studio                      # GUI on port 5555
npm run prisma:seed                    # Seed default categories (ts-node prisma/seed.ts)
```

### Dev server config
`.claude/launch.json` defines three servers: **Frontend (Next.js)**, **Backend (NestJS)**, **Prisma Studio** — use `preview_start` to launch them.

## Architecture

### Backend — NestJS Modular

Each domain is a self-contained NestJS module: `auth`, `users`, `accounts`, `transactions`, `categories`, `budgets`, `reports`, `recurring`.

**Global setup** (`src/main.ts`):
- All routes prefixed with `/api/v1`
- CORS allows `APP_URL` (default `http://localhost:3000`)
- `ValidationPipe` with `whitelist: true` and `transform: true`
- Swagger UI at `/api/docs`

**Shared infrastructure**:
- `PrismaModule` is global — `PrismaService` extends `PrismaClient` and calls `$connect()` on `onModuleInit`
- `ConfigModule.forRoot({ isGlobal: true })` — env vars available everywhere via `ConfigService`
- `ScheduleModule` powers the recurring transactions cron job (midnight daily)

**Auth flow**:
- Register → sends email verification → user calls `/auth/verify-email?token=` → login returns `accessToken` (15m) + `refreshToken` (7d)
- Tokens stored in DB (`refreshToken` column on User); rotation on every refresh
- `JwtAuthGuard` + `JwtStrategy` protect all non-auth routes
- Password reset uses UUID token stored in `resetPasswordToken` + `resetPasswordExpiry` (1 hour)

**Data model** (`prisma/schema.prisma`):
- `User` → many `Account` (CASH/BANK/CARD/EWALLET), `Category`, `Budget`, `RecurringTransaction`, `AuditLog`
- `Transaction` has `fromAccountId` (required) + `toAccountId` (only for TRANSFER type)
- `Category.userId` is nullable — null means system/default category
- `Budget` unique on `(userId, categoryId, month, year)`
- Amounts use `Decimal(18,2)` — never use JS float arithmetic with these

### Frontend — Next.js 14 App Router

**Route groups**:
- `(auth)` — `/login`, `/register` — no layout wrapper, full-page gradient background
- `(dashboard)` — `/dashboard`, `/accounts`, `/transactions`, `/budgets`, `/reports`, `/recurring` — protected by `DashboardLayout`

**Auth guard**: `(dashboard)/layout.tsx` is a client component that reads Zustand `useAuthStore`. If `user` is null, redirects to `/login` immediately (returns `null` while redirecting to avoid flash).

**State management**:
- **Server state**: TanStack Query v5 — all API calls go through hooks in `src/hooks/` (`useTransactions`, `useAccounts`, `useBudgets`, `useReports`)
- **Client state**: Zustand `useAuthStore` (`src/store/auth.store.ts`) — persisted to localStorage (`auth-store` key), only `user` object is persisted (tokens stored separately in `localStorage`)

**API client** (`src/lib/api.ts`):
- Axios instance with `baseURL: NEXT_PUBLIC_API_URL` and `withCredentials: true`
- Request interceptor injects `Bearer` token from `localStorage.getItem('accessToken')`
- Response interceptor handles 401 → calls `/auth/refresh` → retries queued requests → on failure clears localStorage and redirects to `/login`

**Providers** (`src/app/providers.tsx`): `'use client'` wrapper containing `ThemeProvider` (next-themes) → `QueryClientProvider` → `Toaster` (react-hot-toast, top-right, 3s). QueryClient staleTime = 5 minutes, retry = 1.

**CSS utilities** (`globals.css`): Custom Tailwind utility classes: `.card`, `.skeleton`, `.income-text`, `.expense-text`, `.badge-income`, `.badge-expense`. CSS variables for theming: `--background`, `--foreground`, `--border`, `--card`, `--muted` etc. — used via `hsl(var(--name))`.

**Important**: `src/app/layout.tsx` is a server component — never add `'use client'` or browser APIs there. All client-side providers live in `providers.tsx`.

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/finance_tracker"
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM   # Gmail SMTP
APP_URL=http://localhost:3000
PORT=4000
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

## Key Patterns

- **Form validation**: Frontend uses `react-hook-form` + `zod` schemas. Backend uses `class-validator` DTOs.
- **Error messages**: All backend error messages are in Mongolian (e.g., `'И-мэйл бүртгэлтэй байна'`).
- **Invalidation**: After any mutation (create/update/delete transaction), invalidate `['transactions']`, `['transactions-summary']`, and `['accounts']` query keys because account balances update server-side.
- **Account balance**: Updated automatically in the `TransactionsService` when a transaction is created/deleted — never manually recalculate on the frontend.
- **Recurring transactions**: `RecurringService` has a `@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)` that checks `nextDate <= now` and creates transactions + advances `nextDate`.

## Docker (Production)
`docker-compose.yml` at repo root runs `postgres` + `backend`. Frontend is deployed separately. The backend container runs `npx prisma migrate deploy && node dist/main` on startup.
