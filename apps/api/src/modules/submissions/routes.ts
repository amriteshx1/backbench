import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { submissionsController } from "./controller.js";

const router = Router();

router.post("/challenges/:slug/submissions", requireAuth, submissionsController.create);
router.get("/submissions/:id", requireAuth, submissionsController.detail);
router.get("/submissions/:id/logs", requireAuth, submissionsController.logs);

export default router;
