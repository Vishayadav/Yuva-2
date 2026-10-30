const slugify = require("slugify");

function makeSlug(title, id) {
  const base = slugify(title, { lower: true, strict: true, trim: true }).slice(0, 120) || "post";
  return `${base}-${id}`;
}

module.exports = { makeSlug };
