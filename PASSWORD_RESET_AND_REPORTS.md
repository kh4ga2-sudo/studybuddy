# Password Reset + User Reports

This version adds two real production features:

1. Forgot Password flow with a 6-digit verification code sent to the user's email.
2. User Reports stored in PostgreSQL and visible from the Admin Panel.

## Required database update without deleting existing data

Do **not** run `prisma migrate reset`.

From the backend folder, run:

```bash
npm install
npm run generate
npm run db:push
npm run dev
```

`npm run db:push` adds the new tables safely:

- `password_reset_codes`
- `support_reports`

It does not wipe your existing users/courses/materials.

## Email setup for real password reset codes

The password reset feature sends real emails through SMTP. Add these values in `backend/.env`:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_google_app_password"
SMTP_FROM="Study Buddy <your_email@gmail.com>"
```

For Gmail, use an App Password, not your normal Gmail password.

## New backend endpoints

### Public auth endpoints

- `POST /api/auth/password/forgot`
  - body: `{ "email": "student@example.com" }`
  - sends a 6-digit code to the user's email if the account exists.

- `POST /api/auth/password/verify-code`
  - body: `{ "email": "student@example.com", "code": "123456" }`

- `POST /api/auth/password/reset`
  - body: `{ "email": "student@example.com", "code": "123456", "newPassword": "newPassword123" }`

### Reports

- `POST /api/reports`
  - public or logged-in users can submit reports.
  - body: `{ "category": "bug", "subject": "...", "message": "...", "name": "...", "email": "..." }`

### Admin reports

- `GET /api/admin/reports?status=all`
- `PUT /api/admin/reports/:id`
  - body: `{ "status": "reviewing", "admin_note": "Checked by admin" }`

## Where to see reports in the app

Log in as an admin, open the sidebar, then go to:

`Admin Panel → User Reports`

You can change report status and add an admin note.


## Latest production fixes

- The password reset endpoint now checks the `users` table first. If the email is not registered, it returns a clear error and no code is created.
- Reset codes are only left active when the email is actually sent. If SMTP fails, the code is marked used and the API returns an error.
- Gmail App Password spaces are removed automatically, so copying the 16-character password with spaces will still work.
- The landing report modal and in-app report modal now use real responsive form controls and no overlapping fields.
- The login/register page now has top spacing so the auth card does not enter the top navigation bar.
