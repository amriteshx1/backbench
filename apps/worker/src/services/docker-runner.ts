import { spawn } from "node:child_process";
import { resolveRunnerContextDir } from "../lib/paths.js";

const RUNNER_IMAGE = "backbench-node-runner";
const RUN_TIMEOUT_MS = 15_000;

type CommandResult = {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
};

function runCommand(args: string[], options?: { cwd?: string; timeoutMs?: number }): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn("docker", args, {
      cwd: options?.cwd,
      shell: false,
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, options?.timeoutMs ?? 60_000);

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on("close", (exitCode) => {
      clearTimeout(timeout);
      resolve({ exitCode, stdout, stderr, timedOut });
    });
  });
}

export async function ensureRunnerImage(): Promise<void> {
  const inspect = await runCommand(["image", "inspect", RUNNER_IMAGE], {
    timeoutMs: 15_000,
  });

  if (inspect.exitCode === 0) return;

  const contextDir = resolveRunnerContextDir();
  const build = await runCommand(
    ["build", "-t", RUNNER_IMAGE, "."],
    { cwd: contextDir, timeoutMs: 120_000 },
  );

  if (build.exitCode !== 0) {
    throw new Error(`Runner image build failed: ${build.stderr || build.stdout}`);
  }
}

export async function runDockerEvaluation(workspaceDir: string): Promise<CommandResult> {
  const result = await runCommand(
    [
      "run",
      "--rm",
      "--network",
      "none",
      "--cpus",
      "1",
      "--memory",
      "512m",
      "--pids-limit",
      "128",
      "--workdir",
      "/workspace",
      "-v",
      `${workspaceDir}:/workspace`,
      RUNNER_IMAGE,
      "node",
      "hidden-tests/evaluate.mjs",
    ],
    { timeoutMs: RUN_TIMEOUT_MS },
  );

  return result;
}
