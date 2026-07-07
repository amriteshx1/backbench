import { existsSync } from "node:fs";
import path from "node:path";

const CHALLENGES_ROOT_CANDIDATES = [
  path.resolve(process.cwd(), "challenges"),
  path.resolve(process.cwd(), "../../challenges"),
];

const RUNNER_CONTEXT_CANDIDATES = [
  path.resolve(process.cwd(), "docker/runner-images/node"),
  path.resolve(process.cwd(), "../../docker/runner-images/node"),
];

export function resolveChallengesRoot(): string {
  const found = CHALLENGES_ROOT_CANDIDATES.find((candidate) =>
    existsSync(candidate),
  );
  if (!found) {
    throw new Error("Worker could not locate challenges directory.");
  }
  return found;
}

export function resolveRunnerContextDir(): string {
  const found = RUNNER_CONTEXT_CANDIDATES.find((candidate) =>
    existsSync(candidate),
  );
  if (!found) {
    throw new Error("Worker could not locate runner image directory.");
  }
  return found;
}

export function resolvePathWithinRoot(
  rootDir: string,
  relativePath: string,
): string {
  const absoluteTarget = path.resolve(rootDir, relativePath);
  const normalizedRoot = path.resolve(rootDir);
  if (!absoluteTarget.startsWith(normalizedRoot)) {
    throw new Error("Resolved path escaped root directory.");
  }
  return absoluteTarget;
}
