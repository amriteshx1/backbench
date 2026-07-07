type State = "CLOSED" | "OPEN" | "HALF_OPEN";

export class CircuitBreaker {
  private state: State = "CLOSED";
  private failures = 0;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // TODO: implement state machine, throw when OPEN, track failures
    return fn();
  }

  getState(): State { return this.state; }
}

import { Router } from "express";
export const router = Router();
const breaker = new CircuitBreaker();
router.get("/upstream", async (_req, res) => {
  try {
    const data = await breaker.execute(async () => ({ ok: true }));
    return res.status(200).json(data);
  } catch { return res.status(503).json({ message: "Circuit open" }); }
});
