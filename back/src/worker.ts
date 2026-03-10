import cron from "node-cron";
import { pool } from "./db/db";
import { MAIL_CHECK_CRON } from "./env";
import { checkMailboxes } from "./mailChecker/mailChecker";

const LOCK_ID = 741852963;

async function runMailJob() {
  const { rows } = await pool.query<{ locked: boolean }>(
    "SELECT pg_try_advisory_lock($1) AS locked",
    [LOCK_ID]
  );

  if (!rows[0]?.locked) {
    console.log("Mail job skipped: lock is already held");
    return;
  }

  try {
    await checkMailboxes();
  } finally {
    await pool.query("SELECT pg_advisory_unlock($1)", [LOCK_ID]);
  }
}

cron.schedule(MAIL_CHECK_CRON, async () => {
  console.log("Checking mailboxes...");
  await runMailJob();
});

runMailJob().catch((error) => {
  console.error("Initial mail job failed", error);
});
