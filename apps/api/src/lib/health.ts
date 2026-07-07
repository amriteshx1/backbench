import { prisma } from "@backbench/db";
import type { HealthResponse } from "@backbench/shared";
import { pingRedis } from "./redis.js";

async function checkDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function getHealth(): Promise<HealthResponse> {
  const [databaseOk, redisOk] = await Promise.all([checkDatabase(), pingRedis()]);
  const status = databaseOk && redisOk ? "ok" : "degraded";

  return {
    service: "api",
    status,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    dependencies: {
      database: databaseOk ? "ok" : "error",
      redis: redisOk ? "ok" : "error",
    },
  };
}
