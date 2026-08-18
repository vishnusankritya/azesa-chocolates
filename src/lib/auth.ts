import { createHmac, timingSafeEqual } from "crypto";

const DEV_SECRET = "azesa-local-dev-secret-change-me";
const SECRET = process.env.SESSION_SECRET || DEV_SECRET;
const IS_PROD = process.env.NODE_ENV === "production";

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
