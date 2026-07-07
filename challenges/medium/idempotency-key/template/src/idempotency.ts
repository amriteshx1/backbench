import { Router } from "express";
const store = new Map<string, unknown>();

export const router = Router();

router.post("/payments", (req, res) => {
  const key = req.header("Idempotency-Key");
  // TODO: return cached response if key exists, else create and cache
  return res.status(201).json({ id: "pay_1", amount: 100 });
});
