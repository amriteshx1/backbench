import "dotenv/config";
import { envSchema } from "./schema.js";

export function loadEnv() {
  return envSchema.parse(process.env);
}

export * from "./schema.js";