import { SubmissionStatus } from "@backbench/db";

const RESULT_SENTINEL = "RESULT_JSON:";

export type ParsedEvaluationResult = {
  status: SubmissionStatus;
  score: number | null;
  passedTests: number | null;
  totalTests: number | null;
  errorType: string | null;
  errorMessage: string | null;
  testResultsJson: unknown | null;
  durationMs: number | null;
  memoryMb: number | null;
};

function isSubmissionStatus(value: string): value is SubmissionStatus {
  return (
    value === SubmissionStatus.QUEUED ||
    value === SubmissionStatus.RUNNING ||
    value === SubmissionStatus.PASSED ||
    value === SubmissionStatus.FAILED ||
    value === SubmissionStatus.ERROR ||
    value === SubmissionStatus.TIMEOUT ||
    value === SubmissionStatus.CANCELLED
  );
}

export function parseEvaluationResultFromStdout(
  stdout: string,
): ParsedEvaluationResult | null {
  const lines = stdout.split(/\r?\n/).reverse();
  const resultLine = lines.find((line) => line.startsWith(RESULT_SENTINEL));
  if (!resultLine) return null;

  const payload = resultLine.slice(RESULT_SENTINEL.length).trim();
  const parsed = JSON.parse(payload) as {
    status?: string;
    score?: number | null;
    passedTests?: number | null;
    totalTests?: number | null;
    errorType?: string | null;
    errorMessage?: string | null;
    testResultsJson?: unknown | null;
    durationMs?: number | null;
    memoryMb?: number | null;
  };

  if (!parsed.status || !isSubmissionStatus(parsed.status)) {
    return null;
  }

  return {
    status: parsed.status,
    score: parsed.score ?? null,
    passedTests: parsed.passedTests ?? null,
    totalTests: parsed.totalTests ?? null,
    errorType: parsed.errorType ?? null,
    errorMessage: parsed.errorMessage ?? null,
    testResultsJson: parsed.testResultsJson ?? null,
    durationMs: parsed.durationMs ?? null,
    memoryMb: parsed.memoryMb ?? null,
  };
}
