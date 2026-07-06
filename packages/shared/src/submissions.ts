export type SubmissionStatus =
  | "QUEUED"
  | "RUNNING"
  | "PASSED"
  | "FAILED"
  | "ERROR"
  | "TIMEOUT"
  | "CANCELLED";

export type SubmissionFileInput = {
  path: string;
  content: string;
};

export type CreateSubmissionRequest = {
  files: SubmissionFileInput[];
};

export type CreateSubmissionResponse = {
  submission: {
    id: string;
    challengeId: string;
    challengeSlug: string;
    status: SubmissionStatus;
    submittedAt: string;
  };
};

export type SubmissionDetailResponse = {
  submission: {
    id: string;
    userId: string;
    challengeId: string;
    challengeSlug: string;
    status: SubmissionStatus;
    score: number | null;
    passedTests: number | null;
    totalTests: number | null;
    errorType: string | null;
    errorMessage: string | null;
    submittedAt: string;
    startedAt: string | null;
    completedAt: string | null;
    files: SubmissionFileInput[];
  };
};

export type SubmissionLogsResponse = {
  submissionId: string;
  stdout: string | null;
  stderr: string | null;
  testResultsJson: unknown | null;
  durationMs: number | null;
  memoryMb: number | null;
};
