import { Router } from "express";
const records = [{ id: "r1", data: "hello", version: 1 }];
export const router = Router();

router.put("/records/:id", (req, res) => {
  const ifMatch = req.header("If-Match");
  // TODO: compare version, return 409 on mismatch, increment on success
  return res.status(200).json(records[0]);
});
