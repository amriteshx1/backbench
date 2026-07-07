import { Router } from "express";
export const router = Router();

router.post("/register", (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  // TODO: enforce password.length >= 8, return 400 or 201
  return res.status(201).json({ id: "1", email });
});
