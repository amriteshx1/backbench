import { Router } from "express";
import crypto from "node:crypto";

export const router = Router();

router.post("/webhooks", (req, res) => {
  const signature = req.header("X-Signature");
  // TODO: compute HMAC-SHA256 of JSON body, compare, return 401 or 200
  return res.status(200).json({ received: true });
});
