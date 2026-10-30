const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72)
});
const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(72)
});
const createPostSchema = z.object({
  title: z.string().trim().min(5).max(160),
  excerpt: z.string().trim().min(1).max(300),
  content: z.string().trim().min(20).max(20000),
  status: z.enum(["draft", "published"]).optional().default("draft")
});
const updatePostSchema = z.object({
  title: z.string().trim().min(5).max(160).optional(),
  excerpt: z.string().trim().min(1).max(300).optional(),
  content: z.string().trim().min(20).max(20000).optional(),
  status: z.enum(["draft", "published"]).optional()
}).refine(value => Object.keys(value).length > 0, "At least one field must be provided.");
const createCommentSchema = z.object({
  content: z.string().trim().min(2).max(2000)
});
const updateCommentSchema = createCommentSchema;
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  q: z.string().trim().max(100).optional()
});

module.exports = {
  registerSchema, loginSchema, createPostSchema, updatePostSchema,
  createCommentSchema, updateCommentSchema, paginationSchema
};
