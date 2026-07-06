import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";

const challengeMetaSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  category: z.string().min(1),
  description: z.string().min(1),
  tags: z.array(z.string().min(1)).default([]),
  maxScore: z.number().int().positive().default(100),
  timeLimitMs: z.number().int().positive().default(2000),
  memoryLimitMb: z.number().int().positive().default(256),
  status: z.enum(["draft", "published", "archived"]).default("published"),
  orderIndex: z.number().int().nonnegative().default(0),
});

export type ChallengeMeta = z.infer<typeof challengeMetaSchema>;

export type ChallengeDefinition = {
  rootDir: string;
  templateDir: string;
  publicTestsDir: string;
  hiddenTestsDir: string;
  readmePath: string;
  meta: ChallengeMeta;
};

export type StarterFile = {
  path: string;
  content: string;
};

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function walkDirs(rootDir: string): Promise<string[]> {
  const found: string[] = [];
  const entries = await fs.readdir(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (!entry.isDirectory()) continue;
    found.push(fullPath);
    const nested = await walkDirs(fullPath);
    found.push(...nested);
  }

  return found;
}

export async function discoverChallengeDirs(challengesRoot: string): Promise<string[]> {
  const allDirs = await walkDirs(challengesRoot);
  const dirsWithMeta = await Promise.all(
    allDirs.map(async (dir) => ({
      dir,
      hasMeta: await pathExists(path.join(dir, "challenge.json")),
    })),
  );

  return dirsWithMeta.filter((item) => item.hasMeta).map((item) => item.dir);
}

export async function loadChallengeDefinition(challengeDir: string): Promise<ChallengeDefinition> {
  const challengeJsonPath = path.join(challengeDir, "challenge.json");
  const readmePath = path.join(challengeDir, "README.md");
  const templateDir = path.join(challengeDir, "template");
  const publicTestsDir = path.join(challengeDir, "public-tests");
  const hiddenTestsDir = path.join(challengeDir, "hidden-tests");

  const [challengeJsonRaw, templateExists, publicExists, hiddenExists, readmeExists] = await Promise.all([
    fs.readFile(challengeJsonPath, "utf8"),
    pathExists(templateDir),
    pathExists(publicTestsDir),
    pathExists(hiddenTestsDir),
    pathExists(readmePath),
  ]);

  if (!templateExists || !publicExists || !hiddenExists || !readmeExists) {
    throw new Error(`Challenge at ${challengeDir} is missing one of required directories/files.`);
  }

  const parsedJson = JSON.parse(challengeJsonRaw) as unknown;
  const meta = challengeMetaSchema.parse(parsedJson);

  return {
    rootDir: challengeDir,
    templateDir,
    publicTestsDir,
    hiddenTestsDir,
    readmePath,
    meta,
  };
}

export async function loadAllChallenges(challengesRoot: string): Promise<ChallengeDefinition[]> {
  const challengeDirs = await discoverChallengeDirs(challengesRoot);
  const loaded = await Promise.all(challengeDirs.map((dir) => loadChallengeDefinition(dir)));

  return loaded.sort((a, b) => {
    if (a.meta.orderIndex !== b.meta.orderIndex) {
      return a.meta.orderIndex - b.meta.orderIndex;
    }
    return a.meta.title.localeCompare(b.meta.title);
  });
}

async function collectFilesRecursively(baseDir: string, currentDir: string): Promise<StarterFile[]> {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  const files: StarterFile[] = [];

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFilesRecursively(baseDir, fullPath)));
      continue;
    }

    if (!entry.isFile()) continue;

    const relativePath = path.relative(baseDir, fullPath).replaceAll("\\", "/");
    const content = await fs.readFile(fullPath, "utf8");
    files.push({ path: relativePath, content });
  }

  return files;
}

export async function readStarterFiles(templateDir: string): Promise<StarterFile[]> {
  const files = await collectFilesRecursively(templateDir, templateDir);
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

export async function readChallengeReadme(readmePath: string): Promise<string> {
  return fs.readFile(readmePath, "utf8");
}