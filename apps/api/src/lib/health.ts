import type { HealthResponse } from "@backbench/shared";

export function getHealth(): HealthResponse {
  return {
    service: "api",
    status: "ok",
    timestamp: new Date().toISOString(),
  };
}