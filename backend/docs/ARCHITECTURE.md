# StudyBuddy Backend Architecture

This version replaces the single-file SQLite backend with a layered Express architecture:

```text
src/server.js
  -> src/app.js
     -> src/routes/*Routes.js
        -> src/controllers/*Controller.js
           -> Prisma Client
              -> PostgreSQL
```

## Main Modules
- Auth / Profile
- Majors / Catalog / Courses
- Materials / Resources
- Quiz Bank / Quiz Attempts
- Notes / Progress Logs
- Community Posts / Comments
- Analytics / Gamification
- Admin CRUD

## Why this is stronger for UML and ERD
- The Prisma schema defines explicit entities and relationships.
- Each feature module has a route and controller.
- PostgreSQL supports relational design better than the earlier SQLite demo file.
- Seed data imports 2,835 UQU courses from the provided Excel-derived JSON.
