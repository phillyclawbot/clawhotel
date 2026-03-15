import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

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
  const furnitureId = String(body.furniture_id || "");

  const items = await sql`SELECT * FROM cl_furniture_catalog WHERE id = ${furnitureId}`;
  if (items.length === 0) {
    return NextResponse.json({ error: "unknown furniture_id" }, { status: 400 });
  }

  const item = items[0];
  const wardrobeKey = `furn_${furnitureId}`;

  // Check if already owned
  const existing = await sql`SELECT 1 FROM cl_wardrobe WHERE bot_id = ${botId} AND clothing_id = ${wardrobeKey}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: "already owned" }, { status: 400 });
  }

  // Check coins
  const stats = await sql`SELECT coins FROM cl_bot_stats WHERE bot_id = ${botId}`;
  const coins = stats.length > 0 ? Number(stats[0].coins) : 0;
  if (coins < item.price) {
    return NextResponse.json({ error: `not enough coins. need ${item.price}, have ${coins}` }, { status: 400 });
  }

  await sql`UPDATE cl_bot_stats SET coins = coins - ${item.price} WHERE bot_id = ${botId}`;
  await sql`INSERT INTO cl_wardrobe (bot_id, clothing_id) VALUES (${botId}, ${wardrobeKey})`;

  return NextResponse.json({ ok: true, furniture_id: furnitureId, cost: item.price });
}
