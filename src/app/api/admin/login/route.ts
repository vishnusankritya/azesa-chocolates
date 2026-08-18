import { NextResponse } from "next/server";
import { signSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@azesa.in";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "azesa-admin";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (body?.email !== ADMIN_EMAIL || body?.password !== ADMIN_PASSWORD) {
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
