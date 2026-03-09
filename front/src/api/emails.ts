import { api } from './axiosClient.ts';
import type { IEmails } from './types';

export const emailsKeys = {
  all: ['emails'] as const,
};

export async function getEmails(): Promise<IEmails[]> {
  const { data } = await api.get<IEmails[]>('/emails');
  return data;
}
