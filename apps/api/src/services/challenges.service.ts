import path from "node:path";
import {
  readChallengeReadme,
  readStarterFiles,
} from "@backbench/challenge-registry";
import type {
  ChallengeDetailResponse,
  ChallengeListResponse,
  ChallengeStarterResponse,
  ChallengeSummary,
} from "@backbench/shared";
import { AppError } from "../lib/app-error.js";
import {
  resolveChallengesRoot,
  resolvePathWithinChallenges,
} from "../lib/challenges-root.js";
import type { ChallengeListQuery } from "../schemas/challenges.schema.js";
import { challengesRepository } from "../repositories/challenges.repository.js";

function toChallengeSummary(
  challenge: {
    id: string;
    slug: string;
    title: string;
    difficulty: "easy" | "medium" | "hard";
    category: string;
    description: string;
    status: "draft" | "published" | "archived";
    orderIndex: number;
    maxScore: number;
    timeLimitMs: number;
    memoryLimitMb: number;
    tags: Array<{ tag: { name: string } }>;
  },
): ChallengeSummary {
  return {
    id: challenge.id,
    slug: challenge.slug,
    title: challenge.title,
    difficulty: challenge.difficulty,
    category: challenge.category,
    description: challenge.description,
    status: challenge.status,
    orderIndex: challenge.orderIndex,
    maxScore: challenge.maxScore,
    timeLimitMs: challenge.timeLimitMs,
    memoryLimitMb: challenge.memoryLimitMb,
    tags: challenge.tags.map((tagLink) => tagLink.tag.name),
  };
}

export const challengesService = {
  async list(filters: ChallengeListQuery): Promise<ChallengeListResponse> {
    const challenges = await challengesRepository.findAll(filters);

    return {
      challenges: challenges.map((challenge) => toChallengeSummary(challenge)),
    };
  },

  async detail(slug: string): Promise<ChallengeDetailResponse> {
    const challenge = await challengesRepository.findBySlug(slug);
    if (!challenge) {
      throw new AppError(404, "Challenge not found");
    }

    const challengesRoot = resolveChallengesRoot();
    const templateAbsolutePath = resolvePathWithinChallenges(
      challengesRoot,
      challenge.templateKey,
    );
    const challengeRoot = path.dirname(templateAbsolutePath);
    const readmePath = path.join(challengeRoot, "README.md");
    const readme = await readChallengeReadme(readmePath);

    return {
      challenge: {
        ...toChallengeSummary(challenge),
        readme,
      },
    };
  },

  async starterFiles(slug: string): Promise<ChallengeStarterResponse> {
    const challenge = await challengesRepository.findBySlug(slug);
    if (!challenge) {
      throw new AppError(404, "Challenge not found");
    }

    const challengesRoot = resolveChallengesRoot();
    const templateDir = resolvePathWithinChallenges(
      challengesRoot,
      challenge.templateKey,
    );
    const files = await readStarterFiles(templateDir);

    return { files };
  },
};
