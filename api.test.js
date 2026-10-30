const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-that-is-at-least-thirty-two-characters";
const { createDatabase } = require("../src/config/database");
const { createApp } = require("../src/app");

let db;
let app;
let token;
let userId;
let postId;
let postSlug;
let commentId;

test.before(() => {
  db = createDatabase(":memory:");
  app = createApp({ db });
});

test("health endpoint responds successfully", async () => {
  const res = await request(app).get("/api/health");
  assert.equal(res.status, 200);
  assert.equal(res.body.data.status, "healthy");
});

test("registration validates input and rejects duplicate email", async () => {
  const bad = await request(app).post("/api/auth/register").send({
    name: "A", email: "bad-email", password: "123"
  });
  assert.equal(bad.status, 400);

  const good = await request(app).post("/api/auth/register").send({
    name: "Test Author", email: "author@example.com", password: "SecurePass123"
  });
  assert.equal(good.status, 201);
  userId = good.body.data.user.id;

  const duplicate = await request(app).post("/api/auth/register").send({
    name: "Test Author", email: "AUTHOR@example.com", password: "SecurePass123"
  });
  assert.equal(duplicate.status, 409);
});

test("login issues a JWT and rejects incorrect credentials", async () => {
  const wrong = await request(app).post("/api/auth/login").send({
    email: "author@example.com", password: "incorrect"
  });
  assert.equal(wrong.status, 401);

  const login = await request(app).post("/api/auth/login").send({
    email: "author@example.com", password: "SecurePass123"
  });
  assert.equal(login.status, 200);
  token = login.body.data.token;
  assert.ok(token);
});

test("protected routes reject missing tokens", async () => {
  const res = await request(app).post("/api/posts").send({
    title: "A valid test title", excerpt: "A short excerpt",
    content: "This is a sufficiently long body for a valid blog post."
  });
  assert.equal(res.status, 401);
});

test("author can create, read, update and delete a post", async () => {
  const created = await request(app).post("/api/posts")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "A Practical API Test",
      excerpt: "Testing the blog API lifecycle.",
      content: "This is a sufficiently long body for a valid blog post and its integration test.",
      status: "published"
    });
  assert.equal(created.status, 201);
  postId = created.body.data.id;
  postSlug = created.body.data.slug;

  const read = await request(app).get(`/api/posts/${postSlug}`);
  assert.equal(read.status, 200);
  assert.equal(read.body.data.title, "A Practical API Test");

  const list = await request(app).get("/api/posts?page=1&limit=5");
  assert.equal(list.status, 200);
  assert.ok(list.body.pagination.total >= 1);

  const updated = await request(app).patch(`/api/posts/${postId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "An Updated API Test" });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.title, "An Updated API Test");
});

test("author can create, read, update and delete comments", async () => {
  const created = await request(app).post(`/api/posts/${postId}/comments`)
    .set("Authorization", `Bearer ${token}`)
    .send({ content: "This comment is useful." });
  assert.equal(created.status, 201);
  commentId = created.body.data.id;

  const list = await request(app).get(`/api/posts/${postId}/comments`);
  assert.equal(list.status, 200);
  assert.equal(list.body.data.length, 1);

  const updated = await request(app).patch(`/api/comments/${commentId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ content: "This comment has been edited." });
  assert.equal(updated.status, 200);

  const deleted = await request(app).delete(`/api/comments/${commentId}`)
    .set("Authorization", `Bearer ${token}`);
  assert.equal(deleted.status, 200);
});

test("rejects invalid post data and unknown routes", async () => {
  const invalid = await request(app).post("/api/posts")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "No", excerpt: "", content: "short" });
  assert.equal(invalid.status, 400);

  const missing = await request(app).get("/this-route-does-not-exist");
  assert.equal(missing.status, 404);
});

test("author can delete a post and its comments are cascade-managed", async () => {
  const deleted = await request(app).delete(`/api/posts/${postId}`)
    .set("Authorization", `Bearer ${token}`);
  assert.equal(deleted.status, 200);
  assert.equal(db.prepare("SELECT id FROM posts WHERE id = ?").get(postId), undefined);
});

test.after(() => db.close());
