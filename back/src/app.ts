import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import mailsRouter from "./routes/mails";
import { FRONTEND_URL } from "./env";

const app = express();

app.use(
  cors({
    origin: FRONTEND_URL,
  })
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRouter);
app.use(mailsRouter);

export default app;