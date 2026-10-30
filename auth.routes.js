const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validate } = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../validation");
const { AppError } = require("../utils/http");

function authRoutes(db) {
  const router = express.Router();

  router.post("/register", validate(registerSchema), (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const hash = bcrypt.hashSync(password, Number(process.env.BCRYPT_ROUNDS) || 12);
      const result = db.prepare(
        "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)"
      ).run(name, email.toLowerCase(), hash);
      const user = db.prepare(
        "SELECT id, name, email, role, created_at AS createdAt FROM users WHERE id = ?"
      ).get(result.lastInsertRowid);
      res.status(201).json({ success: true, message: "Registration successful.", data: { user } });
    } catch (err) {
      if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return res.status(409).json({ success: false, error: { code: "EMAIL_EXISTS", message: "This email is already registered." } });
      }
      next(err);
    }
  });

  router.post("/login", validate(loginSchema), (req, res, next) => {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(req.body.email.toLowerCase());
    if (!user || !bcrypt.compareSync(req.body.password, user.password_hash)) {
      return next(new AppError(401, "Email or password is incorrect."));
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
    );
    res.json({
      success: true,
      message: "Login successful.",
      data: {
        token,
        tokenType: "Bearer",
        expiresIn: process.env.JWT_EXPIRES_IN || "2h",
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      }
    });
  });

  return router;
}

module.exports = authRoutes;
