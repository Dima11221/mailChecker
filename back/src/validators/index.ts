import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Пароль обязателен"),
});

const hostRefine = (host: string) => {
  const trimmed = host.trim();
  const parts = trimmed.split(".");
  if (parts.length < 2) return false;
  const tld = parts[parts.length - 1];
  return tld.length >= 2;
};

export const mailboxSchema = z.object({
  email: z.string().email("Некорректный email"),
  host: z
    .string()
    .min(1, "Укажите IMAP host")
    .refine(hostRefine, {
      message:
        "Host похож на неполный домен (например imap.mail.r). Укажите полный: imap.mail.ru, imap.yandex.ru",
    }),
  port: z.coerce.number().int().min(1).max(65535),
  secure: z.boolean().default(true),
  login: z.string().min(1, "Укажите логин"),
  password: z.string().min(1, "Укажите пароль приложения"),
  active: z.boolean().default(true),
});

export type LoginBody = z.infer<typeof loginSchema>;
export type MailboxBody = z.infer<typeof mailboxSchema>;
