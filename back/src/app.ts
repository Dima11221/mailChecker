import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import mailsRouter from "./routes/mails";
import { FRONTEND_ORIGINS } from "./config/env";

const app = express();

// Several origins: FRONTEND_URL=https://app.vercel.app,http://localhost:5173
app.use(
  cors({
    origin: FRONTEND_ORIGINS.length === 1 ? FRONTEND_ORIGINS[0] : FRONTEND_ORIGINS,
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