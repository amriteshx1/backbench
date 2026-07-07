import { Router } from "express";
export const router = Router();

router.post("/contacts", (req, res) => {
  const { name, email } = req.body as { name?: string; email?: string };
  // TODO: validate email format, return 400 if invalid, 201 on success
  return res.status(201).json({ id: "c1", name, email });
});
