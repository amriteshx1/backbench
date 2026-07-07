type Target = "primary" | "replica";

export class QueryRouter {
  lastTarget: Target | null = null;

  execute(sql: string): { target: Target; sql: string } {
    // TODO: route SELECT to replica, writes to primary
    return { target: "primary", sql };
  }
}

import { Router } from "express";
export const router = Router();
const queryRouter = new QueryRouter();
router.post("/query", (req, res) => {
  const result = queryRouter.execute(req.body.sql);
  return res.status(200).json(result);
});
