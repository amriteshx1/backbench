import { loadEnv } from "@backbench/config";
import { startHealthServer } from "./health-server.js";

loadEnv();

const PORT = process.env.WORKER_HEALTH_PORT || 4001;

startHealthServer(PORT);