import express from "express";
import { router } from "./api-key.js";

const app = express();
app.use(express.json());
app.use("/", router);

app.listen(3001, () => {
  console.log("Challenge template server running on http://localhost:3001");
});
