"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ChallengeSummary = {
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
  tags: string[];
};

type ChallengeListResponse = {
  challenges: ChallengeSummary[];
};

function difficultyVariant(difficulty: ChallengeSummary["difficulty"]) {
  if (difficulty === "easy") return "secondary";
  if (difficulty === "medium") return "default";
  return "destructive";
}

export default function ChallengesPage() {
  const router = useRouter();
  const token = getToken();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  const challengeQuery = useQuery({
    queryKey: ["challenges"],
    queryFn: () => apiRequest<ChallengeListResponse>("/challenges", { token }),
    enabled: Boolean(token),
  });

  if (!token) return null;

  if (challengeQuery.isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading challenges...</CardTitle>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (challengeQuery.isError) {
    return (
      <main className="p-6 space-y-4">
        <p>Unable to load challenges right now.</p>
        <Button onClick={() => challengeQuery.refetch()}>Retry</Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Challenge Catalog</h1>
        <Button variant="outline" asChild>
          <Link href="/profile">Profile</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {!challengeQuery.data?.challenges.length ? (
          <Card>
            <CardHeader>
              <CardTitle>No challenges yet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>The catalog is empty. Seed challenge metadata from the repo, then refresh this page.</p>
              <p>Run: <code className="rounded bg-muted px-1 py-0.5">npm run seed:challenges</code></p>
            </CardContent>
          </Card>
        ) : null}

        {challengeQuery.data?.challenges.map((challenge) => (
          <Card key={challenge.id}>
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{challenge.title}</CardTitle>
                <Badge variant={difficultyVariant(challenge.difficulty)}>
                  {challenge.difficulty}
                </Badge>
                <Badge variant="outline">{challenge.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{challenge.description}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {challenge.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                Max score: {challenge.maxScore} | Time limit: {challenge.timeLimitMs} ms |
                Memory limit: {challenge.memoryLimitMb} MB
              </div>
              <Button asChild>
                <Link href={`/challenges/${challenge.slug}`}>Open challenge</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
