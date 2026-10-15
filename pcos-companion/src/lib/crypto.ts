import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV recommended for GCM

function getMasterKey(): Buffer {
  const hexKey = process.env.ENCRYPTION_MASTER_KEY;
  if (hexKey && hexKey.length === 64) {
    return Buffer.from(hexKey, "hex");
  }
  // Deterministic fallback for dev/testing (32 bytes)
  return crypto.createHash("sha256").update(hexKey || "default-pcos-companion-key-2026").digest();
}

/**
 * Encrypts a sensitive string payload using AES-256-GCM.
 * Output format: iv:authTag:ciphertext (hex encoded)
 */
export function encryptField(plainText: string): string {
  if (!plainText) return plainText;

  const key = getMasterKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM payload.
 * Expects format: iv:authTag:ciphertext
 */
export function decryptField(encryptedPayload: string): string {
  if (!encryptedPayload || !encryptedPayload.includes(":")) {
    return encryptedPayload;
  }

  const parts = encryptedPayload.split(":");
  if (parts.length !== 3) {
    return encryptedPayload;
  }

  const [ivHex, authTagHex, cipherTextHex] = parts;
  const key = getMasterKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(cipherTextHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
