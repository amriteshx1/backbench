import express from "express";
import cors from "cors";

const healthApp = express();

healthApp.use(cors());
healthApp.use(express.json());

healthApp.get("/health", (_req, res) => {
  res.json({
    service: "worker",
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

export function startHealthServer(port: number | string) {
  healthApp.listen(port, () => {
    console.log(`🚀 Worker Health Server running on http://0.0.0.0:${port}`);
  });
}