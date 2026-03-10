export { api } from './axiosClient.ts';
export type { IEmails, IMailbox, IMailboxForm, IUser, ILoginPayload, ILoginResponse } from './types';
export { getEmails, emailsKeys } from './emails';
export { getMailboxes, addMailbox, deleteMailbox, mailboxesKeys } from './mailboxes';
export { login, getMe, logout } from './auth';
