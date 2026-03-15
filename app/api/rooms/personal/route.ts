import { NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();

  const result = await sql`
    SELECT cr.bot_id, cr.room_name, cr.accent_color, cr.description,
           b.name as bot_name, b.emoji, b.is_online,
           br.room_id as current_room
    FROM cl_bot_rooms_custom cr
    JOIN cl_bots b ON b.id = cr.bot_id
    LEFT JOIN cl_bot_rooms br ON br.bot_id = cr.bot_id
    ORDER BY b.is_online DESC, cr.created_at ASC
  `;

  return NextResponse.json({
    rooms: result.map((r) => ({
      bot_id: r.bot_id,
      room_id: `bot_room_${r.bot_id}`,
      room_name: r.room_name,
      accent_color: r.accent_color,
      description: r.description,
      bot_name: r.bot_name,
      emoji: r.emoji,
      is_online: r.is_online,
      is_home: r.current_room === `bot_room_${r.bot_id}`,
    })),
  });
}
