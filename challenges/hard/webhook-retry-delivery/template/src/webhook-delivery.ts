type DeliveryAttempt = { url: string; attempt: number; success: boolean };
const deliveryLog: DeliveryAttempt[] = [];

export async function deliverWebhook(
  url: string,
  payload: unknown,
  sender: (url: string, body: unknown) => Promise<boolean>,
): Promise<boolean> {
  // TODO: retry up to 3 times, log each attempt
  return false;
}

import { Router } from "express";
export const router = Router();
router.post("/deliver", async (req, res) => {
  const ok = await deliverWebhook(req.body.url, req.body.payload, async () => false);
  return res.status(200).json({ success: ok, log: deliveryLog });
});
