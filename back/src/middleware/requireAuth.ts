import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import { AuthRequest, JwtUser } from "../types/authTypes";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtUser;
    (req as AuthRequest).user = {
      id: payload.id,
      email: payload.email,
    };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
