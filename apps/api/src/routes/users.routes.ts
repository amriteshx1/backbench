import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { usersController } from "../controllers/users.controller.js";

const router = Router();

router.get("/", requireAuth, usersController.me);
router.patch("/profile", requireAuth, usersController.updateProfile);

export default router;