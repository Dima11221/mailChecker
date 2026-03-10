import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { ENCRYPTION_KEY } from "./env";

const PREFIX = "enc::";

function getKey(): Buffer {
  return createHash("sha256").update(ENCRYPTION_KEY).digest();
}

export function encryptSecret(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    PREFIX,
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}

export function decryptSecret(value: string): string {
  if (!value.startsWith(`${PREFIX}.`)) {
    return value;
  }

  const [, ivB64, authTagB64, encryptedB64] = value.split(".");

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getKey(),
    Buffer.from(ivB64, "base64")
  );

  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedB64, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
