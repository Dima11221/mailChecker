import { ImapFlow } from "imapflow";
import cron from "node-cron";
import { pool } from "../db/db";
import { simpleParser } from "mailparser";

const SOURCES = ["banki.ru", "irecommend.ru"];

const MAX_UNSEEN_PER_MAILBOX = 10;

async function checkMailboxes() {
  const { rows: mailboxes } = await pool.query(
    "SELECT * FROM mailboxes WHERE active = true ORDER BY id"
  );
  console.log("Found mailboxes:", mailboxes.length, mailboxes.map((m: { email: string }) => m.email).join(", "));

  for (const mailbox of mailboxes) {
    try {
      console.log("Processing mailbox:", mailbox.email);
      const client = new ImapFlow({
        host: mailbox.host,
        port: mailbox.port,
        secure: mailbox.secure,
        auth: {
          user: mailbox.login,
          pass: mailbox.password
        },
        tls: { rejectUnauthorized: false },
        socketTimeout: 300000
      });

      await client.connect();

      const folders = ["INBOX", "Spam", "Junk"];

      for (const folder of folders) {
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
            const from = msg.envelope?.from?.[0]?.address || "";
            const matchedSource = SOURCES.find(domain => from.includes(domain));
            if (!matchedSource) continue;

            const { rows: existing } = await pool.query(
              `SELECT 1 FROM emails 
               WHERE mailbox_id = $1 AND subject = $2 AND received_at = $3 LIMIT 1`,
              [mailbox.id, msg.envelope?.subject ?? "", msg.envelope?.date]
            );
            if (existing.length > 0) continue;

            let body = '';
            if (msg.source) {
              try {
                const parsed = await simpleParser(msg.source as Buffer);
                body = (parsed.text || parsed.html || "").slice(0, 2000);
              } catch {
                body = msg.source.toString().slice(0, 2000);
              }

            }

            await pool.query(
              `INSERT INTO emails 
              (mailbox_id, mailbox_email, source, subject, body, folder, received_at)
              VALUES ($1,$2,$3,$4,$5,$6,$7)`,
              [
                mailbox.id,
                mailbox.email,
                matchedSource,
                msg.envelope?.subject,
                body,
                folder,
                msg.envelope?.date
              ]
            );
          }
        }
      }

      await client.logout();
      console.log("Done mailbox:", mailbox.email);
    } catch (error) {
      console.error("Error checking mailbox:", mailbox.email, error);
    }
  }
}

export function startMailCron() {
  cron.schedule("* * * * *", async () => {
    console.log("Checking mailboxes...");
    await checkMailboxes();
  });
}
