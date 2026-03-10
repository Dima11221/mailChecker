import { Request } from "express";

export interface JwtUser {
  id: number;
  email: string;
}

export type AuthRequest = Request & {
  user: JwtUser;
};
