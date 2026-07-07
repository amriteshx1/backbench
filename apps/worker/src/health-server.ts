import { createServer } from "node:http";
import { Redis } from "ioredis";
import { loadEnv } from "@backbench/config";
import { prisma } from "@backbench/db";
import type { HealthResponse } from "@backbench/shared";
import { logger } from "./lib/logger.js";

const env = loadEnv();
const redisUrl = new URL(env.REDIS_URL);

const healthRedis = new Redis({
  host: redisUrl.hostname,
  port: Number(redisUrl.port || "6379"),
  username: redisUrl.username || undefined,
  password: redisUrl.password || undefined,
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

async function checkDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

async function checkRedis(): Promise<boolean> {
  try {
    if (healthRedis.status === "wait" || healthRedis.status === "end") {
      await healthRedis.connect();
    }
    const result = await healthRedis.ping();
    return result === "PONG";
  } catch {
    return false;
  }
}

async function buildHealth(): Promise<HealthResponse> {
  const [databaseOk, redisOk] = await Promise.all([checkDatabase(), checkRedis()]);
  const status = databaseOk && redisOk ? "ok" : "degraded";

  return {
    service: "worker",
    status,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    dependencies: {
      database: databaseOk ? "ok" : "error",
      redis: redisOk ? "ok" : "error",
    },
  };
}

export function startHealthServer(port: number | string) {
  const server = createServer((req, res) => {
    if (req.url !== "/health") {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Not found" }));
      return;
    }

    void buildHealth().then((health) => {
      const statusCode = health.status === "ok" ? 200 : 503;
      res.writeHead(statusCode, { "Content-Type": "application/json" });
      res.end(JSON.stringify(health));
    });
  });

  server.listen(port, () => {
    logger.info("worker.health_server_started", { port });
  });
}
