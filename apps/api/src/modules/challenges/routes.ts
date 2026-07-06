import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { challengesController } from "./controller.js";

const router = Router();

router.get("/", requireAuth, challengesController.list);
router.get("/:slug", requireAuth, challengesController.detail);
router.get("/:slug/starter", requireAuth, challengesController.starter);

export default router;
