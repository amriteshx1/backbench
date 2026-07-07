export type HealthStatus = "ok" | "degraded" | "error";

export type DependencyStatus = "ok" | "error";

export type HealthResponse = {
  service: string;
  status: HealthStatus;
  timestamp: string;
  uptimeSeconds?: number;
  dependencies?: Record<string, DependencyStatus>;
};
