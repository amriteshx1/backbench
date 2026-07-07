import { Router } from "express";
export const router = Router();

router.get("/health", (_req, res) => {
  // TODO: return status ok and uptimeSeconds from process.uptime()
  return res.status(500).json({ status: "broken" });
});
