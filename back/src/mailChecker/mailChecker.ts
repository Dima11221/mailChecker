import { ImapFlow } from "imapflow";
import { pool } from "../db/db";
import { simpleParser } from "mailparser";
import { decryptSecret } from "../crypto";
import {
  MAIL_FOLDERS,
  MAIL_SOURCES,
  MAX_UNSEEN_PER_MAILBOX,
} from "../env";

type MailboxRow = {
  id: number;
  email: string;
  host: string;
  port: number;
  secure: boolean;
  login: string;
  password_encrypted: string;
};

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
        socketTimeout: 300000
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
    } catch (error: any) {
      await pool.query(
        `UPDATE mailboxes
         SET
           last_checked_at = NOW(),
           last_error = $2,
           consecutive_failures = consecutive_failures + 1,
           updated_at = NOW()
         WHERE id = $1`,
        [mailbox.id, String(error?.message ?? "Unknown error").slice(0, 1000)]
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
