require("dotenv").config();
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be set in .env and contain at least 32 characters.");
}
const { createApp } = require("./app");
const app = createApp();
const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, () => {
  console.log(`BlogCraft API is running at http://localhost:${port}`);
});

function shutdown() {
  server.close(() => {
    app.locals.db.close();
    process.exit(0);
  });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
