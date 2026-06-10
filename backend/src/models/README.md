# Models

The data models are implemented through Prisma in `backend/prisma/schema.prisma`.

This folder exists to make the backend architecture explicit for the report/UML discussion: the model layer is Prisma + PostgreSQL, not SQLite tables hidden in one `db.js` file.
