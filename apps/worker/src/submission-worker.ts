import { Worker } from "bullmq";
import { loadEnv } from "@backbench/config";
import { Prisma, prisma, SubmissionStatus } from "@backbench/db";
import {
  SUBMISSION_EVALUATION_QUEUE,
  type SubmissionEvaluationJobPayload,
} from "@backbench/shared";
import { ensureRunnerImage, runDockerEvaluation } from "./services/docker-runner.js";
import { collectLogs } from "./services/log-collector.js";
import { parseEvaluationResultFromStdout } from "./services/result-parser.js";
import { prepareWorkspaceForEvaluation } from "./services/template-resolver.js";

const env = loadEnv();
const redisUrl = new URL(env.REDIS_URL);

async function processSubmissionJob(payload: SubmissionEvaluationJobPayload) {
  const submission = await prisma.submission.findUnique({
    where: { id: payload.submissionId },
    include: {
      files: {
        select: {
          path: true,
          content: true,
        },
        orderBy: { path: "asc" },
      },
      challenge: {
        select: {
          id: true,
          slug: true,
          templateKey: true,
          testKey: true,
        },
      },
    },
  });

  if (!submission) {
    throw new Error(`Submission ${payload.submissionId} not found`);
  }

  await prisma.submission.update({
    where: { id: submission.id },
    data: {
      status: SubmissionStatus.RUNNING,
      startedAt: new Date(),
      errorType: null,
      errorMessage: null,
    },
  });

  const workspace = await prepareWorkspaceForEvaluation({
    submission,
    challenge: submission.challenge,
    files: submission.files,
  });

  try {
    const dockerResult = await runDockerEvaluation(workspace.workspaceDir);
    const logs = collectLogs({
      stdout: dockerResult.stdout,
      stderr: dockerResult.stderr,
    });

    const parsed = parseEvaluationResultFromStdout(logs.stdout);
    const timedOut = dockerResult.timedOut;

    const finalized =
      timedOut
        ? {
            status: SubmissionStatus.TIMEOUT,
            score: 0,
            passedTests: 0,
            totalTests: 0,
            errorType: "EXECUTION_TIMEOUT",
            errorMessage: "Execution exceeded worker timeout.",
            testResultsJson: null,
            durationMs: null,
            memoryMb: null,
          }
        : parsed
          ? parsed
          : dockerResult.exitCode === 0
            ? {
                status: SubmissionStatus.ERROR,
                score: 0,
                passedTests: 0,
                totalTests: 0,
                errorType: "RESULT_PARSE_ERROR",
                errorMessage: "Could not parse hidden-test result payload.",
                testResultsJson: null,
                durationMs: null,
                memoryMb: null,
              }
            : {
                status: SubmissionStatus.ERROR,
                score: 0,
                passedTests: 0,
                totalTests: 0,
                errorType: "DOCKER_EXECUTION_FAILED",
                errorMessage: logs.stderr || "Docker execution failed.",
                testResultsJson: null,
                durationMs: null,
                memoryMb: null,
              };

    const testResultsJsonValue =
      finalized.testResultsJson === null
        ? Prisma.JsonNull
        : (finalized.testResultsJson as Prisma.InputJsonValue);

    await prisma.$transaction(async (tx) => {
      await tx.submission.update({
        where: { id: submission.id },
        data: {
          status: finalized.status,
          score: finalized.score,
          passedTests: finalized.passedTests,
          totalTests: finalized.totalTests,
          errorType: finalized.errorType,
          errorMessage: finalized.errorMessage,
          completedAt: new Date(),
        },
      });

      await tx.submissionResult.upsert({
        where: { submissionId: submission.id },
        update: {
          stdout: logs.stdout,
          stderr: logs.stderr,
          testResultsJson: testResultsJsonValue,
          durationMs: finalized.durationMs,
          memoryMb: finalized.memoryMb,
        },
        create: {
          submissionId: submission.id,
          stdout: logs.stdout,
          stderr: logs.stderr,
          testResultsJson: testResultsJsonValue,
          durationMs: finalized.durationMs,
          memoryMb: finalized.memoryMb,
        },
      });
    });
  } finally {
    await workspace.cleanup();
  }
}

export function startSubmissionWorker() {
  ensureRunnerImage().catch((error) => {
    console.error("Failed to ensure runner image:", error);
  });

  const worker = new Worker(
    SUBMISSION_EVALUATION_QUEUE,
    async (job) => {
      const payload = job.data as SubmissionEvaluationJobPayload;
      await processSubmissionJob(payload);
    },
    {
      connection: {
        host: redisUrl.hostname,
        port: Number(redisUrl.port || "6379"),
        username: redisUrl.username || undefined,
        password: redisUrl.password || undefined,
        maxRetriesPerRequest: null,
      },
      concurrency: 2,
    },
  );

  worker.on("completed", (job) => {
    console.log(`Submission worker completed job ${job.id}`);
  });

  worker.on("failed", async (job, error) => {
    console.error(`Submission worker failed job ${job?.id}:`, error);
    const payload = job?.data as SubmissionEvaluationJobPayload | undefined;
    if (!payload?.submissionId) return;

    await prisma.submission.update({
      where: { id: payload.submissionId },
      data: {
        status: SubmissionStatus.ERROR,
        errorType: "WORKER_RUNTIME_ERROR",
        errorMessage: error.message,
        completedAt: new Date(),
      },
    });
  });

  return worker;
}
