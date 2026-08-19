import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";

const DEV_SECRET = "azesa-local-dev-secret-change-me";
const SECRET = process.env.SESSION_SECRET || DEV_SECRET;
const IS_PROD = process.env.NODE_ENV === "production";

// Local-dev defaults (replaced by env in production). The dev password is
// stored only as a bcrypt hash — never as plaintext.
const DEV_ADMIN_EMAIL = "admin@azesa.in";
const DEV_ADMIN_PASSWORD_HASH = "$2b$10$FNFxVWaua8N.WAhyMetUv.jLOPM37LMQoEF0cb9Tb5oMApPsfkcf.";

// Fail fast: never boot into production with the known dev secret.
if (IS_PROD && SECRET === DEV_SECRET) {
  throw new Error("SESSION_SECRET must be set to a strong value in production");
}

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Local-dev switch. Enable with ADMIN_BYPASS=1. Never honored in production.
export const ADMIN_BYPASS =
  process.env.ADMIN_BYPASS === "1" && !IS_PROD;

export interface Session {
  sub: string;
  role: "admin" | "customer";
  name?: string;
  iat?: number;
  exp?: number;
}

const b64url = (input: string | Buffer) => Buffer.from(input).toString("base64url");

export function signSession(s: Session): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    ...s,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const body = b64url(JSON.stringify(payload));
  const sig = b64url(createHmac("sha256", SECRET).update(body).digest());
  return `${body}.${sig}`;
}

export function verifySession(token: string | null | undefined): Session | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = b64url(createHmac("sha256", SECRET).update(payload).digest());
  const a = Buffer.from(sig, "base64url");
  const b = Buffer.from(expected, "base64url");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    if (!s?.role) return null;
    // Reject expired tokens server-side.
    if (typeof s.exp === "number" && s.exp * 1000 < Date.now()) return null;
    return s;
  } catch {
    return null;
  }
}

/**
 * Resolve the admin identity for a route handler Request. Honors the local
 * ADMIN_BYPASS switch (dev only), otherwise validates the httpOnly cookie.
 */
export function requireAdmin(req: Request): Session | null {
  if (ADMIN_BYPASS) return { sub: "dev-admin", role: "admin", name: "Dev Admin" };
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)azesa_session=([^;]+)/);
  const token = match ? decodeURIComponent(match[1]) : null;
  const s = verifySession(token);
  return s?.role === "admin" ? s : null;
}

/** Constant-time string comparison (length-safe): compare HMAC digests. */
function timingSafeEqualString(a: string, b: string): boolean {
  const aDigest = createHmac("sha256", "azesa-cred-compare").update(a).digest();
  const bDigest = createHmac("sha256", "azesa-cred-compare").update(b).digest();
  return timingSafeEqual(aDigest, bDigest);
}

/**
 * Whether admin auth has usable config. In production a strong secret must be
 * set (either a bcrypt hash via ADMIN_PASSWORD_HASH, or ADMIN_PASSWORD).
 */
export function adminConfigured(): boolean {
  if (IS_PROD) {
    return Boolean(process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD);
  }
  return true; // dev ships with a hashed default password
}

/**
 * Verify admin credentials in constant time. Prefers a bcrypt hash
 * (ADMIN_PASSWORD_HASH) so the password is never compared as plaintext; falls
 * back to a plaintext ADMIN_PASSWORD only if no hash is configured. Email is
 * always compared in constant time.
 */
export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const expectedEmail = (process.env.ADMIN_EMAIL || DEV_ADMIN_EMAIL).trim().toLowerCase();
  if (!timingSafeEqualString(email.trim().toLowerCase(), expectedEmail)) return false;

  const hash = process.env.ADMIN_PASSWORD_HASH || (IS_PROD ? undefined : DEV_ADMIN_PASSWORD_HASH);
  if (hash) return bcrypt.compare(password, hash);

  const plain = process.env.ADMIN_PASSWORD || (IS_PROD ? undefined : "");
  if (plain == null || plain === "") return false;
  return timingSafeEqualString(password, plain);
}
