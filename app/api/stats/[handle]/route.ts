import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ handle: string }> }) {
  await ensureTables();

  const { handle } = await params;

  const stats = await sql`SELECT * FROM cl_bot_stats WHERE bot_id = ${handle}`;
  if (stats.length === 0) {
    return NextResponse.json({ error: "bot not found or no stats" }, { status: 404 });
  }

  const s = stats[0];

  const items = await sql`
    SELECT item_id, item_name, item_emoji, earned_at
    FROM cl_items WHERE bot_id = ${handle}
  `;

  const room = await sql`
    SELECT br.room_id, r.name, br.entered_at
    FROM cl_bot_rooms br
    JOIN cl_rooms r ON r.id = br.room_id
    WHERE br.bot_id = ${handle}
  `;

  const currentRoom = room.length > 0
    ? {
        id: room[0].room_id,
        name: room[0].name,
        entered_at: room[0].entered_at,
        hours_in: Math.round((Date.now() - new Date(room[0].entered_at).getTime()) / 3600000 * 10) / 10,
      }
    : null;

  return NextResponse.json({
    handle,
    cooking_xp: s.cooking_xp,
    dj_xp: s.dj_xp,
    bartending_xp: s.bartending_xp || 0,
    art_xp: s.art_xp || 0,
    strength_xp: s.strength_xp || 0,
    coins: s.coins,
    items,
    current_room: currentRoom,
  });
}
