import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();

  const gifts = await sql`
    SELECT g.id, g.amount, g.message, g.created_at,
           fb.name AS from_name, fb.emoji AS from_emoji, fb.accent_color AS from_color,
           tb.name AS to_name, tb.emoji AS to_emoji, tb.accent_color AS to_color
    FROM cl_gifts g
    JOIN cl_bots fb ON fb.id = g.from_bot
    JOIN cl_bots tb ON tb.id = g.to_bot
    ORDER BY g.created_at DESC LIMIT 20
  `;

  return NextResponse.json({ gifts });
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

  const senderId = bots[0].id;
  const body = await req.json();
  const { to, amount, message } = body;

  if (!to || !amount) {
    return NextResponse.json({ error: "to and amount required" }, { status: 400 });
  }

  const amountNum = Math.floor(Number(amount));
  if (amountNum < 1 || amountNum > 9999) {
    return NextResponse.json({ error: "amount must be 1-9999" }, { status: 400 });
  }

  // Check recipient exists
  const recipient = await sql`SELECT id FROM cl_bots WHERE id = ${to}`;
  if (recipient.length === 0) {
    return NextResponse.json({ error: "recipient not found" }, { status: 404 });
  }

  if (senderId === to) {
    return NextResponse.json({ error: "cannot gift yourself" }, { status: 400 });
  }

  // Check sender has enough coins
  await sql`INSERT INTO cl_bot_stats (bot_id) VALUES (${senderId}) ON CONFLICT DO NOTHING`;
  const senderStats = await sql`SELECT coins FROM cl_bot_stats WHERE bot_id = ${senderId}`;
  if (senderStats.length === 0 || senderStats[0].coins < amountNum) {
    return NextResponse.json({ error: "insufficient coins" }, { status: 400 });
  }

  // Transfer
  await sql`UPDATE cl_bot_stats SET coins = coins - ${amountNum} WHERE bot_id = ${senderId}`;
  await sql`INSERT INTO cl_bot_stats (bot_id) VALUES (${to}) ON CONFLICT DO NOTHING`;
  await sql`UPDATE cl_bot_stats SET coins = coins + ${amountNum} WHERE bot_id = ${to}`;

  // Record gift
  await sql`
    INSERT INTO cl_gifts (from_bot, to_bot, amount, message)
    VALUES (${senderId}, ${to}, ${amountNum}, ${message || null})
  `;

  // Upsert connection
  const botA = senderId < to ? senderId : to;
  const botB = senderId < to ? to : senderId;
  await sql`
    INSERT INTO cl_connections (bot_a, bot_b)
    VALUES (${botA}, ${botB})
    ON CONFLICT (bot_a, bot_b) DO UPDATE
    SET interaction_count = cl_connections.interaction_count + 1, last_interaction = NOW()
  `;

  return NextResponse.json({ ok: true, amount: amountNum });
}
