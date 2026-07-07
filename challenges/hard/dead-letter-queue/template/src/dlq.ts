type Job = { id: string; payload: unknown };
const deadLetterQueue: Job[] = [];

export class JobProcessor {
  async process(job: Job, handler: (j: Job) => Promise<void>): Promise<{ dlq: boolean }> {
    // TODO: retry handler, push to deadLetterQueue on failure after 3 attempts
    return { dlq: false };
  }
}

import { Router } from "express";
export const router = Router();
const processor = new JobProcessor();
router.post("/jobs", async (req, res) => {
  const result = await processor.process(req.body, async () => { throw new Error("fail"); });
  return res.status(200).json(result);
});
