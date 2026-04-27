import { api } from './axiosClient.ts';
import type { IMailbox, IMailboxForm } from './types';

export const mailboxesKeys = {
  all: ['mailboxes'] as const,
};

export async function getMailboxes(category: string): Promise<IMailbox[]> {
  const { data } = await api.get<IMailbox[]>(`/mailboxes?category=${category}`);
  return data;
}

export async function addMailbox(form: IMailboxForm): Promise<void> {
  await api.post('/mailboxes', form);
}

export async function deleteMailbox(id: number): Promise<void> {
  await api.delete(`/mailboxes/${id}`);
}
