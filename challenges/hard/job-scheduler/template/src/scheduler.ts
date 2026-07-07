type Job = { id: string; run: () => void };
const pending: Job[] = [];

export class Scheduler {
  schedule(job: Job, delayMs: number): void {
    // TODO: push to pending, setTimeout to run and remove from pending
  }

  pendingCount(): number {
    return pending.length;
  }
}

import { Router } from "express";
export const router = Router();
const scheduler = new Scheduler();
router.post("/schedule", (req, res) => {
  scheduler.schedule({ id: "j1", run: () => {} }, req.body.delayMs ?? 1000);
  return res.status(202).json({ pending: scheduler.pendingCount() });
});
