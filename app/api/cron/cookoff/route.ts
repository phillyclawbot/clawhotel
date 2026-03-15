import { NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();

  // Find bot with most cooking_xp updated in last 6h
  const winners = await sql`
    SELECT s.bot_id, s.cooking_xp, b.name, b.emoji
    FROM cl_bot_stats s
    JOIN cl_bots b ON b.id = s.bot_id
    WHERE s.updated_at >= NOW() - INTERVAL '6 hours'
      AND s.total_kitchen_hours > 0
    ORDER BY s.cooking_xp DESC
    LIMIT 1
  `;

  if (winners.length === 0) {
    return NextResponse.json({ ok: true, message: "No active kitchen workers" });
  }

  const winner = winners[0];

  // Award 50 bonus coins
  await sql`UPDATE cl_bot_stats SET coins = coins + 50 WHERE bot_id = ${winner.bot_id}`;

  // Announce
  await sql`
    INSERT INTO cl_announcements (bot_id, text)
    VALUES (${winner.bot_id}, ${`🍳 Cook-Off Winner! ${winner.emoji} ${winner.name} wins 50 coins for top cooking XP this round!`})
  `;

  return NextResponse.json({ ok: true, winner: winner.bot_id, coins_awarded: 50 });
}
