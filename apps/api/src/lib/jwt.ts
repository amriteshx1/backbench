import jwt, { type SignOptions } from "jsonwebtoken";
import { loadEnv } from "@backbench/config";
import type { AuthUser } from "@backbench/shared";

const env = loadEnv();
const jwtExpiresIn = env.JWT_EXPIRES_IN as SignOptions["expiresIn"];

export function signAccessToken(user: AuthUser): string {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: jwtExpiresIn });
}

export function verifyAccessToken(token: string): AuthUser {
  return jwt.verify(token, env.JWT_SECRET) as AuthUser;
}