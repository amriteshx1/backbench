import path from "node:path";
import { existsSync } from "node:fs";
import { AppError } from "./app-error.js";

const CANDIDATE_PATHS = [
  path.resolve(process.cwd(), "challenges"),
  path.resolve(process.cwd(), "../../challenges"),
];

export function resolveChallengesRoot(): string {
  const found = CANDIDATE_PATHS.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new AppError(500, "Could not locate challenges directory.");
  }
  return found;
}

export function resolvePathWithinChallenges(
  challengesRoot: string,
  relativeTargetPath: string,
): string {
  const absoluteTarget = path.resolve(challengesRoot, relativeTargetPath);
  const normalizedRoot = path.resolve(challengesRoot);

  if (!absoluteTarget.startsWith(normalizedRoot)) {
    throw new AppError(400, "Invalid challenge path.");
  }

  return absoluteTarget;
}
