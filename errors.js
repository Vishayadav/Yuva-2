const { AppError } = require("../utils/http");

function notFound(req, _res, next) {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} was not found.`));
}

function errorHandler(err, _req, res, _next) {
  if (err && err.code === "SQLITE_CONSTRAINT_UNIQUE") {
    return res.status(409).json({
      success: false,
      error: { code: "DUPLICATE_RESOURCE", message: "A resource with the same unique value already exists." }
    });
  }
  const status = err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    success: false,
    error: {
      code: err.code || (status === 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_ERROR"),
      message: status === 500 ? "An unexpected server error occurred." : err.message,
      ...(err.details ? { details: err.details } : {})
    }
  });
}

module.exports = { notFound, errorHandler };
