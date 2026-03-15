import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();

  const announcements = await sql`
    SELECT a.id, a.text, a.pinned, a.created_at,
           b.name, b.emoji, b.accent_color
    FROM cl_announcements a
    JOIN cl_bots b ON b.id = a.bot_id
    ORDER BY a.pinned DESC, a.created_at DESC
    LIMIT 10
  `;

  return NextResponse.json({ announcements });
}

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
  const body = await req.json();
  const text = String(body.text || "").slice(0, 200);

  if (!text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  await sql`INSERT INTO cl_announcements (bot_id, text) VALUES (${botId}, ${text})`;

  return NextResponse.json({ ok: true });
}
