import { Worker } from "bullmq";
import { loadEnv } from "@backbench/config";
import { prisma, SubmissionStatus } from "@backbench/db";
import {
  SUBMISSION_EVALUATION_QUEUE,
  type SubmissionEvaluationJobPayload,
} from "@backbench/shared";

const env = loadEnv();
const redisUrl = new URL(env.REDIS_URL);

function nowIso(): string {
  return new Date().toISOString();
}

function evaluateSubmissionDeterministically(files: Array<{ path: string; content: string }>) {
  const hasTodoMarker = files.some((file) =>
    file.content.toLowerCase().includes("todo"),
  );

  if (hasTodoMarker) {
    return {
      status: SubmissionStatus.FAILED,
      score: 20,
      passedTests: 1,
      totalTests: 5,
      stdout: `[${nowIso()}] Placeholder worker run completed with TODO markers detected.`,
      stderr: "Found TODO marker in submitted files.",
      errorType: "ASSERTION_FAILED",
      errorMessage: "Submission still contains TODO markers.",
      testResultsJson: {
        total: 5,
        passed: 1,
        failed: 4,
      },
      durationMs: 120,
      memoryMb: 32,
    };
  }

  return {
    status: SubmissionStatus.PASSED,
    score: 100,
    passedTests: 5,
    totalTests: 5,
    stdout: `[${nowIso()}] Placeholder worker run completed successfully.`,
    stderr: null as string | null,
    errorType: null as string | null,
    errorMessage: null as string | null,
    testResultsJson: {
      total: 5,
      passed: 5,
      failed: 0,
    },
    durationMs: 95,
    memoryMb: 28,
  };
}

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

  const result = evaluateSubmissionDeterministically(submission.files);

  await prisma.$transaction(async (tx) => {
    await tx.submission.update({
      where: { id: submission.id },
      data: {
        status: result.status,
        score: result.score,
        passedTests: result.passedTests,
        totalTests: result.totalTests,
        errorType: result.errorType,
        errorMessage: result.errorMessage,
        completedAt: new Date(),
      },
    });

    await tx.submissionResult.upsert({
      where: { submissionId: submission.id },
      update: {
        stdout: result.stdout,
        stderr: result.stderr,
        testResultsJson: result.testResultsJson,
        durationMs: result.durationMs,
        memoryMb: result.memoryMb,
      },
      create: {
        submissionId: submission.id,
        stdout: result.stdout,
        stderr: result.stderr,
        testResultsJson: result.testResultsJson,
        durationMs: result.durationMs,
        memoryMb: result.memoryMb,
      },
    });
  });
}

export function startSubmissionWorker() {
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
