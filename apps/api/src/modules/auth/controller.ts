import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../lib/app-error.js";
import { authService } from "./service.js";
import { loginSchema, signupSchema } from "./schema.js";

export const authController = {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = signupSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(400, "Invalid signup payload");
      }

      const result = await authService.signup(parsed.data);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(400, "Invalid login payload");
      }

      const result = await authService.login(parsed.data);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  logout(_req: Request, res: Response) {
    return res.status(204).send();
  },
};