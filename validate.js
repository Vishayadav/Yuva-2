function validate(schema, source = "body") {
  return (req, res, next) => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "The request contains invalid data.",
          details: parsed.error.issues.map(issue => ({
            field: issue.path.join("."),
            message: issue.message
          }))
        }
      });
    }
    req[source] = parsed.data;
    next();
  };
}

module.exports = { validate };
