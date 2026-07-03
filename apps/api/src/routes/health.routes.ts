import { Router } from "express";
import { getHealth } from "../lib/health.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json(getHealth());
});

export default router;