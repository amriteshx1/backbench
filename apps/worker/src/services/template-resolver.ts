import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Submission } from "@backbench/db";
import {
  resolveChallengesRoot,
  resolvePathWithinRoot,
} from "../lib/paths.js";

type SubmissionFile = {
  path: string;
  content: string;
};

type ChallengeForResolution = {
  templateKey: string;
  testKey: string;
};

export type ResolvedWorkspace = {
  workspaceDir: string;
  cleanup: () => Promise<void>;
};

export async function prepareWorkspaceForEvaluation(input: {
  submission: Submission;
  challenge: ChallengeForResolution;
  files: SubmissionFile[];
}): Promise<ResolvedWorkspace> {
  const challengesRoot = resolveChallengesRoot();
  const templateDir = resolvePathWithinRoot(challengesRoot, input.challenge.templateKey);
  const hiddenTestsDir = resolvePathWithinRoot(challengesRoot, input.challenge.testKey);

  const workspaceDir = await fs.mkdtemp(
    path.join(os.tmpdir(), `backbench-submission-${input.submission.id}-`),
  );

  await fs.cp(templateDir, workspaceDir, { recursive: true, force: true });
  await fs.mkdir(path.join(workspaceDir, "hidden-tests"), { recursive: true });
  await fs.cp(hiddenTestsDir, path.join(workspaceDir, "hidden-tests"), {
    recursive: true,
    force: true,
  });

  for (const file of input.files) {
    const absolutePath = path.resolve(workspaceDir, file.path);
    const normalizedRoot = path.resolve(workspaceDir);
    if (!absolutePath.startsWith(normalizedRoot)) {
      throw new Error(`File path escaped workspace: ${file.path}`);
    }
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, file.content, "utf8");
  }

  return {
    workspaceDir,
    cleanup: async () => {
      await fs.rm(workspaceDir, { recursive: true, force: true });
    },
  };
}
