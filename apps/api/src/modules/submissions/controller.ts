import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../lib/app-error.js";
import { createSubmissionSchema } from "./schema.js";
import { submissionsService } from "./service.js";

function getAuthenticatedUserId(req: Request): string {
  if (!req.authUser?.userId) {
    throw new AppError(401, "Unauthorized");
  }
  return req.authUser.userId;
}

export const submissionsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getAuthenticatedUserId(req);
      const slugParam = req.params.slug;
      if (!slugParam || Array.isArray(slugParam)) {
        throw new AppError(400, "Challenge slug is required");
      }

      const parsed = createSubmissionSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(400, "Invalid submission payload");
      }

      const result = await submissionsService.create(userId, slugParam, parsed.data);
      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async detail(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getAuthenticatedUserId(req);
      const submissionIdParam = req.params.id;
      if (!submissionIdParam || Array.isArray(submissionIdParam)) {
        throw new AppError(400, "Submission id is required");
      }

      const result = await submissionsService.detail(userId, submissionIdParam);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async logs(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getAuthenticatedUserId(req);
      const submissionIdParam = req.params.id;
      if (!submissionIdParam || Array.isArray(submissionIdParam)) {
        throw new AppError(400, "Submission id is required");
      }

      const result = await submissionsService.logs(userId, submissionIdParam);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
