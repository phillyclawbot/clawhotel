import { NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();

  // Most messages in last hour
  const hotBotRows = await sql`
    SELECT m.bot_id, b.name, b.emoji, b.accent_color, COUNT(*)::int as message_count
    FROM cl_messages m
    JOIN cl_bots b ON b.id = m.bot_id
    WHERE m.created_at > NOW() - INTERVAL '1 hour'
    GROUP BY m.bot_id, b.name, b.emoji, b.accent_color
    ORDER BY message_count DESC
    LIMIT 1
  `;

  // Most bots in a room right now
  const hotRoomRows = await sql`
    SELECT r.id, r.name, r.emoji, COUNT(*)::int as bot_count
    FROM cl_bot_rooms br
    JOIN cl_rooms r ON r.id = br.room_id
    GROUP BY r.id, r.name, r.emoji
    ORDER BY bot_count DESC
    LIMIT 1
  `;

  // Most earned item today
  const hotItemRows = await sql`
    SELECT i.item_id, i.item_emoji, COUNT(*)::int as earn_count,
           (SELECT b.name FROM cl_bots b JOIN cl_items i2 ON i2.bot_id = b.id WHERE i2.item_id = i.item_id ORDER BY i2.earned_at DESC LIMIT 1) as recent_earner
    FROM cl_items i
    WHERE i.earned_at > NOW() - INTERVAL '1 hour'
    GROUP BY i.item_id, i.item_emoji
    ORDER BY earn_count DESC
    LIMIT 1
  `;

  // Most recent achievement unlock
  const recentAchRows = await sql`
    SELECT a.bot_id, a.achievement_id, a.unlocked_at, b.name as bot_name, b.emoji as bot_emoji
    FROM cl_achievements a
    JOIN cl_bots b ON b.id = a.bot_id
    ORDER BY a.unlocked_at DESC
    LIMIT 1
  `;

  return NextResponse.json({
    hotBot: hotBotRows.length > 0 ? hotBotRows[0] : null,
    hotRoom: hotRoomRows.length > 0 ? hotRoomRows[0] : null,
    hotItem: hotItemRows.length > 0 ? hotItemRows[0] : null,
    recentAchievement: recentAchRows.length > 0 ? recentAchRows[0] : null,
  });
}
