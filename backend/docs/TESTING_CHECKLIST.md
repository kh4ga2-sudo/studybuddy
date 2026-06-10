# Testing Checklist

## Setup
- [ ] `docker compose up -d postgres` starts PostgreSQL.
- [ ] `cd backend && npm install` succeeds.
- [ ] `npm run migrate -- --name init` creates database tables.
- [ ] `npm run seed` imports UQU courses and demo data.

## API Checks
- [ ] `GET /api/health` returns ok.
- [ ] `POST /api/auth/login` works with demo student.
- [ ] `GET /api/catalog` returns thousands of courses.
- [ ] `GET /api/courses/:courseId/materials` returns material rows.
- [ ] `GET /api/quiz?courseId=<id>` returns quiz questions.
- [ ] `GET /api/resources?courseId=<id>` returns resources.
- [ ] `GET /api/analytics` returns system totals.

## Frontend Checks
- [ ] Login page works.
- [ ] Dashboard loads enrolled courses.
- [ ] Course materials come from backend API.
- [ ] Resource tab comes from backend API.
- [ ] Admin catalog can list/create/update/delete courses.
