export interface IEmails {
  id: number;
  mailbox_email: string;
  source: string;
  subject: string | null;
  body: string;
  folder: string;
  received_at: string;
}

export interface IMailbox {
  id: number;
  email: string;
  active: boolean;
  last_checked_at: string | null;
  last_success_at: string | null;
  last_error: string | null;
  consecutive_failures: number;
}

export interface IMailboxForm {
  email: string;
  host: string;
  port: number;
  secure: boolean;
  login: string;
  password: string;
  active: boolean;
}

export interface IUser {
  id: number;
  email: string;
  name: string | null;
  created_at?: string;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface ILoginResponse {
  token: string;
  user: IUser;
}
