import bcrypt from "bcrypt";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-dev-key-change-in-production";
const SALT_ROUNDS = 10;

/**
 * Encrypt sensitive data (API keys, tokens) using bcrypt
 * @param data - The plaintext data to encrypt
 * @returns Encrypted hash
 */
export async function encryptData(data: string): Promise<string> {
  try {
    const hash = await bcrypt.hash(data, SALT_ROUNDS);
    return hash;
  } catch (error) {
    console.error("[Crypto] Failed to encrypt data:", error);
    throw new Error("Encryption failed");
  }
}

/**
 * Verify encrypted data against plaintext
 * @param plaintext - The plaintext to verify
 * @param hash - The encrypted hash to compare against
 * @returns true if plaintext matches hash, false otherwise
 */
export async function verifyData(plaintext: string, hash: string): Promise<boolean> {
  try {
    const isMatch = await bcrypt.compare(plaintext, hash);
    return isMatch;
  } catch (error) {
    console.error("[Crypto] Failed to verify data:", error);
    return false;
  }
}

/**
 * Simple XOR-based encryption for reversible encryption (for decryption purposes)
 * NOTE: This is for development/demo purposes. For production, use proper encryption like AES-256.
 * @param text - The plaintext to encrypt
 * @param key - The encryption key
 * @returns Base64-encoded encrypted text
 */
export function encryptReversible(text: string, key: string = ENCRYPTION_KEY): string {
  const keyBuffer = Buffer.from(key);
  const textBuffer = Buffer.from(text);
  const encrypted = Buffer.alloc(textBuffer.length);

  for (let i = 0; i < textBuffer.length; i++) {
    encrypted[i] = textBuffer[i] ^ keyBuffer[i % keyBuffer.length];
  }

  return encrypted.toString("base64");
}

/**
 * Decrypt reversible encryption
 * @param encryptedText - The base64-encoded encrypted text
 * @param key - The encryption key
 * @returns Decrypted plaintext
 */
export function decryptReversible(encryptedText: string, key: string = ENCRYPTION_KEY): string {
  const keyBuffer = Buffer.from(key);
  const encryptedBuffer = Buffer.from(encryptedText, "base64");
  const decrypted = Buffer.alloc(encryptedBuffer.length);

  for (let i = 0; i < encryptedBuffer.length; i++) {
    decrypted[i] = encryptedBuffer[i] ^ keyBuffer[i % keyBuffer.length];
  }

  return decrypted.toString("utf-8");
}
