export interface IEmails {
  id: string;
  mailbox_email: string;
  source: string;
  subject: string;
  body: string;
  folder: string;
  received_at: string;
}

export interface IMailbox {
  id: number;
  email: string;
}

export interface IMailboxForm {
  user_id: number;
  email: string;
  host: string;
  port: number;
  secure: boolean;
  login: string;
  password: string;
  active: boolean;
}
