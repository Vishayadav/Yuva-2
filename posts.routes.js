const express = require("express");
const { validate } = require("../middleware/validate");
const { authenticate, optionalAuthenticate } = require("../middleware/auth");
const { createPostSchema, updatePostSchema, paginationSchema } = require("../validation");
const { AppError } = require("../utils/http");
const { makeSlug } = require("../utils/slug");

function postRoutes(db) {
  const router = express.Router();

  router.get("/", validate(paginationSchema, "query"), (req, res) => {
    const { page, limit, q } = req.query;
    const offset = (page - 1) * limit;
    const search = q ? `%${q}%` : null;
    const where = search
      ? "WHERE p.status = 'published' AND (p.title LIKE ? OR p.excerpt LIKE ? OR p.content LIKE ?)"
      : "WHERE p.status = 'published'";
    const params = search ? [search, search, search] : [];
    const total = db.prepare(`SELECT COUNT(*) AS count FROM posts p ${where}`).get(...params).count;
    const rows = db.prepare(`
      SELECT p.id, p.title, p.slug, p.excerpt, p.status, p.created_at AS createdAt,
             p.published_at AS publishedAt, u.id AS authorId, u.name AS authorName
      FROM posts p JOIN users u ON u.id = p.author_id
      ${where} ORDER BY p.published_at DESC, p.id DESC LIMIT ? OFFSET ?
    `).all(...params, limit, offset);
    res.json({
      success: true, data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  });

  router.get("/mine", authenticate, (req, res) => {
    const rows = db.prepare(`
      SELECT id, title, slug, excerpt, content, status,
             created_at AS createdAt, updated_at AS updatedAt, published_at AS publishedAt
      FROM posts WHERE author_id = ? ORDER BY updated_at DESC
    `).all(req.user.id);
    res.json({ success: true, data: rows });
  });

  router.get("/:slug", optionalAuthenticate, (req, res, next) => {
    const post = db.prepare(`
      SELECT p.id, p.title, p.slug, p.excerpt, p.content, p.status,
             p.created_at AS createdAt, p.updated_at AS updatedAt,
             p.published_at AS publishedAt, u.id AS authorId, u.name AS authorName
      FROM posts p JOIN users u ON u.id = p.author_id WHERE p.slug = ?
    `).get(req.params.slug);
    if (!post) return next(new AppError(404, "Post not found."));
    if (post.status !== "published" && (!req.user || req.user.id !== post.authorId)) {
      return next(new AppError(404, "Post not found."));
    }
    res.json({ success: true, data: post });
  });

  router.post("/", authenticate, validate(createPostSchema), (req, res) => {
    const { title, excerpt, content, status } = req.body;
    const publishedAt = status === "published" ? new Date().toISOString() : null;
    const result = db.prepare(`
      INSERT INTO posts (author_id, title, slug, excerpt, content, status, published_at)
      VALUES (?, ?, 'pending-' || lower(hex(randomblob(8))), ?, ?, ?, ?)
    `).run(req.user.id, title, excerpt, content, status, publishedAt);
    const slug = makeSlug(title, Number(result.lastInsertRowid));
    db.prepare("UPDATE posts SET slug = ? WHERE id = ?").run(slug, result.lastInsertRowid);
    const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json({ success: true, message: "Post created.", data: post });
  });

  router.patch("/:id", authenticate, validate(updatePostSchema), (req, res, next) => {
    const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(Number(req.params.id));
    if (!post) return next(new AppError(404, "Post not found."));
    if (post.author_id !== req.user.id) return next(new AppError(403, "You are not allowed to edit this post."));
    const updated = { ...post, ...req.body };
    const slug = req.body.title ? makeSlug(req.body.title, post.id) : post.slug;
    const publishedAt = updated.status === "published"
      ? (post.published_at || new Date().toISOString()) : null;
    db.prepare(`
      UPDATE posts SET title = ?, slug = ?, excerpt = ?, content = ?, status = ?,
      published_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(updated.title, slug, updated.excerpt, updated.content, updated.status, publishedAt, post.id);
    res.json({ success: true, message: "Post updated.", data: db.prepare("SELECT * FROM posts WHERE id = ?").get(post.id) });
  });

  router.delete("/:id", authenticate, (req, res, next) => {
    const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(Number(req.params.id));
    if (!post) return next(new AppError(404, "Post not found."));
    if (post.author_id !== req.user.id) return next(new AppError(403, "You are not allowed to delete this post."));
    db.prepare("DELETE FROM posts WHERE id = ?").run(post.id);
    res.json({ success: true, message: "Post deleted." });
  });

  return router;
}

module.exports = postRoutes;
