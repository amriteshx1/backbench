"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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

type CreateSubmissionResponse = {
  submission: {
    id: string;
    challengeId: string;
    challengeSlug: string;
    status: "QUEUED" | "RUNNING" | "PASSED" | "FAILED" | "ERROR" | "TIMEOUT" | "CANCELLED";
    submittedAt: string;
  };
};

type SubmissionDetailResponse = {
  submission: {
    id: string;
    status: "QUEUED" | "RUNNING" | "PASSED" | "FAILED" | "ERROR" | "TIMEOUT" | "CANCELLED";
    submittedAt: string;
    startedAt: string | null;
    completedAt: string | null;
    errorType: string | null;
    errorMessage: string | null;
    score: number | null;
    passedTests: number | null;
    totalTests: number | null;
    files: Array<{
      path: string;
      content: string;
    }>;
  };
};

type SubmissionLogsResponse = {
  submissionId: string;
  stdout: string | null;
  stderr: string | null;
  testResultsJson: unknown | null;
  durationMs: number | null;
  memoryMb: number | null;
};

function difficultyVariant(difficulty: ChallengeSummary["difficulty"]) {
  if (difficulty === "easy") return "secondary";
  if (difficulty === "medium") return "default";
  return "destructive";
}

function getSubmissionStorageKey(slug: string): string {
  return `latest-submission:${slug}`;
}

export default function ChallengeDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const token = getToken();
  const slug = params.slug;
  const [editableFiles, setEditableFiles] = useState<Array<{ path: string; content: string }>>([]);
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [latestSubmissionId, setLatestSubmissionId] = useState<string | null>(null);

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

  useEffect(() => {
    if (!slug) return;
    const fromStorage = window.localStorage.getItem(getSubmissionStorageKey(slug));
    if (fromStorage) {
      setLatestSubmissionId(fromStorage);
    }
  }, [slug]);

  useEffect(() => {
    if (!starterQuery.data?.files?.length) return;
    setEditableFiles((current) => (current.length ? current : starterQuery.data.files));
    setSelectedPath((current) => (current ? current : starterQuery.data.files[0]?.path ?? ""));
  }, [starterQuery.data]);

  const selectedFile = useMemo(
    () => editableFiles.find((file) => file.path === selectedPath) ?? null,
    [editableFiles, selectedPath],
  );

  const submitMutation = useMutation({
    mutationFn: () =>
      apiRequest<CreateSubmissionResponse>(`/challenges/${slug}/submissions`, {
        method: "POST",
        token,
        body: { files: editableFiles },
      }),
    onSuccess: (data) => {
      setLatestSubmissionId(data.submission.id);
      window.localStorage.setItem(getSubmissionStorageKey(slug), data.submission.id);
      toast.success(`Submission created: ${data.submission.id}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create submission");
    },
  });

  const submissionQuery = useQuery({
    queryKey: ["submission", latestSubmissionId],
    queryFn: () => apiRequest<SubmissionDetailResponse>(`/submissions/${latestSubmissionId}`, { token }),
    enabled: Boolean(token && latestSubmissionId),
    refetchInterval: (query) =>
      query.state.data?.submission.status === "QUEUED" || query.state.data?.submission.status === "RUNNING"
        ? 3000
        : false,
  });

  const submissionLogsQuery = useQuery({
    queryKey: ["submission-logs", latestSubmissionId],
    queryFn: () => apiRequest<SubmissionLogsResponse>(`/submissions/${latestSubmissionId}/logs`, { token }),
    enabled: Boolean(token && latestSubmissionId),
    refetchInterval: (query) =>
      submissionQuery.data?.submission.status === "QUEUED" || submissionQuery.data?.submission.status === "RUNNING"
        ? 3000
        : query.state.data
          ? false
          : 3000,
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
  const starterFiles = starterQuery.data?.files ?? editableFiles;

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
          <CardTitle>Workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {starterFiles.map((file) => (
              <Button
                key={file.path}
                variant={file.path === selectedPath ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPath(file.path)}
              >
                {file.path}
              </Button>
            ))}
          </div>

          {selectedFile ? (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Editing: {selectedFile.path}</div>
              <Textarea
                value={selectedFile.content}
                onChange={(event) => {
                  const nextContent = event.target.value;
                  setEditableFiles((current) =>
                    current.map((file) =>
                      file.path === selectedFile.path ? { ...file, content: nextContent } : file,
                    ),
                  );
                }}
                className="min-h-[360px] font-mono text-xs"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No starter files available.</p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending || !editableFiles.length}>
              {submitMutation.isPending ? "Submitting..." : "Submit solution"}
            </Button>
            {latestSubmissionId ? (
              <span className="text-xs text-muted-foreground">Latest submission: {latestSubmissionId}</span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submission Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!latestSubmissionId ? (
            <p className="text-sm text-muted-foreground">
              No submissions yet for this challenge in this browser session.
            </p>
          ) : submissionQuery.isLoading ? (
            <p className="text-sm">Loading latest submission...</p>
          ) : submissionQuery.isError ? (
            <p className="text-sm text-destructive">Unable to load submission status.</p>
          ) : submissionQuery.data ? (
            <>
              <div className="text-sm">
                <strong>ID:</strong> {submissionQuery.data.submission.id}
              </div>
              <div className="text-sm">
                <strong>Status:</strong> {submissionQuery.data.submission.status}
              </div>
              <div className="text-sm">
                <strong>Submitted:</strong> {new Date(submissionQuery.data.submission.submittedAt).toLocaleString()}
              </div>
              <div className="text-sm">
                <strong>Score:</strong> {submissionQuery.data.submission.score ?? "-"}
              </div>
              <div className="text-sm">
                <strong>Tests:</strong> {submissionQuery.data.submission.passedTests ?? "-"} /{" "}
                {submissionQuery.data.submission.totalTests ?? "-"}
              </div>
              {submissionQuery.data.submission.errorMessage ? (
                <div className="text-sm text-destructive">
                  <strong>Error:</strong> {submissionQuery.data.submission.errorMessage}
                </div>
              ) : null}
              {submissionLogsQuery.data?.durationMs !== null && submissionLogsQuery.data?.durationMs !== undefined ? (
                <div className="text-sm">
                  <strong>Duration:</strong> {submissionLogsQuery.data.durationMs} ms
                </div>
              ) : null}
              {submissionLogsQuery.data?.memoryMb !== null && submissionLogsQuery.data?.memoryMb !== undefined ? (
                <div className="text-sm">
                  <strong>Memory:</strong> {submissionLogsQuery.data.memoryMb} MB
                </div>
              ) : null}
              {submissionLogsQuery.data?.stdout ? (
                <div className="space-y-1">
                  <div className="text-xs font-semibold">stdout</div>
                  <pre className="max-h-48 overflow-auto rounded-md border bg-muted p-2 text-xs">
                    {submissionLogsQuery.data.stdout}
                  </pre>
                </div>
              ) : null}
              {submissionLogsQuery.data?.stderr ? (
                <div className="space-y-1">
                  <div className="text-xs font-semibold">stderr</div>
                  <pre className="max-h-48 overflow-auto rounded-md border bg-muted p-2 text-xs">
                    {submissionLogsQuery.data.stderr}
                  </pre>
                </div>
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
