import { Router, type Request, type Response, type NextFunction } from "express";

type AuditEntry = { userId: string; method: string; path: string; timestamp: string };
const auditLog: AuditEntry[] = [];

export function getAuditLog() { return auditLog; }

export function auditMiddleware(req: Request, res: Response, next: NextFunction) {
  // TODO: for mutating methods, push audit entry with req.userId
  next();
}

export const router = Router();
router.post("/orders", auditMiddleware, (_req, res) => res.status(201).json({ id: "o1" }));
