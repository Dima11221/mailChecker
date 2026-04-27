import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }

  return value;
}

export const PORT = Number(process.env.PORT);
export const DATABASE_URL = requireEnv("DATABASE_URL");
const FRONTEND_URL_RAW = process.env.FRONTEND_URL ?? "http://localhost:5173";
export const FRONTEND_URL = FRONTEND_URL_RAW.split(",")[0].trim();
export const FRONTEND_ORIGINS = FRONTEND_URL_RAW.split(",")
  .map((s) => s.trim())
  .filter(Boolean);
export const JWT_SECRET = requireEnv("JWT_SECRET");
export const ENCRYPTION_KEY = requireEnv("ENCRYPTION_KEY");
export const MAIL_CHECK_CRON = "*/30 * * * *";
export const MAX_UNSEEN_PER_MAILBOX = 10;
export const MAIL_FOLDERS = ("INBOX,Spam,Junk")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
export const MAIL_SOURCES = ("banki.ru,irecommend.ru")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
