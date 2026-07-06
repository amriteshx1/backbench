import { Router } from "express";

type User = {
  id: string;
  email: string;
  username: string;
  password: string;
};

const users: User[] = [];
export const usersRouter = Router();

usersRouter.post("/register", (req, res) => {
  const { email, username, password } = req.body as {
    email?: string;
    username?: string;
    password?: string;
  };

  // TODO: Implement the full registration behavior based on challenge README.
  if (!email || !username || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const created = {
    id: crypto.randomUUID(),
    email,
    username,
    password,
  };

  users.push(created);

  return res.status(201).json({
    id: created.id,
    email: created.email,
    username: created.username,
  });
});
