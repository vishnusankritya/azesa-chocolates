import { NextResponse } from "next/server";
import { signSession } from "@/lib/auth";
import { isSameOrigin, rateLimit, clientIp } from "@/lib/security";
import { loginSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IS_PROD = process.env.NODE_ENV === "production";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Cross-origin request rejected" }, { status: 403 });
  }
  if (!rateLimit(`login:${clientIp(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  // Fail fast: in production the admin credentials must come from env, not defaults.
  if (IS_PROD && (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@azesa.in";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "azesa-admin";

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const { email, password } = parsed.data;
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const session = signSession({ sub: ADMIN_EMAIL, role: "admin", name: "Admin" });
  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": `azesa_session=${encodeURIComponent(session)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
      },
    }
  );
}
