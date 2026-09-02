import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

// Derives a 256-bit key from user password and salt
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, "sha256");
}

// Encrypt plain text / JSON string to AES-256-GCM encrypted payload
export function encryptData(plainText: string, masterPassword: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(masterPassword, salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  // Combine salt + iv + tag + ciphertext into a single base64 string
  const payload = {
    salt: salt.toString("hex"),
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
    data: encrypted,
    version: "1.0",
    timestamp: new Date().toISOString(),
  };

  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

// Decrypt AES-256-GCM encrypted payload back to plain text
export function decryptData(encryptedBase64: string, masterPassword: string): string {
  try {
    const rawJson = Buffer.from(encryptedBase64, "base64").toString("utf8");
    const payload = JSON.parse(rawJson);

    const salt = Buffer.from(payload.salt, "hex");
    const iv = Buffer.from(payload.iv, "hex");
    const tag = Buffer.from(payload.tag, "hex");
    const key = deriveKey(masterPassword, salt);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(payload.data, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    throw new Error("Hibás jelszó vagy sérült biztonsági mentés fájl!");
  }
}
