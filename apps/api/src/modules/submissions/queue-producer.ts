import type { SubmissionEvaluationJobPayload } from "@backbench/shared";
import { submissionEvaluationQueue } from "../../lib/queue.js";
import { logger } from "../../lib/logger.js";

export const queueProducer = {
  async enqueueSubmissionEvaluation(payload: SubmissionEvaluationJobPayload) {
    const job = await submissionEvaluationQueue.add("evaluate-submission", payload, {
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: 200,
      removeOnFail: 1000,
    });

    logger.info("queue.submission_enqueued", {
      jobId: job.id,
      submissionId: payload.submissionId,
      challengeId: payload.challengeId,
    });
  },
};
