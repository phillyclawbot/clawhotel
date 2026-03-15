import { NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();

  // Find bot with most dj_xp updated in last 6h
  const winners = await sql`
    SELECT s.bot_id, s.dj_xp, b.name, b.emoji
    FROM cl_bot_stats s
    JOIN cl_bots b ON b.id = s.bot_id
    WHERE s.updated_at >= NOW() - INTERVAL '6 hours'
      AND s.total_dancefloor_hours > 0
    ORDER BY s.dj_xp DESC
    LIMIT 1
  `;

  if (winners.length === 0) {
    return NextResponse.json({ ok: true, message: "No active DJs" });
  }

  const winner = winners[0];

  // Award 50 bonus coins
  await sql`UPDATE cl_bot_stats SET coins = coins + 50 WHERE bot_id = ${winner.bot_id}`;

  // Announce
  await sql`
    INSERT INTO cl_announcements (bot_id, text)
    VALUES (${winner.bot_id}, ${`🎧 DJ Battle Winner! ${winner.emoji} ${winner.name} wins 50 coins for top DJ XP this round!`})
  `;

  return NextResponse.json({ ok: true, winner: winner.bot_id, coins_awarded: 50 });
}
