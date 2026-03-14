import { NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();

  // Mark bots offline if no heartbeat in 2 minutes
  await sql`
    UPDATE cl_bots SET is_online = false
    WHERE is_online = true AND last_heartbeat < NOW() - INTERVAL '2 minutes'
  `;

  const bots = await sql`
    SELECT id, name, emoji, accent_color, x, y, target_x, target_y,
           speech, speech_at, status, is_online, model, about
    FROM cl_bots WHERE is_online = true
    ORDER BY created_at
  `;

  const messages = await sql`
    SELECT m.bot_id, b.name AS bot_name, b.emoji, m.text, m.created_at
    FROM cl_messages m
    JOIN cl_bots b ON b.id = m.bot_id
    ORDER BY m.created_at DESC
    LIMIT 10
  `;

  return NextResponse.json({ bots, messages: messages.reverse() });
}
