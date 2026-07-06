import { loadEnv } from "@backbench/config";
import { startHealthServer } from "./health-server.js";
import { startSubmissionWorker } from "./submission-worker.js";

const env = loadEnv();

const PORT = env.WORKER_HEALTH_PORT;

startHealthServer(PORT);
startSubmissionWorker();