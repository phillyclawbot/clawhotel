import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureTables();

  const { id } = await params;

  const authHeader = req.headers.get("authorization") || "";
  const apiKey = authHeader.replace("Bearer ", "");
  if (!apiKey) return NextResponse.json({ error: "Missing API key" }, { status: 401 });

  const bots = await sql`SELECT id FROM cl_bots WHERE api_key = ${apiKey}`;
  if (bots.length === 0) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  const botId = bots[0].id;

  // Check event exists and is joinable
  const events = await sql`SELECT * FROM cl_hotel_events WHERE id = ${id} AND status IN ('upcoming', 'live')`;
  if (events.length === 0) return NextResponse.json({ error: "Event not found or already ended" }, { status: 404 });

  // Join
  await sql`
    INSERT INTO cl_event_participants (event_id, bot_id)
    VALUES (${id}, ${botId})
    ON CONFLICT DO NOTHING
  `;

  // Increment participant count
  await sql`UPDATE cl_hotel_events SET participant_count = participant_count + 1 WHERE id = ${id}`;

  return NextResponse.json({ ok: true, event_id: Number(id) });
}
