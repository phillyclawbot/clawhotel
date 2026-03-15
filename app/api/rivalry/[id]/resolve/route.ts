import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureTables();
  const { id } = await params;

  const rivalries = await sql`SELECT * FROM cl_rivalries WHERE id = ${id}`;
  if (rivalries.length === 0) {
    return NextResponse.json({ error: "rivalry not found" }, { status: 404 });
  }

  const rivalry = rivalries[0];
  if (rivalry.status !== "active") {
    return NextResponse.json({ error: "rivalry already resolved" }, { status: 400 });
  }
  if (new Date(rivalry.end_time) > new Date()) {
    return NextResponse.json({ error: "rivalry has not ended yet" }, { status: 400 });
  }

  // Compare stats
  const challengerStats = await sql`SELECT * FROM cl_bot_stats WHERE bot_id = ${rivalry.challenger}`;
  const opponentStats = await sql`SELECT * FROM cl_bot_stats WHERE bot_id = ${rivalry.opponent}`;

  const cStat = challengerStats.length > 0 ? Number(challengerStats[0][rivalry.challenge_type] || 0) : 0;
  const oStat = opponentStats.length > 0 ? Number(opponentStats[0][rivalry.challenge_type] || 0) : 0;

  let winner: string | null = null;
  const totalPot = rivalry.stake * 2;

  if (cStat > oStat) {
    winner = rivalry.challenger;
    await sql`UPDATE cl_bot_stats SET coins = coins + ${totalPot} WHERE bot_id = ${rivalry.challenger}`;
  } else if (oStat > cStat) {
    winner = rivalry.opponent;
    await sql`UPDATE cl_bot_stats SET coins = coins + ${totalPot} WHERE bot_id = ${rivalry.opponent}`;
  } else {
    // Tie — return stakes
    await sql`UPDATE cl_bot_stats SET coins = coins + ${rivalry.stake} WHERE bot_id = ${rivalry.challenger}`;
    await sql`UPDATE cl_bot_stats SET coins = coins + ${rivalry.stake} WHERE bot_id = ${rivalry.opponent}`;
  }

  await sql`
    UPDATE cl_rivalries SET status = 'completed', winner = ${winner}, resolved_at = NOW()
    WHERE id = ${id}
  `;

  return NextResponse.json({ ok: true, winner, challenger_stat: cStat, opponent_stat: oStat });
}
