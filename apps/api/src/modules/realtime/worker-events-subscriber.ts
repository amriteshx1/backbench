import { Redis } from "ioredis";
import { loadEnv } from "@backbench/config";
import {
  SUBMISSION_EVENTS_CHANNEL,
  type SubmissionRealtimeEvent,
} from "@backbench/shared";
import { emitSubmissionRealtimeEvent } from "./service.js";

const env = loadEnv();
let workerEventsSubscriberStarted = false;

export function startWorkerEventsSubscriber(): void {
  if (workerEventsSubscriberStarted) return;
  workerEventsSubscriberStarted = true;

  const redisUrl = new URL(env.REDIS_URL);
  const subscriber = new Redis({
    host: redisUrl.hostname,
    port: Number(redisUrl.port || "6379"),
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined,
    maxRetriesPerRequest: null,
  });

  subscriber.subscribe(SUBMISSION_EVENTS_CHANNEL).catch((error) => {
    console.error("Realtime subscriber failed to subscribe:", error);
  });

  subscriber.on("message", (channel, message) => {
    if (channel !== SUBMISSION_EVENTS_CHANNEL) return;

    try {
      const event = JSON.parse(message) as SubmissionRealtimeEvent;
      emitSubmissionRealtimeEvent(event);
    } catch (error) {
      console.error("Failed to parse worker realtime event:", error);
    }
  });
}
