type Event = { type: string; amount: number };
const streams = new Map<string, Event[]>();

export class EventStore {
  append(streamId: string, event: Event): void {
    // TODO: append event to stream array
  }

  load(streamId: string): Event[] {
    // TODO: return events for stream
    return [];
  }
}

export function projectBalance(events: Event[]): number {
  // TODO: fold events into balance
  return 0;
}

import { Router } from "express";
export const router = Router();
const store = new EventStore();
router.get("/accounts/:id/balance", (req, res) => {
  const events = store.load(req.params.id);
  return res.status(200).json({ balance: projectBalance(events) });
});
