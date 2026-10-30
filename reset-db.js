require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const file = process.env.DB_FILE || "./database/blogcraft.sqlite";
if (file === ":memory:") {
  console.log("In-memory database requires no reset.");
  process.exit(0);
}
const absolute = path.resolve(file);
for (const suffix of ["", "-shm", "-wal"]) {
  if (fs.existsSync(absolute + suffix)) fs.unlinkSync(absolute + suffix);
}
console.log("Database removed. It will be recreated on next application start.");
