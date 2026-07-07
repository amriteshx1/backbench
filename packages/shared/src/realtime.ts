export const SUBMISSION_EVENTS_CHANNEL = "submission-events";

export type SubmissionRealtimeEventName =
  | "submission.created"
  | "submission.queued"
  | "submission.started"
  | "submission.completed";

export type SubmissionRealtimeEvent = {
  event: SubmissionRealtimeEventName;
  submissionId: string;
  userId: string;
  challengeId: string;
  status?: string;
  timestamp: string;
};
