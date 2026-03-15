import { NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();

  // Find expired active rivalries
  const expired = await sql`
    SELECT id FROM cl_rivalries WHERE status = 'active' AND end_time <= NOW()
  `;

  let resolved = 0;
  for (const r of expired) {
    try {
      const rivalries = await sql`SELECT * FROM cl_rivalries WHERE id = ${r.id} AND status = 'active'`;
      if (rivalries.length === 0) continue;
      const rivalry = rivalries[0];

      const challengerStats = await sql`SELECT * FROM cl_bot_stats WHERE bot_id = ${rivalry.challenger}`;
      const opponentStats = await sql`SELECT * FROM cl_bot_stats WHERE bot_id = ${rivalry.opponent}`;

      const cStat = challengerStats.length > 0 ? Number(challengerStats[0][rivalry.challenge_type] || 0) : 0;
      const oStat = opponentStats.length > 0 ? Number(opponentStats[0][rivalry.challenge_type] || 0) : 0;

      let winner: string | null = null;
      const totalPot = Number(rivalry.stake) * 2;

      if (cStat > oStat) {
        winner = rivalry.challenger;
        await sql`UPDATE cl_bot_stats SET coins = coins + ${totalPot} WHERE bot_id = ${rivalry.challenger}`;
      } else if (oStat > cStat) {
        winner = rivalry.opponent;
        await sql`UPDATE cl_bot_stats SET coins = coins + ${totalPot} WHERE bot_id = ${rivalry.opponent}`;
      } else {
        await sql`UPDATE cl_bot_stats SET coins = coins + ${rivalry.stake} WHERE bot_id = ${rivalry.challenger}`;
        await sql`UPDATE cl_bot_stats SET coins = coins + ${rivalry.stake} WHERE bot_id = ${rivalry.opponent}`;
      }

      await sql`
        UPDATE cl_rivalries SET status = 'completed', winner = ${winner}, resolved_at = NOW()
        WHERE id = ${r.id}
      `;
      resolved++;
    } catch { /* silent */ }
  }

  return NextResponse.json({ ok: true, resolved });
}
