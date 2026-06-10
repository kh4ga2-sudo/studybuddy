# StudyBuddy Refactored Version — How to Run

This version uses:

- React + Vite frontend
- Express backend
- Prisma ORM
- PostgreSQL database

## 1) Start PostgreSQL

The easiest way is Docker:

```bash
docker compose up -d postgres
```

If you already have PostgreSQL installed, create a database named `studybuddy` and update `backend/.env`.

## 2) Install backend packages

```bash
cd backend
npm install
```

## 3) Create/update tables with Prisma

For an existing project database, use the safe command below. It adds missing tables without deleting existing data:

```bash
npm run generate
npm run db:push
```

Only use migrations on a clean development database:

```bash
npm run migrate -- --name init
```

Do **not** run `prisma migrate reset` on your real project database because it deletes data.

## 4) Seed the database

```bash
npm run seed
```

Run this only when you want to insert/update the seed data. It imports the 2,835 UQU courses and creates materials, quiz questions, resources, demo users, notes, community data, and gamification data.

Demo accounts:

```text
admin@studybuddy.edu / admin123
student@studybuddy.edu / password123
```

## 5) Run backend

```bash
npm run dev
```

Backend URL:

```text
http://localhost:3001/api/health
```

## 6) Run frontend in a second terminal

```bash
cd ..
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

## Password reset email setup

To make the forgot-password feature send real verification codes, set SMTP values in `backend/.env`:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_google_app_password"
SMTP_FROM="Study Buddy <your_email@gmail.com>"
```

User reports are stored in PostgreSQL and visible from `Admin Panel → User Reports`.

## Notes

- The Vite proxy is already configured to forward `/api` to `http://localhost:3001`.
- Do not use the old `studybuddy.db`; this version is PostgreSQL/Prisma.
- Main database model is in `backend/prisma/schema.prisma`.
- Main architecture documentation is in `backend/docs/ARCHITECTURE.md`.
