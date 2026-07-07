const MAX_LOG_LENGTH = 40_000;

function truncate(value: string): string {
  if (value.length <= MAX_LOG_LENGTH) return value;
  return `${value.slice(0, MAX_LOG_LENGTH)}\n...[truncated]`;
}

export function collectLogs(raw: { stdout: string; stderr: string }) {
  return {
    stdout: truncate(raw.stdout),
    stderr: truncate(raw.stderr),
  };
}
