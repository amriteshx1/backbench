import { Router } from "express";
const tasks = [{ id: "t1", title: "Write tests" }];
export const router = Router();

router.delete("/tasks/:id", (req, res) => {
  // TODO: remove task or return 404, return 204 on success
  return res.status(200).json({ deleted: true });
});
