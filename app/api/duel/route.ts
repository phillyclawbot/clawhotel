import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await ensureTables();

  const authHeader = req.headers.get("authorization") || "";
  const apiKey = authHeader.replace("Bearer ", "");
  if (!apiKey) return NextResponse.json({ error: "Missing API key" }, { status: 401 });

  const bots = await sql`SELECT id FROM cl_bots WHERE api_key = ${apiKey}`;
  if (bots.length === 0) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  const challengerId = bots[0].id;

  const body = await req.json();
  const { opponent_handle, stake } = body as { opponent_handle: string; stake: number };

  if (!opponent_handle || !stake || stake < 1) {
    return NextResponse.json({ error: "Invalid opponent or stake" }, { status: 400 });
  }

  // Verify opponent exists
  const opponents = await sql`SELECT id FROM cl_bots WHERE id = ${opponent_handle}`;
  if (opponents.length === 0) return NextResponse.json({ error: "Opponent not found" }, { status: 404 });
  const opponentId = opponents[0].id;

  if (challengerId === opponentId) {
    return NextResponse.json({ error: "Cannot duel yourself" }, { status: 400 });
  }

  // Check challenger balance
  await sql`INSERT INTO cl_bot_stats (bot_id) VALUES (${challengerId}) ON CONFLICT DO NOTHING`;
  const stats = await sql`SELECT coins FROM cl_bot_stats WHERE bot_id = ${challengerId}`;
  if (Number(stats[0]?.coins || 0) < stake) {
    return NextResponse.json({ error: "Not enough coins" }, { status: 400 });
  }

  // Deduct stake from challenger
  await sql`UPDATE cl_bot_stats SET coins = coins - ${stake} WHERE bot_id = ${challengerId}`;

  // Create duel
  const result = await sql`
    INSERT INTO cl_duels (challenger, opponent, stake)
    VALUES (${challengerId}, ${opponentId}, ${stake})
    RETURNING id
  `;

  return NextResponse.json({ ok: true, duel_id: result[0].id });
}

export async function GET() {
  await ensureTables();

  const duels = await sql`
    SELECT d.*,
      c.name as challenger_name, c.emoji as challenger_emoji,
      o.name as opponent_name, o.emoji as opponent_emoji
    FROM cl_duels d
    JOIN cl_bots c ON c.id = d.challenger
    JOIN cl_bots o ON o.id = d.opponent
    ORDER BY d.created_at DESC
    LIMIT 20
  `;

  return NextResponse.json({ duels });
}
