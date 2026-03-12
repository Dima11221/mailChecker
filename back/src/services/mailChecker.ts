import { ImapFlow } from "imapflow";
import { pool } from "../db/db";
import { simpleParser } from "mailparser";
import { decryptSecret } from "../lib/crypto";
import {
  MAIL_FOLDERS,
  MAIL_SOURCES,
  MAX_UNSEEN_PER_MAILBOX,
  IMAP_TLS_REJECT_UNAUTHORIZED,
  IMAP_TLS_CA,
} from "../config/env";

type MailboxRow = {
  id: number;
  email: string;
  host: string;
  port: number;
  secure: boolean;
  login: string;
  password_encrypted: string;
};

const LAST_ERROR_MAX = 1200;

/**
 * ImapFlow часто кидает Error с message "Command failed", но на объекте есть
 * authenticationFailed, responseText от сервера, code сокета — собираем понятный текст для UI.
 */
function formatImapError(mailbox: MailboxRow, error: unknown): string {
  const e = error as Record<string, unknown> & { message?: string };
  const parts: string[] = [];

  const hostInfo = `host ${mailbox.host}:${mailbox.port}${mailbox.secure ? " (SSL)" : ""}`;

  if (e.authenticationFailed === true) {
    parts.push(
      "Не удалось войти в почту по IMAP. Проверьте логин и пароль приложения (не обычный пароль от аккаунта)."
    );
    if (typeof e.serverResponseCode === "string" && e.serverResponseCode) {
      parts.push(`Код ответа сервера: ${e.serverResponseCode}.`);
    }
  }

  if (typeof e.responseText === "string" && e.responseText.trim()) {
    parts.push(`Сервер: ${e.responseText.trim()}`);
  }

  if (typeof e.code === "string" && e.code) {
    switch (e.code) {
      case "ENOTFOUND":
        parts.push(
          `Не найден адрес ${hostInfo} — проверьте написание host (например imap.mail.ru, а не imap.mail.r).`
        );
        break;
      case "ECONNREFUSED":
        parts.push(
          `Подключение отклонено (${hostInfo}) — неверный порт или сервер не слушает SSL на этом порту.`
        );
        break;
      case "ETIMEDOUT":
      case "ESOCKETTIMEDOUT":
        parts.push(`Таймаут при подключении к ${hostInfo}.`);
        break;
      case "CERT_HAS_EXPIRED":
      case "UNABLE_TO_VERIFY_LEAF_SIGNATURE":
        parts.push("Проблема с SSL-сертификатом сервера.");
        break;
      default:
        if (!e.authenticationFailed) {
          parts.push(`Сеть/сокет: ${e.code}`);
        }
    }
  }

  if (typeof e.responseStatus === "string" && e.responseStatus && e.responseStatus !== "OK") {
    parts.push(`Статус IMAP: ${e.responseStatus}`);
  }

  const rawMessage = typeof e.message === "string" ? e.message : "";
  if (rawMessage && rawMessage !== "Command failed") {
    parts.push(rawMessage);
  } else if (rawMessage === "Command failed" && parts.length === 0) {
    parts.push(
      `Команда IMAP завершилась с ошибкой (${hostInfo}). Проверьте host, порт, SSL и пароль приложения.`
    );
  }

  if (parts.length === 0) {
    parts.push(rawMessage || "Неизвестная ошибка при подключении к IMAP.");
  }

  const text = parts.join(" ").replace(/\s+/g, " ").trim();
  return text.slice(0, LAST_ERROR_MAX);
}

function makeDedupeKey(params: {
  messageId: string | null;
  folder: string;
  from: string;
  subject: string;
  receivedAt: Date;
}): string {
  if (params.messageId) {
    return `mid:${params.messageId}`;
  }

  return [
    "fallback",
    params.folder,
    params.from,
    params.subject,
    params.receivedAt.toISOString(),
  ].join("|");
}

export async function checkMailboxes() {
  const { rows: mailboxes } = await pool.query<MailboxRow>(
    `SELECT id, email, host, port, secure, login, password_encrypted
     FROM mailboxes
     WHERE active = true
     ORDER BY id`
  );

  console.log(
    "Found mailboxes:",
    mailboxes.length,
    mailboxes.map((mailbox) => mailbox.email).join(", ")
  );

  for (const mailbox of mailboxes) {
    let client: ImapFlow | null = null;

    try {
      console.log("Processing mailbox:", mailbox.email);

      client = new ImapFlow({
        host: mailbox.host,
        port: mailbox.port,
        secure: mailbox.secure,
        auth: {
          user: mailbox.login,
          pass: decryptSecret(mailbox.password_encrypted)
        },
        socketTimeout: 300000,
        tls: {
          rejectUnauthorized: !IMAP_TLS_REJECT_UNAUTHORIZED,
          ca: IMAP_TLS_CA,
        }
      });

      await client.connect();

      for (const folder of MAIL_FOLDERS) {
        try {
          await client.mailboxOpen(folder);
        } catch {
          continue;
        }

        const searchResult = await client.search({ seen: false }, { uid: true });
        const allUnseen = searchResult === false ? [] : searchResult;
        const unseenUids = allUnseen.slice(-MAX_UNSEEN_PER_MAILBOX);
        if (unseenUids.length === 0) continue;

        for (const uid of unseenUids) {
          for await (const msg of client.fetch(String(uid), {
            envelope: true,
            source: true
          }, { uid: true })) {
            const from = msg.envelope?.from?.[0]?.address ?? "";
            const matchedSource = MAIL_SOURCES.find((domain) => from.includes(domain));
            if (!matchedSource) continue;

            const receivedAt = msg.envelope?.date ?? new Date();
            const subject = msg.envelope?.subject ?? "";

            let body = '';
            let messageId: string | null = null;

            if (msg.source) {
              try {
                const parsed = await simpleParser(msg.source as Buffer);
                body = String(parsed.text || parsed.html || "").slice(0, 2000);
                messageId = parsed.messageId ?? null;
              } catch {
                body = Buffer.isBuffer(msg.source)
                  ? msg.source.toString("utf8").slice(0, 2000)
                  : String(msg.source).slice(0, 2000);
              }
            }

            const dedupeKey = makeDedupeKey({
              messageId,
              folder,
              from,
              subject,
              receivedAt
            });

            await pool.query(
              `INSERT INTO emails 
              (mailbox_id, mailbox_email, source, subject, body, folder, received_at, message_id, dedupe_key)
              VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
              ON CONFLICT DO NOTHING`,
              [
                mailbox.id,
                mailbox.email,
                matchedSource,
                subject || null,
                body,
                folder,
                receivedAt,
                messageId,
                dedupeKey
              ]
            );
          }
        }
      }

      await pool.query(
        `UPDATE mailboxes
         SET
           last_checked_at = NOW(),
           last_success_at = NOW(),
           last_error = NULL,
           consecutive_failures = 0,
           updated_at = NOW()
         WHERE id = $1`,
        [mailbox.id]
      );

      console.log("Done mailbox:", mailbox.email);
    } catch (error: unknown) {
      const lastError = formatImapError(mailbox, error);
      await pool.query(
        `UPDATE mailboxes
         SET
           last_checked_at = NOW(),
           last_error = $2,
           consecutive_failures = consecutive_failures + 1,
           updated_at = NOW()
         WHERE id = $1`,
        [mailbox.id, lastError]
      );

      console.error("Error checking mailbox:", mailbox.email, error);
    } finally {
      if (client) {
        try {
          await client.logout();
        } catch {
          // ignore logout errors
        }
      }
    }
  }
}
