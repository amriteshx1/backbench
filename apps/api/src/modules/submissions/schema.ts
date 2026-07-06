import { z } from "zod";

const submissionFileSchema = z.object({
  path: z.string().min(1).max(200),
  content: z.string().max(200_000),
});

export const createSubmissionSchema = z.object({
  files: z.array(submissionFileSchema).min(1).max(30),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
