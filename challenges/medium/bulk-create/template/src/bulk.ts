import { Router } from "express";
export const router = Router();

router.post("/items/bulk", (req, res) => {
  const { items } = req.body as { items?: Array<{ name?: string }> };
  // TODO: validate all items have name, return 400 or 201 with count
  return res.status(201).json({ created: 0 });
});
