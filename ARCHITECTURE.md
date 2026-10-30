# Architecture and Design Notes

## 1. Overview

BlogCraft is a layered REST API. Express handles HTTP transport, route modules map URLs to application operations, middleware handles cross-cutting concerns, and the database module owns SQLite setup and relational constraints.

## 2. Request lifecycle

1. Client sends an HTTP request with JSON and, where required, a Bearer JWT.
2. Security and parsing middleware apply HTTP headers, CORS policy, and JSON parsing.
3. Route-level validation checks request bodies or query parameters with Zod.
4. Authentication middleware verifies the JWT for protected operations.
5. Route handler performs parameterized SQL operations.
6. The API returns a JSON response with a meaningful HTTP status.
7. Central error middleware formats unexpected and expected errors consistently.

## 3. Component responsibilities

| Component | Responsibility |
|---|---|
| `src/server.js` | Loads environment, starts HTTP server, handles shutdown |
| `src/app.js` | Configures Express middleware and mounts routes |
| `src/config/database.js` | Opens SQLite, enables foreign keys, creates schema/indexes |
| `src/routes/auth.routes.js` | Registration and login |
| `src/routes/posts.routes.js` | Post listing, detail, creation, update, deletion |
| `src/routes/comments.routes.js` | Comment listing, creation, update, deletion |
| `src/middleware/auth.js` | JWT authentication |
| `src/middleware/validate.js` | Zod validation |
| `src/middleware/errors.js` | 404 and centralized error responses |
| `src/validation.js` | Input contracts |
| `src/utils/slug.js` | Stable URL slug generation |

## 4. Security and integrity decisions

- Passwords are hashed with bcrypt; plaintext passwords are never persisted.
- JWTs are signed using a secret supplied through environment configuration.
- SQL statements use prepared parameters to reduce SQL injection risk.
- Post and comment mutations enforce resource ownership.
- SQLite foreign keys enforce referential integrity; deletion cascades from users/posts.
- Zod validates and trims user input before database operations.
- Helmet sets common security headers; authentication endpoints are rate limited.
- Request JSON size is limited to 100 KB.
- `.env` and local database files are excluded from version control.

## 5. Known limitations

This is a local learning/assessment project, not a production-ready hosted service. It does not include email verification, password reset, refresh-token rotation, file uploads, moderation, audit logging, or database migrations. SQLite is suitable for a small local workload; a multi-instance production deployment should use a managed database such as PostgreSQL.
