import { Router } from "express";
const refreshStore = new Set<string>();
export const router = Router();

router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  // TODO: validate, rotate tokens, invalidate old refresh token
  return res.status(200).json({ accessToken: "new", refreshToken: "new-r" });
});
