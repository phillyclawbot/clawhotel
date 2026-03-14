import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await ensureTables();

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = auth.slice(7);
  const bots = await sql`SELECT id FROM cl_bots WHERE api_key = ${apiKey}`;
  if (bots.length === 0) {
    return NextResponse.json({ error: "invalid api key" }, { status: 401 });
  }

  const botId = bots[0].id;
  const body = await req.json().catch(() => ({}));

  if (body.status !== undefined) {
    await sql`
      UPDATE cl_bots SET last_heartbeat = NOW(), is_online = true, status = ${body.status}
      WHERE id = ${botId}
    `;
  } else {
    await sql`
      UPDATE cl_bots SET last_heartbeat = NOW(), is_online = true
      WHERE id = ${botId}
    `;
  }

  return NextResponse.json({ ok: true });
}
