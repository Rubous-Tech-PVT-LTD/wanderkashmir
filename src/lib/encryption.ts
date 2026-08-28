import crypto from "crypto";

// Require exactly 32 bytes (64 hex characters) for AES-256
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; 
const ALGORITHM = "aes-256-gcm";

if (!ENCRYPTION_KEY || Buffer.from(ENCRYPTION_KEY, "hex").length !== 32) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("CRITICAL SECURITY ERROR: ENCRYPTION_KEY is missing or invalid in production environment.");
  }
  console.warn("WARNING: ENCRYPTION_KEY is not set or is not 32 bytes. Using an insecure fallback key for development only.");
}

const keyBuffer = ENCRYPTION_KEY && Buffer.from(ENCRYPTION_KEY, "hex").length === 32
  ? Buffer.from(ENCRYPTION_KEY, "hex")
  : crypto.scryptSync("fallback-secret-key-development", "salt", 32);

export function encryptString(text: string): string {
  const iv = crypto.randomBytes(12); // 96-bit IV is standard for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");
  
  // Format: iv:encryptedData:authTag
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

export function decryptString(encryptedText: string): string {
  const [ivHex, encryptedHex, authTagHex] = encryptedText.split(":");
  
  if (!ivHex || !encryptedHex || !authTagHex) {
    throw new Error("Invalid encrypted text format");
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM, 
    keyBuffer, 
    Buffer.from(ivHex, "hex")
  );
  
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}
