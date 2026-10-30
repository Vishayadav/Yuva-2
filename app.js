const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { createDatabase } = require("./config/database");
const authRoutes = require("./routes/auth.routes");
const postRoutes = require("./routes/posts.routes");
const commentRoutes = require("./routes/comments.routes");
const { notFound, errorHandler } = require("./middleware/errors");

function createApp(options = {}) {
  const db = options.db || createDatabase(options.dbFile);
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));
  app.use(express.json({ limit: "100kb" }));
  app.use(morgan(process.env.NODE_ENV === "test" ? "tiny" : "combined"));

  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false });
  app.use("/api/auth", authLimiter);

  app.get("/api/health", (_req, res) => {
    res.json({ success: true, data: { status: "healthy", service: "BlogCraft API", timestamp: new Date().toISOString() } });
  });
  app.use("/api/auth", authRoutes(db));
  app.use("/api/posts", postRoutes(db));
  app.use("/api", commentRoutes(db));

  app.use(notFound);
  app.use(errorHandler);
  app.locals.db = db;
  return app;
}

module.exports = { createApp };
