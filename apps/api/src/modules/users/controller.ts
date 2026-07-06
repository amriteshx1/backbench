import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../lib/app-error.js";
import { usersService } from "./service.js";
import { updateProfileSchema } from "./schema.js";

export const usersController = {
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.authUser) {
        throw new AppError(401, "Unauthorized");
      }

      const result = await usersService.getMe(req.authUser.userId);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.authUser) {
        throw new AppError(401, "Unauthorized");
      }

      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(400, "Invalid profile payload");
      }

      const result = await usersService.updateProfile(req.authUser.userId, parsed.data);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};