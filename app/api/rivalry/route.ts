import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();
  const rivalries = await sql`
    SELECT r.*,
           c.name AS challenger_name, c.emoji AS challenger_emoji, c.accent_color AS challenger_color,
           o.name AS opponent_name, o.emoji AS opponent_emoji, o.accent_color AS opponent_color
    FROM cl_rivalries r
    JOIN cl_bots c ON c.id = r.challenger
    JOIN cl_bots o ON o.id = r.opponent
    ORDER BY r.start_time DESC
    LIMIT 50
  `;
  return NextResponse.json({ rivalries });
}

export async function POST(req: NextRequest) {
  await ensureTables();
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const apiKey = auth.slice(7);
  const bots = await sql`SELECT id FROM cl_bots WHERE api_key = ${apiKey}`;
  if (bots.length === 0) {
    return NextResponse.json({ error: "invalid api key" }, { status: 401 });
  }
  const botId = bots[0].id;
  const body = await req.json();

  const opponentHandle = String(body.opponent_handle || "");
  const challengeType = String(body.challenge_type || "");
  const stake = Math.max(1, Math.floor(Number(body.stake) || 0));

  const validTypes = ["cooking_xp", "dj_xp", "bartending_xp", "art_xp", "strength_xp", "coins"];
  if (!validTypes.includes(challengeType)) {
    return NextResponse.json({ error: `invalid challenge_type. valid: ${validTypes.join(", ")}` }, { status: 400 });
  }

  // Check opponent exists
  const opponents = await sql`SELECT id FROM cl_bots WHERE id = ${opponentHandle}`;
  if (opponents.length === 0) {
    return NextResponse.json({ error: "opponent not found" }, { status: 400 });
  }
  if (opponents[0].id === botId) {
    return NextResponse.json({ error: "cannot challenge yourself" }, { status: 400 });
  }

  // Check coins
  const stats = await sql`SELECT coins FROM cl_bot_stats WHERE bot_id = ${botId}`;
  const coins = stats.length > 0 ? Number(stats[0].coins) : 0;
  if (coins < stake) {
    return NextResponse.json({ error: `not enough coins. need ${stake}, have ${coins}` }, { status: 400 });
  }

  // Deduct stake from challenger
  await sql`UPDATE cl_bot_stats SET coins = coins - ${stake} WHERE bot_id = ${botId}`;

  // Create rivalry (24h duration)
  const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const result = await sql`
    INSERT INTO cl_rivalries (challenger, opponent, challenge_type, stake, end_time)
    VALUES (${botId}, ${opponentHandle}, ${challengeType}, ${stake}, ${endTime})
    RETURNING id
  `;

  return NextResponse.json({ ok: true, rivalry_id: result[0].id, stake, end_time: endTime });
}
