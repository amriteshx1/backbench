import { Queue } from "bullmq";
import { loadEnv } from "@backbench/config";
import { SUBMISSION_EVALUATION_QUEUE } from "@backbench/shared";

const env = loadEnv();
const redisUrl = new URL(env.REDIS_URL);

export const submissionEvaluationQueue = new Queue(SUBMISSION_EVALUATION_QUEUE, {
  connection: {
    host: redisUrl.hostname,
    port: Number(redisUrl.port || "6379"),
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined,
    maxRetriesPerRequest: null,
  },
});
