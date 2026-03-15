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
  const botId = bots[0].id;

  const body = await req.json();
  const { game, bet } = body as { game: string; bet: number };

  if (!game || !bet || bet < 1) {
    return NextResponse.json({ error: "Invalid game or bet" }, { status: 400 });
  }
  if (!["slots", "coinflip", "dice"].includes(game)) {
    return NextResponse.json({ error: "Game must be slots, coinflip, or dice" }, { status: 400 });
  }

  // Check balance
  await sql`INSERT INTO cl_bot_stats (bot_id) VALUES (${botId}) ON CONFLICT DO NOTHING`;
  const stats = await sql`SELECT coins FROM cl_bot_stats WHERE bot_id = ${botId}`;
  const currentCoins = Number(stats[0]?.coins || 0);

  if (currentCoins < bet) {
    return NextResponse.json({ error: "Not enough coins", balance: currentCoins }, { status: 400 });
  }

  // Deduct bet
  await sql`UPDATE cl_bot_stats SET coins = coins - ${bet} WHERE bot_id = ${botId}`;

  let won = false;
  let payout = 0;
  let result: Record<string, unknown> = {};

  if (game === "coinflip") {
    const flip = Math.random() < 0.5 ? "heads" : "tails";
    won = flip === "heads";
    payout = won ? bet * 2 : 0;
    result = { flip, won, payout };
  } else if (game === "dice") {
    const playerRoll = Math.floor(Math.random() * 6) + 1;
    const houseRoll = Math.floor(Math.random() * 6) + 1;
    if (playerRoll > houseRoll) {
      won = true;
      payout = bet * 2;
    } else if (playerRoll === houseRoll) {
      won = false;
      payout = bet; // tie returns bet
    } else {
      won = false;
      payout = 0;
    }
    result = { player_roll: playerRoll, house_roll: houseRoll, won, payout };
  } else if (game === "slots") {
    const reel1 = Math.floor(Math.random() * 5) + 1;
    const reel2 = Math.floor(Math.random() * 5) + 1;
    const reel3 = Math.floor(Math.random() * 5) + 1;
    if (reel1 === reel2 && reel2 === reel3) {
      won = true;
      payout = bet * 10;
    } else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
      won = true;
      payout = bet * 2;
    } else {
      won = false;
      payout = 0;
    }
    result = { reels: [reel1, reel2, reel3], won, payout };
  }

  // Credit payout
  if (payout > 0) {
    await sql`UPDATE cl_bot_stats SET coins = coins + ${payout} WHERE bot_id = ${botId}`;
  }

  const updated = await sql`SELECT coins FROM cl_bot_stats WHERE bot_id = ${botId}`;
  const newBalance = Number(updated[0]?.coins || 0);

  return NextResponse.json({
    game,
    bet,
    ...result,
    new_balance: newBalance,
  });
}
