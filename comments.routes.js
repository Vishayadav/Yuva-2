const express = require("express");
const { validate } = require("../middleware/validate");
const { authenticate } = require("../middleware/auth");
const { createCommentSchema, updateCommentSchema } = require("../validation");
const { AppError } = require("../utils/http");

function commentRoutes(db) {
  const router = express.Router();

  router.get("/posts/:postId/comments", (req, res, next) => {
    const post = db.prepare("SELECT id, status FROM posts WHERE id = ?").get(Number(req.params.postId));
    if (!post || post.status !== "published") return next(new AppError(404, "Post not found."));
    const comments = db.prepare(`
      SELECT c.id, c.post_id AS postId, c.content, c.created_at AS createdAt,
             c.updated_at AS updatedAt, u.id AS authorId, u.name AS authorName
      FROM comments c JOIN users u ON u.id = c.author_id
      WHERE c.post_id = ? ORDER BY c.created_at ASC, c.id ASC
    `).all(post.id);
    res.json({ success: true, data: comments });
  });

  router.post("/posts/:postId/comments", authenticate, validate(createCommentSchema), (req, res, next) => {
    const post = db.prepare("SELECT id, status FROM posts WHERE id = ?").get(Number(req.params.postId));
    if (!post || post.status !== "published") return next(new AppError(404, "Published post not found."));
    const result = db.prepare(
      "INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)"
    ).run(post.id, req.user.id, req.body.content);
    const comment = db.prepare("SELECT * FROM comments WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json({ success: true, message: "Comment added.", data: comment });
  });

  router.patch("/:id", authenticate, validate(updateCommentSchema), (req, res, next) => {
    const comment = db.prepare("SELECT * FROM comments WHERE id = ?").get(Number(req.params.id));
    if (!comment) return next(new AppError(404, "Comment not found."));
    if (comment.author_id !== req.user.id) return next(new AppError(403, "You are not allowed to edit this comment."));
    db.prepare("UPDATE comments SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(req.body.content, comment.id);
    res.json({ success: true, message: "Comment updated.", data: db.prepare("SELECT * FROM comments WHERE id = ?").get(comment.id) });
  });

  router.delete("/:id", authenticate, (req, res, next) => {
    const comment = db.prepare("SELECT * FROM comments WHERE id = ?").get(Number(req.params.id));
    if (!comment) return next(new AppError(404, "Comment not found."));
    if (comment.author_id !== req.user.id) return next(new AppError(403, "You are not allowed to delete this comment."));
    db.prepare("DELETE FROM comments WHERE id = ?").run(comment.id);
    res.json({ success: true, message: "Comment deleted." });
  });

  return router;
}

module.exports = commentRoutes;
