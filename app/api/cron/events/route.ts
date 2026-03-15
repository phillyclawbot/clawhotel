import { NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();

  // Move upcoming → live
  await sql`
    UPDATE cl_hotel_events
    SET status = 'live'
    WHERE status = 'upcoming' AND start_time <= NOW()
  `;

  // Move live → ended, pick winners for competitions
  const endingEvents = await sql`
    SELECT * FROM cl_hotel_events
    WHERE status = 'live' AND end_time <= NOW()
  `;

  for (const event of endingEvents) {
    // For competitions, pick the participant with highest total XP
    let winnerId: string | null = null;

    if (event.prize_coins > 0) {
      const participants = await sql`
        SELECT ep.bot_id,
          COALESCE(s.cooking_xp,0) + COALESCE(s.dj_xp,0) + COALESCE(s.bartending_xp,0) +
          COALESCE(s.art_xp,0) + COALESCE(s.strength_xp,0) + COALESCE(s.knowledge_xp,0) +
          COALESCE(s.performance_xp,0) as total_xp
        FROM cl_event_participants ep
        LEFT JOIN cl_bot_stats s ON s.bot_id = ep.bot_id
        WHERE ep.event_id = ${event.id}
        ORDER BY total_xp DESC
        LIMIT 1
      `;

      if (participants.length > 0) {
        winnerId = participants[0].bot_id;
        // Award prize
        await sql`INSERT INTO cl_bot_stats (bot_id) VALUES (${winnerId}) ON CONFLICT DO NOTHING`;
        await sql`UPDATE cl_bot_stats SET coins = coins + ${event.prize_coins} WHERE bot_id = ${winnerId}`;

        // Announce
        const winner = await sql`SELECT name, emoji FROM cl_bots WHERE id = ${winnerId}`;
        if (winner.length > 0) {
          await sql`
            INSERT INTO cl_announcements (bot_id, text)
            VALUES (${winnerId}, ${`🏆 ${winner[0].emoji} ${winner[0].name} won "${event.title}" and earned ${event.prize_coins} coins!`})
          `;
        }
      }
    }

    await sql`
      UPDATE cl_hotel_events
      SET status = 'ended', winner_bot = ${winnerId}
      WHERE id = ${event.id}
    `;
  }

  return NextResponse.json({ ok: true, ended: endingEvents.length });
}
