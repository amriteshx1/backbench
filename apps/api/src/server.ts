import app from "./app.js";
import { createServer } from "node:http";
import { loadEnv } from "@backbench/config";
import { initializeRealtimeServer } from "./modules/realtime/service.js";
import { startWorkerEventsSubscriber } from "./modules/realtime/worker-events-subscriber.js";
import { logger } from "./lib/logger.js";

const env = loadEnv();
const httpServer = createServer(app);
initializeRealtimeServer(httpServer);
startWorkerEventsSubscriber();

httpServer.listen(env.API_PORT, env.API_HOST, () => {
  logger.info("api.started", { host: env.API_HOST, port: env.API_PORT });
});