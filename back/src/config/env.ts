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
export const MAIL_SOURCES = ("banki.ru,irecommend.ru,asn-news.ru,zoon.ru,2gis.ru,yandex.ru, blizko-support.com, reviewscompanies.club, otzovy-moskvy.ru, tilbagevise.ru, ru.gorodwiki.ru, wine-searcher.com")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

export const IMAP_TLS_REJECT_UNAUTHORIZED = process.env.IMAP_TLS_REJECT_UNAUTHORIZED === "true";

export const IMAP_TLS_CA = process.env.IMAP_TLS_CA && fs.existsSync(process.env.IMAP_TLS_CA)
  ? fs.readFileSync(process.env.IMAP_TLS_CA)
  : undefined;
