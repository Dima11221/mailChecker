import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db/db";
import { JWT_SECRET } from "../config/env";
import { AuthRequest } from "../types/authTypes";
import { loginSchema } from "../validators";

type UserRow = {
  id: number;
  email: string;
  password_hash: string;
  name: string | null;
};

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e: { message: string }) => e.message).join("; ") || "Неверные данные";
    return res.status(400).json({ error: msg });
  }
  const { email, password } = parsed.data;

  const { rows } = await pool.query<UserRow>(
    `SELECT id, email, password_hash, name
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email]
  );

  const user = rows[0];
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "12h" }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
}

export async function me(req: Request, res: Response) {
  const authReq = req as AuthRequest;

  const { rows } = await pool.query<{
    id: number;
    email: string;
    name: string | null;
    created_at: string;
  }>(
    `SELECT id, email, name, created_at
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [authReq.user.id]
  );

  const user = rows[0];
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({ user });
}
