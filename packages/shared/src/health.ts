export type HealthStatus = "ok" | "degraded" | "error";

export type HealthResponse = {
  service: string;
  status: HealthStatus;
  timestamp: string;
};