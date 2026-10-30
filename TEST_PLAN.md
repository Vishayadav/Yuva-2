# Test Plan and Evidence Template

## Automated tests

Run:

```bash
npm test
```

The automated suite uses Node's built-in test runner and Supertest with an isolated in-memory SQLite database.

| Test ID | Scenario | Expected result |
|---|---|---|
| TC-01 | Health endpoint | 200 and healthy status |
| TC-02 | Invalid registration payload | 400 validation error |
| TC-03 | Valid registration | 201 and safe user object |
| TC-04 | Duplicate email (case-insensitive) | 409 |
| TC-05 | Invalid login credentials | 401 |
| TC-06 | Valid login | 200 and JWT |
| TC-07 | Create post without token | 401 |
| TC-08 | Create valid post with token | 201 |
| TC-09 | List published posts | 200 with pagination |
| TC-10 | Read post by slug | 200 |
| TC-11 | Update own post | 200 |
| TC-12 | Create comment | 201 |
| TC-13 | List comments | 200 |
| TC-14 | Update own comment | 200 |
| TC-15 | Delete comment | 200 |
| TC-16 | Invalid post data | 400 |
| TC-17 | Unknown route | 404 |
| TC-18 | Delete own post | 200 |

## Manual Postman checks

1. Import `postman/BlogCraft.postman_collection.json`.
2. Run the API locally.
3. Execute **Register** and **Login**. Login stores the JWT in the collection variable `token`.
4. Execute **Create published post**. The response stores `postId` and `postSlug`.
5. Execute **List posts**, **Get post**, and **List comments**.
6. Execute **Create comment**. The response stores `commentId`.
7. Execute **Update comment**, **Delete comment**, **Update post**, and **Delete post**.
8. Test negative cases: missing token, malformed email, duplicate email, invalid field lengths, and a non-existent resource.

## Evidence to capture before submission

- Screenshot of successful `npm install`.
- Screenshot of `npm test` with all tests passing.
- Screenshot of `GET /api/health` in Postman.
- Screenshot of successful registration and login.
- Screenshot of post creation and retrieval.
- Screenshot of comment creation and retrieval.
- Screenshot of one validation/authentication error response.

Record the actual result and date below. Do not mark tests as passed until they have been run.

| Execution date | Environment | Test command | Actual result |
|---|---|---|---|
| To be completed by student | Node.js 20+ | `npm test` | Pending local execution |
