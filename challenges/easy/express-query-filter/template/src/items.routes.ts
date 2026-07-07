import { Router } from "express";
const items = [
  { id: "1", name: "Keyboard", category: "hardware" },
  { id: "2", name: "VS Code", category: "software" },
];
export const router = Router();

router.get("/items", (req, res) => {
  // TODO: filter by req.query.category when present
  return res.status(200).json(items);
});
