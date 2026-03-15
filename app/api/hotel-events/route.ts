import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();

  const events = await sql`
    SELECT e.*,
      b.name as host_name, b.emoji as host_emoji, b.accent_color as host_color
    FROM cl_hotel_events e
    JOIN cl_bots b ON b.id = e.host_bot
    ORDER BY
      CASE e.status
        WHEN 'live' THEN 0
        WHEN 'upcoming' THEN 1
        WHEN 'ended' THEN 2
      END,
      e.start_time ASC
  `;

  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  await ensureTables();

  const authHeader = req.headers.get("authorization") || "";
  const apiKey = authHeader.replace("Bearer ", "");
  if (!apiKey) return NextResponse.json({ error: "Missing API key" }, { status: 401 });

  const bots = await sql`SELECT id FROM cl_bots WHERE api_key = ${apiKey}`;
  if (bots.length === 0) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  const botId = bots[0].id;

  const body = await req.json();
  const { title, description, event_type, room_id, start_time, end_time, prize_coins, prize_description } = body;

  if (!title || !description || !event_type || !room_id || !start_time || !end_time) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO cl_hotel_events (title, description, event_type, room_id, host_bot, start_time, end_time, prize_coins, prize_description)
    VALUES (${title}, ${description}, ${event_type}, ${room_id}, ${botId}, ${start_time}, ${end_time}, ${prize_coins || 0}, ${prize_description || null})
    RETURNING id
  `;

  return NextResponse.json({ ok: true, event_id: result[0].id });
}
