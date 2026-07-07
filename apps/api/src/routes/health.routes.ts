import { Router } from "express";
import { getHealth } from "../lib/health.js";

const router = Router();

router.get("/", async (_req, res) => {
  const health = await getHealth();
  const statusCode = health.status === "ok" ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
