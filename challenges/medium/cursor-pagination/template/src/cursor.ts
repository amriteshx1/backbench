import { Router } from "express";
const feed = Array.from({ length: 50 }, (_, i) => ({ id: String(i + 1), text: `Item ${i + 1}` }));
export const router = Router();

router.get("/feed", (req, res) => {
  // TODO: decode cursor, slice feed, return nextCursor
  return res.status(200).json({ items: feed.slice(0, 10), nextCursor: null });
});
