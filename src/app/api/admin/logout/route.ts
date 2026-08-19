import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie": "azesa_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
      },
    }
  );
}
