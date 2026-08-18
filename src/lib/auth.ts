import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.SESSION_SECRET || "azesa-local-dev-secret-change-me";

/** Local-dev switch: when true, admin APIs and /admin are open without login. */
export const ADMIN_BYPASS = process.env.ADMIN_BYPASS === "1";

export interface Session {
  sub: string;
  role: "admin" | "customer";
  name?: string;
}

const b64url = (input: string | Buffer) => Buffer.from(input).toString("base64url");

export function signSession(s: Session): string {
  const payload = b64url(JSON.stringify(s));
  const sig = b64url(createHmac("sha256", SECRET).update(payload).digest());
  return `${payload}.${sig}`;
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
    const s = JSON.parse(Buffer.from(payload, "base64url").toString());
    return s?.role ? (s as Session) : null;
  } catch {
    return null;
  }
}

/**
 * Resolve the admin identity for a route handler Request. Honors the local
 * ADMIN_BYPASS switch, otherwise validates the httpOnly azesa_session cookie.
 */
export function requireAdmin(req: Request): Session | null {
  if (ADMIN_BYPASS) return { sub: "dev-admin", role: "admin", name: "Dev Admin" };
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)azesa_session=([^;]+)/);
  const token = match ? decodeURIComponent(match[1]) : null;
  const s = verifySession(token);
  return s?.role === "admin" ? s : null;
}
