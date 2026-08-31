import { z } from "zod";

export const challengeListQuerySchema = z.object({
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  category: z.string().min(1).optional(),
  tag: z.string().min(1).optional(),
});

export type ChallengeListQuery = z.infer<typeof challengeListQuerySchema>;
