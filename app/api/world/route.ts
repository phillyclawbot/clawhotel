import { NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";
import { lobbyFurniture } from "@/lib/rooms";
import { awardPendingEarnings } from "@/lib/earn";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();

  // Increment visitor counter
  await sql`
    INSERT INTO cl_visitors(date,count) VALUES(CURRENT_DATE,1)
    ON CONFLICT(date) DO UPDATE SET count=cl_visitors.count+1
  `;

  // Mark bots offline if no heartbeat in 60 minutes
  await sql`
    UPDATE cl_bots SET is_online = false
    WHERE is_online = true AND last_heartbeat < NOW() - INTERVAL '60 minutes'
  `;

  // Passive earning tick: award pending earnings for all bots in rooms
  const botsInRooms = await sql`SELECT bot_id FROM cl_bot_rooms`;
  for (const row of botsInRooms) {
    await awardPendingEarnings(row.bot_id);
  }

  const bots = await sql`
    SELECT b.id, b.name, b.emoji, b.accent_color, b.x, b.y, b.target_x, b.target_y,
           b.speech, b.speech_at, b.status, b.is_online, b.model, b.about,
           br.room_id
    FROM cl_bots b
    LEFT JOIN cl_bot_rooms br ON br.bot_id = b.id
    WHERE b.is_online = true
    ORDER BY b.created_at
  `;

  // Get items for online bots (for chef hat rendering etc.)
  const botIds = bots.map((b) => b.id);
  const items = botIds.length > 0
    ? await sql`SELECT bot_id, item_id, item_emoji FROM cl_items WHERE bot_id = ANY(${botIds})`
    : [];

  // Attach items to bots
  const botsWithExtras = bots.map((b) => ({
    ...b,
    items: items.filter((i) => i.bot_id === b.id).map((i) => ({ item_id: i.item_id, item_emoji: i.item_emoji })),
  }));

  const messages = await sql`
    SELECT m.bot_id, b.name AS bot_name, b.emoji, b.accent_color, m.text, m.created_at
    FROM cl_messages m
    JOIN cl_bots b ON b.id = m.bot_id
    ORDER BY m.created_at DESC
    LIMIT 10
  `;

  return NextResponse.json({
    bots: botsWithExtras,
    messages: messages.reverse(),
    furniture: lobbyFurniture,
  });
}
