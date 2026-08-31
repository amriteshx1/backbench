import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import meRoutes from "./routes/users.routes.js";
import challengeRoutes from "./routes/challenges.routes.js";
import submissionRoutes from "./routes/submissions.routes.js";
import { AppError } from "./lib/app-error.js";
import { logger } from "./lib/logger.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    logger.info("request.completed", {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });
  next();
});

app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/me", meRoutes);
app.use("/challenges", challengeRoutes);
app.use("/", submissionRoutes);

app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error("request.error", {
        method: req.method,
        path: req.path,
        statusCode: err.statusCode,
        message: err.message,
      });
    }
    return res.status(err.statusCode).json({ message: err.message });
  }

  logger.error("request.unhandled_error", {
    method: req.method,
    path: req.path,
    message: err instanceof Error ? err.message : "Unknown error",
  });
  return res.status(500).json({ message: "Internal server error" });
});

export default app;
