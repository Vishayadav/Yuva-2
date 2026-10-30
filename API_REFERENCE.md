# API Reference

Base URL: `http://localhost:3000/api`

All request and response bodies use JSON. Protected endpoints require:

`Authorization: Bearer <token>`

## Response conventions

Success:
```json
{
  "success": true,
  "data": {}
}
```

Error:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid data.",
    "details": []
  }
}
```

## Authentication

### POST `/auth/register`

Public. Creates an account.

Request:
```json
{
  "name": "Taylor Reader",
  "email": "taylor@example.com",
  "password": "SecurePass123"
}
```

Returns `201 Created`. Duplicate email returns `409 Conflict`.

### POST `/auth/login`

Public. Returns a signed JWT.

Request:
```json
{
  "email": "taylor@example.com",
  "password": "SecurePass123"
}
```

Returns `200 OK` with `data.token`. Invalid credentials return `401 Unauthorized`.

## Posts

### GET `/posts?page=1&limit=10&q=express`

Public. Lists published posts. `page` starts at 1; `limit` is 1–50; `q` searches title, excerpt, and content. Response includes pagination metadata.

### GET `/posts/:slug`

Public for published posts. An authenticated author may also read their own draft. Returns `404` when missing or not visible.

### GET `/posts/mine`

Authenticated. Lists the current user's posts, including drafts.

### POST `/posts`

Authenticated. Creates a post.

```json
{
  "title": "Building a REST API",
  "excerpt": "A practical introduction to API development.",
  "content": "This article contains at least twenty characters of content.",
  "status": "draft"
}
```

`status` may be `draft` or `published`; omitted status defaults to `draft`. Returns `201`.

### PATCH `/posts/:id`

Authenticated owner only. Partial update; send one or more fields from the create schema. Returns `403` if another user owns the post and `404` if it does not exist.

### DELETE `/posts/:id`

Authenticated owner only. Deletes the post and its comments through the foreign-key cascade. Returns `200`.

## Comments

### GET `/posts/:postId/comments`

Public. Lists comments on a published post.

### POST `/posts/:postId/comments`

Authenticated. Adds a comment to a published post.

```json
{ "content": "This explanation was helpful." }
```

Returns `201`.

### PATCH `/comments/:id`

Authenticated comment author only. Updates the comment content.

### DELETE `/comments/:id`

Authenticated comment author only. Deletes the comment.

## HTTP status codes

| Status | Meaning |
|---|---|
| 200 | Request succeeded |
| 201 | Resource created |
| 400 | Validation error or malformed input |
| 401 | Missing, invalid, or expired authentication token |
| 403 | Authenticated user does not own the resource |
| 404 | Resource or route not found |
| 409 | Duplicate email or unique resource conflict |
| 429 | Authentication rate limit exceeded |
| 500 | Unexpected server error |

## Validation limits

| Field | Rules |
|---|---|
| name | 2–80 characters |
| email | Valid email, maximum 254 characters |
| password | 8–72 characters |
| title | 5–160 characters |
| excerpt | 1–300 characters |
| post content | 20–20,000 characters |
| comment content | 2–2,000 characters |
| page | Integer, minimum 1 |
| limit | Integer, 1–50 |
| search query | Maximum 100 characters |
