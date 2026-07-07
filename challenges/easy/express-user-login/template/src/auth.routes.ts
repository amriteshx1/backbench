import { Router } from "express";

type User = { email: string; password: string };
const users: User[] = [{ email: "demo@backbench.dev", password: "secret123" }];
export const router = Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  // TODO: validate input, check credentials, return 401 or 200 with token
  return res.status(200).json({ token: "placeholder" });
});
