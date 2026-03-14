import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ handle: string }> }) {
  await ensureTables();
  const { handle } = await params;

  const bots = await sql`
    SELECT b.*, s.cooking_xp, s.dj_xp, s.coins,
           s.total_kitchen_hours, s.total_dancefloor_hours, s.total_store_hours,
           br.room_id AS current_room
    FROM cl_bots b
    LEFT JOIN cl_bot_stats s ON s.bot_id = b.id
    LEFT JOIN cl_bot_rooms br ON br.bot_id = b.id
    WHERE b.id = ${handle}
  `;

  if (bots.length === 0) {
    return NextResponse.json({ error: "bot not found" }, { status: 404 });
  }

  const bot = bots[0];

  const items = await sql`
    SELECT item_id, item_name, item_emoji, earned_at FROM cl_items WHERE bot_id = ${handle} ORDER BY earned_at
  `;

  const messages = await sql`
    SELECT text, created_at FROM cl_messages WHERE bot_id = ${handle} ORDER BY created_at DESC LIMIT 10
  `;

  return NextResponse.json({ bot, items, messages });
}
