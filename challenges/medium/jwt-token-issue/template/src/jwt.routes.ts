import { Router } from "express";
import jwt from "jsonwebtoken";
export const router = Router();

router.post("/token", (req, res) => {
  const { userId } = req.body as { userId?: string };
  // TODO: sign JWT with secret backbench-secret, expiresIn 1h
  return res.status(200).json({ accessToken: "placeholder" });
});
