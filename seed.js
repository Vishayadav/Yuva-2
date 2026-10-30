require("dotenv").config();
const bcrypt = require("bcryptjs");
const { createDatabase } = require("../src/config/database");
const { makeSlug } = require("../src/utils/slug");

if (!process.env.JWT_SECRET) console.warn("Note: JWT_SECRET is only needed when starting the API.");
const db = createDatabase();
const email = "demo@blogcraft.local";
let user = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
if (!user) {
  const hash = bcrypt.hashSync("DemoPass123!", 10);
  const result = db.prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)")
    .run("Demo Author", email, hash);
  user = { id: Number(result.lastInsertRowid) };
}
const existing = db.prepare("SELECT id FROM posts WHERE title = ? AND author_id = ?").get("Getting Started with BlogCraft", user.id);
if (!existing) {
  const result = db.prepare(`
    INSERT INTO posts (author_id, title, slug, excerpt, content, status, published_at)
    VALUES (?, ?, 'pending', ?, ?, 'published', ?)
  `).run(
    user.id,
    "Getting Started with BlogCraft",
    "A sample article demonstrating the BlogCraft REST API.",
    "BlogCraft is a learning project that demonstrates a structured REST API, relational data modelling, authentication, validation, and ownership-based access control. Use this seeded article to test the public post and comment endpoints.",
    new Date().toISOString()
  );
  db.prepare("UPDATE posts SET slug = ? WHERE id = ?").run(makeSlug("Getting Started with BlogCraft", Number(result.lastInsertRowid)), result.lastInsertRowid);
}
console.log("Seed complete.");
console.log("Demo login: demo@blogcraft.local / DemoPass123!");
console.log("Change or remove demo credentials before any public deployment.");
db.close();
