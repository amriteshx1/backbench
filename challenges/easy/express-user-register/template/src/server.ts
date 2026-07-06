import express from "express";
import { usersRouter } from "./users.routes.js";

const app = express();
app.use(express.json());
app.use("/users", usersRouter);

app.listen(3001, () => {
  console.log("Challenge template server running on http://localhost:3001");
});
