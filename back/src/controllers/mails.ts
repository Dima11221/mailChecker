import { Request, Response, NextFunction } from "express";
import { pool } from "../db/db";

export const mails = async (req: Request, res: Response) => {
  const { rows } = await pool.query(
    "SELECT * FROM emails ORDER BY received_at DESC LIMIT 200"
  );
  res.json(rows);
};

export const getMailBoxes = async (req: Request, res: Response) => {
  const { rows } = await pool.query(
    "SELECT id, email FROM mailboxes"
  );
  res.json(rows);
}

export const createMailbox = async (req: Request, res: Response) => {
  const { user_id, email, host, port, secure, login, password, active } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO mailboxes (user_id, email, host, port, secure, login, password, active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [user_id, email, host, port, secure, login, password, active]
    );
    res.status(201).json(rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMailbox = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  try {
    await pool.query("DELETE FROM mailboxes WHERE id = $1", [id]);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};