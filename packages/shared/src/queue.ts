export const SUBMISSION_EVALUATION_QUEUE = "submission-evaluation";

export type SubmissionEvaluationJobPayload = {
  submissionId: string;
  userId: string;
  challengeId: string;
  attemptNumber: number;
};
