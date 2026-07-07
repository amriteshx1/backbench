type Doc = { id: string; content: string; updatedAt: string };

export function mergeDocument(local: Doc, remote: Doc): Doc {
  // TODO: last-write-wins by updatedAt, prefer remote on tie
  return local;
}

import { Router } from "express";
export const router = Router();
router.post("/sync", (req, res) => {
  const merged = mergeDocument(req.body.local, req.body.remote);
  return res.status(200).json(merged);
});
