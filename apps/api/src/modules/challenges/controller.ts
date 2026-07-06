import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../lib/app-error.js";
import { challengesService } from "./service.js";
import { challengeListQuerySchema } from "./schema.js";

export const challengesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = challengeListQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new AppError(400, "Invalid challenge query parameters");
      }

      const result = await challengesService.list(parsed.data);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async detail(req: Request, res: Response, next: NextFunction) {
    try {
      const slugParam = req.params.slug;
      if (!slugParam || Array.isArray(slugParam)) {
        throw new AppError(400, "Challenge slug is required");
      }

      const result = await challengesService.detail(slugParam);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async starter(req: Request, res: Response, next: NextFunction) {
    try {
      const slugParam = req.params.slug;
      if (!slugParam || Array.isArray(slugParam)) {
        throw new AppError(400, "Challenge slug is required");
      }

      const result = await challengesService.starterFiles(slugParam);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
