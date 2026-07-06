import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z.string().max(100).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  githubUrl: z.string().url().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;