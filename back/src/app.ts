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

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  const message = err instanceof Error ? err.message : "Internal Server Error";
  res.status(500).json({ error: message });
});

export default app;