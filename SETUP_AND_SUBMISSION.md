# Setup, Demonstration and Submission Guide

## Prerequisites

- Node.js 20 or later (npm is included).
- Windows PowerShell, macOS Terminal, or Linux shell.
- Postman (recommended) or cURL.

## Local setup

1. Extract the submission archive.
2. Open a terminal in the `BlogCraft_API_Assessment_Ready` folder.
3. Install packages:

   ```bash
   npm install
   ```

4. Create local environment configuration:

   Windows PowerShell:
   ```powershell
   Copy-Item .env.example .env
   ```

   macOS/Linux:
   ```bash
   cp .env.example .env
   ```

5. Edit `.env`. Set `JWT_SECRET` to a unique random string of at least 32 characters. Do not share or commit this secret.
6. Start the server:

   ```bash
   npm run dev
   ```

7. Open `http://localhost:3000/api/health`. The API should report `healthy`.

The database and tables are initialized automatically on first startup. The default database file is `database/blogcraft.sqlite`.

## Optional demo data

In a second terminal:

```bash
npm run db:seed
```

Demo account:
- Email: `demo@blogcraft.local`
- Password: `DemoPass123!`

This is local-only demonstration data. Never deploy the demo credentials to a public environment.

## Test

```bash
npm test
```

Expected: all automated tests pass. If a native SQLite dependency fails to install, use a supported Node.js LTS version and rerun `npm install`.

## Suggested 3-minute demonstration

1. Explain the three relational entities: users, posts, comments.
2. Register a user and log in to receive a JWT.
3. Show that creating a post without a token returns 401.
4. Create a published post using the token.
5. Retrieve the post and show its generated slug.
6. Add and retrieve a comment.
7. Update and delete the comment and post.
8. Show validation failure for an invalid payload.
9. Explain ownership checks, prepared SQL statements, password hashing, and foreign keys.

## Submission checklist

- [ ] Replace the example JWT secret in your local `.env`.
- [ ] Run `npm install`.
- [ ] Run `npm test` and capture the real output.
- [ ] Test the endpoints in Postman.
- [ ] Capture screenshots of the working application.
- [ ] Review and understand the source code.
- [ ] Do not include `.env`, local database files, or `node_modules` in the submitted ZIP.
- [ ] Include the source, README, API reference, database design, test plan, and Postman collection.
- [ ] Follow your institution's rules about attribution and permitted assistance.
