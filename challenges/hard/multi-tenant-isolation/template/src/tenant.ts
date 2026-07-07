import { Router, type Request, type Response, type NextFunction } from "express";

declare module "express-serve-static-core" {
  interface Request { tenantId?: string; }
}

const documents = [
  { id: "d1", tenantId: "t1", title: "Doc A" },
  { id: "d2", tenantId: "t2", title: "Doc B" },
];

export function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  // TODO: read X-Tenant-Id, return 400 if missing, set req.tenantId
  next();
}

export function findDocuments(tenantId: string) {
  // TODO: filter documents by tenantId
  return documents;
}

export const router = Router();
router.get("/documents", tenantMiddleware, (req, res) => {
  return res.status(200).json(findDocuments(req.tenantId!));
});
