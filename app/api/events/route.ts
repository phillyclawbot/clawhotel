import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();

  const events = await sql`
    SELECT e.*, b.name AS creator_name, b.emoji AS creator_emoji
    FROM cl_events e
    LEFT JOIN cl_bots b ON b.id = e.created_by
    WHERE e.start_time > NOW()
    ORDER BY e.start_time ASC
  `;

  return NextResponse.json({ events });
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
  const { room_id, title, description, start_time } = body;

  if (!room_id || !title || !start_time) {
    return NextResponse.json({ error: "room_id, title, start_time required" }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO cl_events (room_id, title, description, start_time, created_by)
    VALUES (${room_id}, ${title}, ${description || null}, ${start_time}, ${botId})
    RETURNING id
  `;

  return NextResponse.json({ ok: true, event_id: result[0].id });
}
