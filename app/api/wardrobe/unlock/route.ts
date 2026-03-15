import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await ensureTables();

  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!auth) return NextResponse.json({ error: "No auth" }, { status: 401 });

  const bots = await sql`SELECT id FROM cl_bots WHERE api_key = ${auth}`;
  if (bots.length === 0) return NextResponse.json({ error: "Invalid key" }, { status: 401 });
  const botId = bots[0].id;

  const { clothing_id } = await req.json();
  if (!clothing_id) return NextResponse.json({ error: "Missing clothing_id" }, { status: 400 });

  // Check if already owned
  const alreadyOwned = await sql`SELECT 1 FROM cl_wardrobe WHERE bot_id = ${botId} AND clothing_id = ${clothing_id}`;
  if (alreadyOwned.length > 0) return NextResponse.json({ error: "Already owned" }, { status: 400 });

  // Get item info
  const items = await sql`SELECT * FROM cl_clothing_catalog WHERE id = ${clothing_id}`;
  if (items.length === 0) return NextResponse.json({ error: "Item not found" }, { status: 404 });
  const item = items[0];

  // Check unlock requirements
  if (item.unlock_type === "starter") {
    // Free for all
  } else if (item.unlock_type === "xp") {
    const [statName, requiredStr] = (item.unlock_value || "").split(":");
    const required = parseInt(requiredStr || "0");
    const stats = await sql`SELECT * FROM cl_bot_stats WHERE bot_id = ${botId}`;
    if (stats.length === 0) return NextResponse.json({ error: "No stats found" }, { status: 400 });
    const currentVal = Number(stats[0][statName] || 0);
    if (currentVal < required) {
      return NextResponse.json({ error: `Need ${required} ${statName}, have ${currentVal}` }, { status: 400 });
    }
  } else if (item.unlock_type === "coins") {
    const [, requiredStr] = (item.unlock_value || "").split(":");
    const required = parseInt(requiredStr || "0");
    const stats = await sql`SELECT coins FROM cl_bot_stats WHERE bot_id = ${botId}`;
    if (stats.length === 0) return NextResponse.json({ error: "No stats" }, { status: 400 });
    const coins = Number(stats[0].coins || 0);
    if (coins < required) {
      return NextResponse.json({ error: `Need ${required} coins, have ${coins}` }, { status: 400 });
    }
    // Deduct coins
    await sql`UPDATE cl_bot_stats SET coins = coins - ${required} WHERE bot_id = ${botId}`;
  } else if (item.unlock_type === "achievement") {
    const [, achievementId] = (item.unlock_value || "").split(":");
    const ach = await sql`SELECT 1 FROM cl_achievements WHERE bot_id = ${botId} AND achievement_id = ${achievementId}`;
    if (ach.length === 0) {
      return NextResponse.json({ error: `Need achievement: ${achievementId}` }, { status: 400 });
    }
  }

  // Grant item
  await sql`INSERT INTO cl_wardrobe (bot_id, clothing_id) VALUES (${botId}, ${clothing_id}) ON CONFLICT DO NOTHING`;

  return NextResponse.json({ ok: true, item: { id: item.id, name: item.name, slot: item.slot } });
}
