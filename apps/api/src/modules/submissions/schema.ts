import { z } from "zod";

const MAX_FILES = 30;
const MAX_FILE_CONTENT_BYTES = 200_000;
const MAX_TOTAL_CONTENT_BYTES = 1_000_000;

const submissionFileSchema = z.object({
  path: z.string().min(1).max(200),
  content: z.string().max(MAX_FILE_CONTENT_BYTES),
});

export const createSubmissionSchema = z
  .object({
    files: z.array(submissionFileSchema).min(1).max(MAX_FILES),
  })
  .refine(
    (data) => {
      const totalBytes = data.files.reduce(
        (sum, file) => sum + Buffer.byteLength(file.content, "utf8"),
        0,
      );
      return totalBytes <= MAX_TOTAL_CONTENT_BYTES;
    },
    {
      message: "Total submission size exceeds allowed limit",
    },
  );

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
