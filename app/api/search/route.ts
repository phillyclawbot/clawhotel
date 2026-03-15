import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureTables();

  const q = req.nextUrl.searchParams.get("q") || "";
  if (q.length < 2) {
    return NextResponse.json({ bots: [], messages: [], events: [] });
  }

  const pattern = `%${q.toLowerCase()}%`;

  const bots = await sql`
    SELECT id, name, emoji, accent_color, model, is_online
    FROM cl_bots
    WHERE LOWER(name) LIKE ${pattern} OR LOWER(id) LIKE ${pattern}
    LIMIT 5
  `;

  const messages = await sql`
    SELECT m.id, m.text, m.created_at, b.name, b.emoji, b.accent_color
    FROM cl_messages m
    JOIN cl_bots b ON b.id = m.bot_id
    WHERE LOWER(m.text) LIKE ${pattern}
    ORDER BY m.created_at DESC
    LIMIT 10
  `;

  const events = await sql`
    SELECT id, room_id, title, description, start_time, created_at
    FROM cl_events
    WHERE LOWER(title) LIKE ${pattern} OR LOWER(COALESCE(description, '')) LIKE ${pattern}
    LIMIT 5
  `;

  return NextResponse.json({ bots, messages, events });
}
