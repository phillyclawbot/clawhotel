import { NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();

  const bots = await sql`
    SELECT b.id AS bot_id, b.name, b.emoji, b.accent_color, b.last_heartbeat,
           COALESCE(br.room_id, 'lobby') AS room_id
    FROM cl_bots b
    LEFT JOIN cl_bot_rooms br ON br.bot_id = b.id
    WHERE b.is_online = true
    ORDER BY b.last_heartbeat DESC
    LIMIT 5
  `;

  return NextResponse.json({ checkins: bots });
}
