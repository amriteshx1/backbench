import { prisma, SubmissionStatus } from "@backbench/db";
import type { SubmissionFileInput } from "@backbench/shared";

export const submissionsRepository = {
  findChallengeBySlug(slug: string) {
    return prisma.challenge.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        templateKey: true,
      },
    });
  },

  createSubmission(input: {
    userId: string;
    challengeId: string;
    challengeSlug: string;
    files: SubmissionFileInput[];
  }) {
    return prisma.submission.create({
      data: {
        userId: input.userId,
        challengeId: input.challengeId,
        status: SubmissionStatus.QUEUED,
        files: {
          createMany: {
            data: input.files,
          },
        },
      },
      include: {
        challenge: {
          select: { slug: true },
        },
      },
    });
  },

  findSubmissionById(submissionId: string) {
    return prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        challenge: { select: { slug: true } },
        files: {
          select: {
            path: true,
            content: true,
          },
          orderBy: { path: "asc" },
        },
      },
    });
  },

  findSubmissionLogs(submissionId: string) {
    return prisma.submissionResult.findUnique({
      where: { submissionId },
    });
  },
};
