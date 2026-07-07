import { Router } from "express";
const posts = Array.from({ length: 25 }, (_, i) => ({ id: String(i + 1), title: `Post ${i + 1}` }));
export const router = Router();

router.get("/posts", (req, res) => {
  // TODO: parse page/limit, slice posts, return paginated response
  return res.status(200).json({ items: posts, total: posts.length });
});
