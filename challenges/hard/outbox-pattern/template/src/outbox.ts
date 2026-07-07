type User = { id: string; email: string };
type OutboxEvent = { id: string; type: string; payload: unknown; processed: boolean };

const users: User[] = [];
const outbox: OutboxEvent[] = [];

export function createUserWithOutbox(email: string): User {
  // TODO: atomically add user + UserCreated outbox event
  return { id: "u1", email };
}

import { Router } from "express";
export const router = Router();
router.post("/users", (req, res) => {
  const user = createUserWithOutbox(req.body.email);
  return res.status(201).json(user);
});
