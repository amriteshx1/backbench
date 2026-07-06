import type { SubmissionEvaluationJobPayload } from "@backbench/shared";
import { submissionEvaluationQueue } from "../../lib/queue.js";

export const queueProducer = {
  async enqueueSubmissionEvaluation(payload: SubmissionEvaluationJobPayload) {
    await submissionEvaluationQueue.add("evaluate-submission", payload, {
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: 200,
      removeOnFail: 1000,
    });
  },
};
