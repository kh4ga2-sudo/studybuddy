# API Endpoints Summary

The refactored backend contains more than 60 route handlers across separate modules.

## Core
- `GET /api/health`
- `/api/auth/*`
- `/api/profile/*`
- `/api/majors/*`
- `/api/catalog/*`
- `/api/courses/*`

## Learning Features
- `/api/courses/:courseId/materials`
- `/api/quiz`
- `/api/quiz/attempts`
- `/api/notes`
- `/api/resources`
- `/api/progress`

## Collaboration
- `/api/community/posts`
- `/api/chat/:courseId`
- `/api/events`
- `/api/rooms`
- `/api/invites`

## Analytics/Admin
- `/api/analytics`
- `/api/gamification/achievements`
- `/api/gamification/leaderboard`
- `/api/admin/*`

## Password Reset

- `POST /api/auth/password/forgot` — sends a 6-digit code to the user's email through SMTP.
- `POST /api/auth/password/verify-code` — verifies the 6-digit code.
- `POST /api/auth/password/reset` — updates the password after code verification.

## User Reports

- `POST /api/reports` — creates a support report in the database.
- `GET /api/admin/reports?status=all` — admin-only list of reports.
- `PUT /api/admin/reports/:id` — admin-only update of status/admin note.
