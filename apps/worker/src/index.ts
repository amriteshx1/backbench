import { loadEnv } from "@backbench/config";
import { startHealthServer } from "./health-server.js";
import { startSubmissionWorker } from "./worker/submission-worker.js";
import { logger } from "./lib/logger.js";

const env = loadEnv();

const PORT = env.WORKER_HEALTH_PORT;

startHealthServer(PORT);
startSubmissionWorker();

logger.info("worker.started", { healthPort: PORT });
