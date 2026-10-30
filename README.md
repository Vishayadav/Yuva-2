# BlogCraft – Blog Platform REST API

<small>Week 2: Backend API Development and Database Integration</small>

**Technology:** Node.js · Express.js · SQLite · JWT · Zod · Supertest

BlogCraft is a structured REST API for a small blog platform. It demonstrates relational database integration, user registration and login, authenticated content management, complete post/comment CRUD, request validation, access control, error handling, and API testing.

## Project objectives

- Build a backend service using a suitable server-side framework.
- Design and initialize a relational schema with primary and foreign keys.
- Implement registration and authentication.
- Implement Create, Read, Update, and Delete operations for posts and comments.
- Validate input and return meaningful HTTP status codes.
- Verify API behaviour with automated tests and a Postman collection.
- Document setup, architecture, database design, and API contracts.

## Main capabilities

| Area | Capability |
|---|---|
| Authentication | Registration, login, bcrypt password hashing, JWT |
| Posts | Create, list, read by slug, update, delete |
| Publication | Draft and published post states |
| Comments | Create, list, update, delete |
| Authorization | Only the resource owner can update/delete |
| Validation | Zod schemas for body and query data |
| Database | SQLite, foreign keys, indexes, parameterized queries |
| Reliability | Central error handler, 404 handling, rate limiting |
| Testing | Automated integration tests with Supertest |
| Documentation | API reference, schema, architecture, test plan |

## Quick start

**Requirements:** Node.js 20+ and npm.

```bash
npm install
```

Create `.env` from `.env.example`, then set `JWT_SECRET` to a unique random value of at least 32 characters.

PowerShell:
```powershell
Copy-Item .env.example .env
```

Start:
```bash
npm run dev
```

Health check: `http://localhost:3000/api/health`

Run tests:
```bash
npm test
```

Optional demo data:
```bash
npm run db:seed
```

See [Setup and Submission Guide](docs/SETUP_AND_SUBMISSION.md) for detailed instructions.

## API summary

Base URL: `http://localhost:3000/api`

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register user |
| POST | `/auth/login` | Public | Login and receive JWT |
| GET | `/posts` | Public | Paginated published posts |
| GET | `/posts/mine` | Bearer JWT | Current user's posts |
| GET | `/posts/:slug` | Public / owner for draft | Retrieve post |
| POST | `/posts` | Bearer JWT | Create post |
| PATCH | `/posts/:id` | Owner JWT | Update post |
| DELETE | `/posts/:id` | Owner JWT | Delete post |
| GET | `/posts/:postId/comments` | Public | List comments |
| POST | `/posts/:postId/comments` | Bearer JWT | Create comment |
| PATCH | `/comments/:id` | Comment owner JWT | Update comment |
| DELETE | `/comments/:id` | Comment owner JWT | Delete comment |

Full request/response documentation: [API Reference](docs/API_REFERENCE.md).

## Repository structure

```text
BlogCraft_API_Assessment_Ready/
├── src/
│   ├── config/database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errors.js
│   │   └── validate.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── posts.routes.js
│   │   └── comments.routes.js
│   ├── utils/
│   │   ├── http.js
│   │   └── slug.js
│   ├── app.js
│   ├── server.js
│   └── validation.js
├── database/schema.sql
├── docs/
│   ├── API_REFERENCE.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_DESIGN.md
│   ├── SETUP_AND_SUBMISSION.md
│   └── TEST_PLAN.md
├── postman/BlogCraft.postman_collection.json
├── scripts/
│   ├── reset-db.js
│   └── seed.js
├── tests/api.test.js
├── .env.example
├── .gitignore
└── package.json
```

## Engineering and security notes

- Passwords are stored as bcrypt hashes.
- JWT secret and runtime configuration are supplied through environment variables.
- SQL operations use prepared statements.
- Ownership checks protect post and comment mutations.
- Foreign-key constraints preserve referential integrity.
- Validation is performed before data reaches SQL operations.
- Helmet, CORS configuration, JSON payload limits, and authentication rate limiting are enabled.

## Documentation

- [Architecture and Design](docs/ARCHITECTURE.md)
- [Database Design](docs/DATABASE_DESIGN.md)
- [API Reference](docs/API_REFERENCE.md)
- [Test Plan](docs/TEST_PLAN.md)
- [Setup, Demo and Submission Guide](docs/SETUP_AND_SUBMISSION.md)

## Assessment note

This repository is a complete implementation intended for local execution and assessment demonstration. Run it on your machine, execute the tests, verify the endpoints, and capture genuine evidence before submission. Automated tests are provided but should not be represented as executed until you run them in your environment.

## Limitations and future improvements

Potential extensions include password reset and email verification, refresh-token rotation, moderation, audit logs, file uploads, database migrations, OpenAPI/Swagger UI hosting, and deployment to a managed PostgreSQL service.
