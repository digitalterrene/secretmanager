//lib/security.ts
import crypto from "crypto";
import { cookies } from "next/headers";

const SECURE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 60 * 60 * 24, // 1 day
};

export async function generateRequestFingerprint(
  req: Request
): Promise<string> {
  const SERVER_SECRET = process.env.SECRET;
  if (!SERVER_SECRET) {
    throw new Error("Server secret is not configured");
  }

  const fingerprintData = [
    req.headers.get("user-agent"),
    req.headers.get("accept-language"),
    req.headers.get("x-forwarded-for"),
  ].join("|");

  // Convert secret to CryptoKey
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SERVER_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Sign the fingerprint data
  const signature = await crypto.subtle.sign(
    "HMAC",
    keyMaterial,
    encoder.encode(fingerprintData)
  );
  // Convert ArrayBuffer to hex string
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function setSecurityHeaders(): Headers {
  const headers = new Headers();
  headers.set("Content-Security-Policy", "default-src 'self'");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-XSS-Protection", "1; mode=block");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return headers;
}

export async function setSecureCookie(fingerprint: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("secret-gen-fp", fingerprint, SECURE_COOKIE_OPTIONS);
}

export function validateInputs(
  phrase: unknown,
  timestamp: unknown
): string | null {
  if (typeof phrase !== "string" || typeof timestamp !== "string") {
    return "Invalid input types. Both phrase and timestamp must be strings.";
  }

  if (phrase.length < 12) {
    return "Passphrase must be at least 12 characters long.";
  }

  if (!/[a-z]/.test(phrase)) {
    return "Passphrase must contain at least one lowercase letter.";
  }

  if (!/[A-Z]/.test(phrase)) {
    return "Passphrase must contain at least one uppercase letter.";
  }

  if (!/\d/.test(phrase)) {
    return "Passphrase must contain at least one number.";
  }

  if (!/[^\w\s]/.test(phrase)) {
    return "Passphrase must contain at least one special character.";
  }

  if (!/^\d{13}$/.test(timestamp)) {
    return "Invalid timestamp. It should be a 13-digit Unix timestamp.";
  }

  const timestampNum = parseInt(timestamp, 10);
  const now = Date.now();
  const oneHourAgo = now - 3600000;
  const oneHourFromNow = now + 3600000;

  if (timestampNum < oneHourAgo || timestampNum > oneHourFromNow) {
    return "Timestamp is too far in the past or future. Please use a current timestamp.";
  }

  return null;
}

export async function generateDeterministicSecret(
  phrase: string,
  timestamp: string
): Promise<string> {
  const SERVER_SECRET = process.env.SECRET;
  const PEPPER = process.env.PEPPER || "";

  if (!SERVER_SECRET) {
    throw new Error("Server secret is not configured");
  }

  const encoder = new TextEncoder();
  let result = `${phrase}${PEPPER}${timestamp}${SERVER_SECRET}`;

  // Convert secret to CryptoKey
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SERVER_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  for (let i = 0; i < 10000; i++) {
    const signature = await crypto.subtle.sign(
      "HMAC",
      keyMaterial,
      encoder.encode(result)
    );
    // Convert ArrayBuffer to hex string
    result = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  return result;
}
