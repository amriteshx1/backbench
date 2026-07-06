export type ChallengeDifficulty = "easy" | "medium" | "hard";
export type ChallengeStatus = "draft" | "published" | "archived";

export type ChallengeSummary = {
  id: string;
  slug: string;
  title: string;
  difficulty: ChallengeDifficulty;
  category: string;
  description: string;
  status: ChallengeStatus;
  orderIndex: number;
  maxScore: number;
  timeLimitMs: number;
  memoryLimitMb: number;
  tags: string[];
};

export type ChallengeListResponse = {
  challenges: ChallengeSummary[];
};

export type ChallengeDetailResponse = {
  challenge: ChallengeSummary & {
    readme: string;
  };
};

export type ChallengeStarterResponse = {
  files: Array<{
    path: string;
    content: string;
  }>;
};
