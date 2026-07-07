import { Redis } from "ioredis";
import { loadEnv } from "@backbench/config";

const env = loadEnv();
const redisUrl = new URL(env.REDIS_URL);

export const redisClient = new Redis({
  host: redisUrl.hostname,
  port: Number(redisUrl.port || "6379"),
  username: redisUrl.username || undefined,
  password: redisUrl.password || undefined,
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

export async function pingRedis(): Promise<boolean> {
  try {
    if (redisClient.status === "wait" || redisClient.status === "end") {
      await redisClient.connect();
    }
    const result = await redisClient.ping();
    return result === "PONG";
  } catch {
    return false;
  }
}
