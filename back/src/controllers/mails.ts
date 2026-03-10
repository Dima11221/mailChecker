import { Request, Response } from "express";
import { AuthRequest } from "../authTypes";
import { pool } from "../db/db";
import { encryptSecret } from "../crypto";

export const mails = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const limit = Math.min(Number(req.query.limit ?? 200), 500);

  const { rows } = await pool.query(
    `SELECT
       e.id,
       e.mailbox_email,
       e.source,
       e.subject,
       e.body,
       e.folder,
       e.received_at
     FROM emails e
     JOIN mailboxes m ON m.id = e.mailbox_id
     WHERE m.user_id = $1
     ORDER BY e.received_at DESC
     LIMIT $2`,
    [authReq.user.id, limit]
  );

  res.json(rows);
};

export const getMailBoxes = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;

  const { rows } = await pool.query(
    `SELECT
       id,
       email,
       active,
       last_checked_at,
       last_success_at,
       last_error,
       consecutive_failures
     FROM mailboxes
     WHERE user_id = $1
     ORDER BY id`,
    [authReq.user.id]
  );

  res.json(rows);
};

export const createMailbox = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { email, host, port, secure, login, password, active } = req.body as {
    email?: string;
    host?: string;
    port?: number;
    secure?: boolean;
    login?: string;
    password?: string;
    active?: boolean;
  };

  if (!email || !host || !port || !login || !password) {
    return res.status(400).json({ error: "Invalid mailbox payload" });
  }

  try {
    const encryptedPassword = encryptSecret(password);

    const { rows } = await pool.query(
      `INSERT INTO mailboxes
        (user_id, email, host, port, secure, login, password_encrypted, active, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING id, email, active, last_checked_at, last_success_at, last_error, consecutive_failures`,
      [
        authReq.user.id,
        email,
        host,
        port,
        secure ?? true,
        login,
        encryptedPassword,
        active ?? true
      ]
    );

    res.status(201).json(rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMailbox = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid mailbox id" });
  }

  const result = await pool.query(
    `DELETE FROM mailboxes
     WHERE id = $1 AND user_id = $2`,
    [id, authReq.user.id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Mailbox not found" });
  }

  res.status(204).send();
};