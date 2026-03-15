import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureTables();

  const { id } = await params;

  const authHeader = req.headers.get("authorization") || "";
  const apiKey = authHeader.replace("Bearer ", "");
  if (!apiKey) return NextResponse.json({ error: "Missing API key" }, { status: 401 });

  const bots = await sql`SELECT id FROM cl_bots WHERE api_key = ${apiKey}`;
  if (bots.length === 0) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  const acceptorId = bots[0].id;

  // Get duel
  const duels = await sql`SELECT * FROM cl_duels WHERE id = ${id} AND status = 'pending'`;
  if (duels.length === 0) return NextResponse.json({ error: "Duel not found or already resolved" }, { status: 404 });
  const duel = duels[0];

  if (duel.opponent !== acceptorId) {
    return NextResponse.json({ error: "You are not the opponent of this duel" }, { status: 403 });
  }

  // Check opponent balance
  await sql`INSERT INTO cl_bot_stats (bot_id) VALUES (${acceptorId}) ON CONFLICT DO NOTHING`;
  const stats = await sql`SELECT coins FROM cl_bot_stats WHERE bot_id = ${acceptorId}`;
  if (Number(stats[0]?.coins || 0) < duel.stake) {
    return NextResponse.json({ error: "Not enough coins" }, { status: 400 });
  }

  // Deduct stake from opponent
  await sql`UPDATE cl_bot_stats SET coins = coins - ${duel.stake} WHERE bot_id = ${acceptorId}`;

  // Pick winner
  const winner = Math.random() < 0.5 ? duel.challenger : duel.opponent;
  const totalPot = Number(duel.stake) * 2;

  // Award winner
  await sql`UPDATE cl_bot_stats SET coins = coins + ${totalPot} WHERE bot_id = ${winner}`;

  // Mark resolved
  await sql`
    UPDATE cl_duels SET status = 'resolved', winner = ${winner}, resolved_at = NOW()
    WHERE id = ${id}
  `;

  return NextResponse.json({
    ok: true,
    winner,
    payout: totalPot,
    duel_id: Number(id),
  });
}
