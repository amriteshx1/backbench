"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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

type ChallengeDetailResponse = {
  challenge: ChallengeSummary & {
    readme: string;
  };
};

type ChallengeStarterResponse = {
  files: Array<{
    path: string;
    content: string;
  }>;
};

function difficultyVariant(difficulty: ChallengeSummary["difficulty"]) {
  if (difficulty === "easy") return "secondary";
  if (difficulty === "medium") return "default";
  return "destructive";
}

export default function ChallengeDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const token = getToken();
  const slug = params.slug;

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  const detailQuery = useQuery({
    queryKey: ["challenge-detail", slug],
    queryFn: () => apiRequest<ChallengeDetailResponse>(`/challenges/${slug}`, { token }),
    enabled: Boolean(token && slug),
  });

  const starterQuery = useQuery({
    queryKey: ["challenge-starter", slug],
    queryFn: () => apiRequest<ChallengeStarterResponse>(`/challenges/${slug}/starter`, { token }),
    enabled: Boolean(token && slug),
  });

  if (!token) return null;

  if (detailQuery.isLoading || starterQuery.isLoading) {
    return <main className="p-6">Loading challenge...</main>;
  }

  if (detailQuery.isError || starterQuery.isError || !detailQuery.data) {
    return (
      <main className="p-6 space-y-4">
        <p>Unable to load this challenge.</p>
        <div className="flex gap-2">
          <Button onClick={() => detailQuery.refetch()}>Retry detail</Button>
          <Button variant="outline" onClick={() => starterQuery.refetch()}>
            Retry starter
          </Button>
        </div>
      </main>
    );
  }

  const { challenge } = detailQuery.data;
  const starterFiles = starterQuery.data?.files ?? [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/challenges">Back to catalog</Link>
        </Button>
      </div>

      <Card>
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
            Max score: {challenge.maxScore} | Time limit: {challenge.timeLimitMs} ms | Memory
            limit: {challenge.memoryLimitMb} MB
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requirements (README)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-md border bg-muted p-4 text-sm">
            {challenge.readme}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Starter Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {starterFiles.map((file) => (
            <div key={file.path} className="rounded-md border">
              <div className="border-b bg-muted px-3 py-2 text-xs font-semibold">
                {file.path}
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap p-3 text-xs">
                {file.content}
              </pre>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
