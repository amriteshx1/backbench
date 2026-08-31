import { readStarterFiles } from "@backbench/challenge-registry";
import type {
  CreateSubmissionRequest,
  CreateSubmissionResponse,
  SubmissionRealtimeEvent,
  SubmissionDetailResponse,
  SubmissionLogsResponse,
} from "@backbench/shared";
import { AppError } from "../lib/app-error.js";
import {
  resolveChallengesRoot,
  resolvePathWithinChallenges,
} from "../lib/challenges-root.js";
import { queueProducer } from "./queue-producer.js";
import { submissionsRepository } from "../repositories/submissions.repository.js";
import { emitSubmissionRealtimeEvent } from "./realtime.service.js";
import { logger } from "../lib/logger.js";

const DISALLOWED_SEGMENTS = ["..", ""];

function isSafeRelativePath(filePath: string): boolean {
  if (filePath.startsWith("/") || filePath.startsWith("\\")) return false;
  if (filePath.includes("\\") || filePath.includes("\0")) return false;
  const segments = filePath.split("/");
  return !segments.some((segment) => DISALLOWED_SEGMENTS.includes(segment));
}

export const submissionsService = {
  async create(
    userId: string,
    challengeSlug: string,
    input: CreateSubmissionRequest,
  ): Promise<CreateSubmissionResponse> {
    const challenge = await submissionsRepository.findChallengeBySlug(challengeSlug);
    if (!challenge) {
      throw new AppError(404, "Challenge not found");
    }

    const challengesRoot = resolveChallengesRoot();
    const templateDir = resolvePathWithinChallenges(challengesRoot, challenge.templateKey);
    const starterFiles = await readStarterFiles(templateDir);
    const allowedPaths = new Set(starterFiles.map((file) => file.path));

    const pathSet = new Set<string>();
    for (const file of input.files) {
      if (!isSafeRelativePath(file.path)) {
        throw new AppError(400, `Invalid file path: ${file.path}`);
      }
      if (!allowedPaths.has(file.path)) {
        throw new AppError(400, `File path is not editable: ${file.path}`);
      }
      if (pathSet.has(file.path)) {
        throw new AppError(400, `Duplicate file path: ${file.path}`);
      }
      pathSet.add(file.path);
    }

    const submission = await submissionsRepository.createSubmission({
      userId,
      challengeId: challenge.id,
      challengeSlug: challenge.slug,
      files: input.files,
    });

    const baseEvent: Omit<SubmissionRealtimeEvent, "event"> = {
      submissionId: submission.id,
      userId: submission.userId,
      challengeId: submission.challengeId,
      timestamp: new Date().toISOString(),
    };

    emitSubmissionRealtimeEvent({
      ...baseEvent,
      event: "submission.created",
      status: submission.status,
    });

    let resultingStatus = submission.status;

    try {
      await queueProducer.enqueueSubmissionEvaluation({
        submissionId: submission.id,
        userId: submission.userId,
        challengeId: submission.challengeId,
        attemptNumber: 1,
      });

      emitSubmissionRealtimeEvent({
        ...baseEvent,
        event: "submission.queued",
        status: "QUEUED",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to enqueue submission";
      logger.error("queue.submission_enqueue_failed", {
        submissionId: submission.id,
        message,
      });
      await submissionsRepository.markSubmissionErrorForQueueFailure(
        submission.id,
        message,
      );
      resultingStatus = "ERROR";

      emitSubmissionRealtimeEvent({
        ...baseEvent,
        event: "submission.completed",
        status: "ERROR",
      });
    }

    return {
      submission: {
        id: submission.id,
        challengeId: submission.challengeId,
        challengeSlug: submission.challenge.slug,
        status: resultingStatus,
        submittedAt: submission.submittedAt.toISOString(),
      },
    };
  },

  async detail(userId: string, submissionId: string): Promise<SubmissionDetailResponse> {
    const submission = await submissionsRepository.findSubmissionById(submissionId);
    if (!submission) {
      throw new AppError(404, "Submission not found");
    }
    if (submission.userId !== userId) {
      throw new AppError(403, "Access denied for submission");
    }

    return {
      submission: {
        id: submission.id,
        userId: submission.userId,
        challengeId: submission.challengeId,
        challengeSlug: submission.challenge.slug,
        status: submission.status,
        score: submission.score,
        passedTests: submission.passedTests,
        totalTests: submission.totalTests,
        errorType: submission.errorType,
        errorMessage: submission.errorMessage,
        submittedAt: submission.submittedAt.toISOString(),
        startedAt: submission.startedAt ? submission.startedAt.toISOString() : null,
        completedAt: submission.completedAt ? submission.completedAt.toISOString() : null,
        files: submission.files.map((file) => ({
          path: file.path,
          content: file.content,
        })),
      },
    };
  },

  async logs(userId: string, submissionId: string): Promise<SubmissionLogsResponse> {
    const submission = await submissionsRepository.findSubmissionById(submissionId);
    if (!submission) {
      throw new AppError(404, "Submission not found");
    }
    if (submission.userId !== userId) {
      throw new AppError(403, "Access denied for submission");
    }

    const result = await submissionsRepository.findSubmissionLogs(submissionId);

    return {
      submissionId,
      stdout: result?.stdout ?? null,
      stderr: result?.stderr ?? null,
      testResultsJson: result?.testResultsJson ?? null,
      durationMs: result?.durationMs ?? null,
      memoryMb: result?.memoryMb ?? null,
    };
  },
};
