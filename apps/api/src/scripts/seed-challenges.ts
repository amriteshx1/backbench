import path from "node:path";
import { loadEnv } from "@backbench/config";
import { prisma } from "@backbench/db";
import { loadAllChallenges } from "@backbench/challenge-registry";
import { resolveChallengesRoot } from "../lib/challenges-root.js";
import { logger } from "../lib/logger.js";

function toRelativePosixPath(basePath: string, targetPath: string): string {
  return path.relative(basePath, targetPath).replaceAll("\\", "/");
}

async function seed() {
  loadEnv();
  const challengesRoot = resolveChallengesRoot();
  const challengeDefinitions = await loadAllChallenges(challengesRoot);

  for (const definition of challengeDefinitions) {
    const challenge = await prisma.challenge.upsert({
      where: { slug: definition.meta.slug },
      update: {
        title: definition.meta.title,
        difficulty: definition.meta.difficulty,
        category: definition.meta.category,
        description: definition.meta.description,
        status: definition.meta.status,
        orderIndex: definition.meta.orderIndex,
        templateKey: toRelativePosixPath(challengesRoot, definition.templateDir),
        testKey: toRelativePosixPath(challengesRoot, definition.hiddenTestsDir),
        maxScore: definition.meta.maxScore,
        timeLimitMs: definition.meta.timeLimitMs,
        memoryLimitMb: definition.meta.memoryLimitMb,
      },
      create: {
        slug: definition.meta.slug,
        title: definition.meta.title,
        difficulty: definition.meta.difficulty,
        category: definition.meta.category,
        description: definition.meta.description,
        status: definition.meta.status,
        orderIndex: definition.meta.orderIndex,
        templateKey: toRelativePosixPath(challengesRoot, definition.templateDir),
        testKey: toRelativePosixPath(challengesRoot, definition.hiddenTestsDir),
        maxScore: definition.meta.maxScore,
        timeLimitMs: definition.meta.timeLimitMs,
        memoryLimitMb: definition.meta.memoryLimitMb,
      },
    });

    await prisma.challengeTagLink.deleteMany({
      where: { challengeId: challenge.id },
    });

    const uniqueTags = [...new Set(definition.meta.tags.map((tag: string) => tag.trim().toLowerCase()))];

    for (const normalizedTag of uniqueTags) {
      if (!normalizedTag) continue;

      const tag = await prisma.challengeTag.upsert({
        where: { name: normalizedTag },
        update: {},
        create: { name: normalizedTag },
      });

      await prisma.challengeTagLink.create({
        data: {
          challengeId: challenge.id,
          tagId: tag.id,
        },
      });
    }
  }

  logger.info("challenges.seeded", { count: challengeDefinitions.length });
}

seed()
  .catch((error) => {
    logger.error("challenges.seed_failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
