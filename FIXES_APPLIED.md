# StudyBuddy UI / Integration Fixes

This version includes the requested demo fixes:

- Improved course group chat composer: larger input, better send button, attachment picker, empty state, and cleaner group header.
- Connected meeting buttons: join buttons now open meeting links, invite accept/decline calls the backend API.
- Improved resource links so fallback resources no longer point to `#`.
- Added a richer background for login and signup pages.
- Replaced footer `#` links with working information panels so bottom links do not jump to the top of the page.
- Adjusted landing statistics to look more realistic: active students around 800 instead of thousands.
- Verified the frontend production build with `npm run build`.

Run it the same way as the previous refactored version:

```bash
docker compose up -d postgres
cd backend
npm install
npm run migrate -- --name init
npm run seed
npm run dev
```

Open a second terminal in the project root:

```bash
npm install
npm run dev
```

## Production features added

- Restored a real "Forgot password" flow.
- Added SMTP-based email verification codes for password reset.
- Added database table for password reset codes.
- Added a real "Report an issue" form on the landing page.
- Added in-app report button in the topbar for logged-in users.
- Added `support_reports` table in Prisma/PostgreSQL.
- Added admin reports tab for viewing reports, changing status, and saving admin notes.
- Added backend API endpoints for reports and password reset.
- Added `PASSWORD_RESET_AND_REPORTS.md` with safe setup instructions.
