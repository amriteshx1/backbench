import app from "./app.js";
import { loadEnv } from "@backbench/config";

const env = loadEnv();

app.listen(env.API_PORT, env.API_HOST, () => {
  console.log(`API running on http://${env.API_HOST}:${env.API_PORT}`);
});