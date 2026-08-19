import { NextResponse } from "next/server";
import { signSession, adminConfigured, verifyAdminCredentials } from "@/lib/auth";
import { isSameOrigin, rateLimit, clientIp } from "@/lib/security";
import { loginSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Cross-origin request rejected" }, { status: 403 });
  }
  if (!rateLimit(`login:${clientIp(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  // Fail fast: in production the admin secret must be configured.
  if (!adminConfigured()) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }

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
  // Constant-time (bcrypt) verification; same 401 for bad email or password so
  // the response reveals nothing.
  const ok = await verifyAdminCredentials(email, password);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const session = signSession({ sub: email, role: "admin", name: "Admin" });
  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": `azesa_session=${encodeURIComponent(session)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
      },
    }
  );
}
