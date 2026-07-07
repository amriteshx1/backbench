import { Router } from "express";
type User = { id: string; name: string; deletedAt?: string };
const users: User[] = [{ id: "u1", name: "Ada" }];
export const router = Router();

router.delete("/users/:id", (req, res) => {
  // TODO: set deletedAt instead of removing, return 404 if missing
  return res.status(204).send();
});

router.get("/users", (_req, res) => {
  // TODO: filter out deleted users
  return res.status(200).json(users);
});
