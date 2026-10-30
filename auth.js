const jwt = require("jsonwebtoken");
const { AppError } = require("../utils/http");

function authenticate(req, _res, next) {
  const header = req.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return next(new AppError(401, "Authentication is required."));
  try {
    req.user = jwt.verify(match[1], process.env.JWT_SECRET);
    next();
  } catch {
    next(new AppError(401, "The access token is invalid or expired."));
  }
}

function optionalAuthenticate(req, _res, next) {
  const header = req.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return next();
  try {
    req.user = jwt.verify(match[1], process.env.JWT_SECRET);
    next();
  } catch {
    next(new AppError(401, "The access token is invalid or expired."));
  }
}

module.exports = { authenticate, optionalAuthenticate };
