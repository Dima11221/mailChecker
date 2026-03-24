import dotenv from "dotenv";
import fs from "node:fs";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }

  return value;
}

export const PORT = Number(process.env.PORT ?? 5001);
export const DATABASE_URL = requireEnv("DATABASE_URL");
/** Single origin (first) for redirects etc.; full list for CORS — comma-separated in FRONTEND_URL */
const FRONTEND_URL_RAW = process.env.FRONTEND_URL ?? "http://localhost:5173";
export const FRONTEND_URL = FRONTEND_URL_RAW.split(",")[0].trim();
export const FRONTEND_ORIGINS = FRONTEND_URL_RAW.split(",")
  .map((s) => s.trim())
  .filter(Boolean);
export const JWT_SECRET = requireEnv("JWT_SECRET");
export const ENCRYPTION_KEY = requireEnv("ENCRYPTION_KEY");
export const MAIL_CHECK_CRON = process.env.MAIL_CHECK_CRON ?? "* * * * *";
export const MAX_UNSEEN_PER_MAILBOX = Number(process.env.MAX_UNSEEN_PER_MAILBOX ?? 10);
export const MAIL_FOLDERS = (process.env.MAIL_FOLDERS ?? "INBOX,Spam,Junk")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
export const MAIL_SOURCES = (process.env.MAIL_SOURCES ?? "banki.ru,irecommend.ru")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

export const IMAP_TLS_REJECT_UNAUTHORIZED = process.env.IMAP_TLS_REJECT_UNAUTHORIZED === "true";

export const IMAP_TLS_CA = process.env.IMAP_TLS_CA && fs.existsSync(process.env.IMAP_TLS_CA)
  ? fs.readFileSync(process.env.IMAP_TLS_CA)
  : undefined;
