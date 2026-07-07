import { Router, type Request, type Response, type NextFunction } from "express";

type Schema = Record<string, "string">;

declare module "express-serve-static-core" {
  interface Request { validatedBody?: Record<string, string>; }
}

export function validateBody(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    // TODO: validate req.body against schema, return 400 with errors or next()
    next();
  };
}

export const router = Router();
router.post("/items", validateBody({ name: "string" }), (req, res) => {
  return res.status(201).json(req.validatedBody);
});
