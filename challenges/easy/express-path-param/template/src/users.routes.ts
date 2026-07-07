import { Router } from "express";
const users = [{ id: "u1", name: "Ada" }, { id: "u2", name: "Grace" }];
export const router = Router();

router.get("/users/:id", (req, res) => {
  // TODO: find user by req.params.id, return 404 if missing
  return res.status(200).json(users[0]);
});
