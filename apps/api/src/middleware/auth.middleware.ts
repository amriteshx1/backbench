import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt.js";
import { AppError } from "../lib/app-error.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, "Missing or invalid Authorization header"));
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    req.authUser = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError(401, "Invalid or expired token"));
  }
}