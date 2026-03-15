import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureTables();

  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!auth) return NextResponse.json({ error: "No auth" }, { status: 401 });

  const bots = await sql`SELECT id FROM cl_bots WHERE api_key = ${auth}`;
  if (bots.length === 0) return NextResponse.json({ error: "Invalid key" }, { status: 401 });
  const botId = bots[0].id;

  // Get owned items
  const owned = await sql`
    SELECT w.clothing_id, c.name, c.slot, c.emoji, c.color, c.description
    FROM cl_wardrobe w
    JOIN cl_clothing_catalog c ON c.id = w.clothing_id
    WHERE w.bot_id = ${botId}
  `;

  // Get equipped outfit
  const outfitRows = await sql`SELECT * FROM cl_outfit WHERE bot_id = ${botId}`;
  const outfit = outfitRows.length > 0 ? outfitRows[0] : null;

  // Get all catalog items
  const catalog = await sql`SELECT * FROM cl_clothing_catalog ORDER BY slot, name`;

  // Get bot stats for progress
  const stats = await sql`SELECT * FROM cl_bot_stats WHERE bot_id = ${botId}`;
  const achievements = await sql`SELECT achievement_id FROM cl_achievements WHERE bot_id = ${botId}`;

  return NextResponse.json({
    owned,
    outfit,
    catalog,
    stats: stats[0] || null,
    achievements: achievements.map((a) => a.achievement_id),
  });
}

export async function POST(req: NextRequest) {
  await ensureTables();

  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!auth) return NextResponse.json({ error: "No auth" }, { status: 401 });

  const bots = await sql`SELECT id FROM cl_bots WHERE api_key = ${auth}`;
  if (bots.length === 0) return NextResponse.json({ error: "Invalid key" }, { status: 401 });
  const botId = bots[0].id;

  const body = await req.json();
  const { hat, shirt, pants, accessory, shoes } = body;

  // Validate ownership of each piece
  const slots = { hat, shirt, pants, accessory, shoes };
  for (const [slot, itemId] of Object.entries(slots)) {
    if (itemId) {
      const owned = await sql`SELECT 1 FROM cl_wardrobe WHERE bot_id = ${botId} AND clothing_id = ${itemId}`;
      if (owned.length === 0) {
        return NextResponse.json({ error: `You don't own ${itemId}` }, { status: 400 });
      }
      // Verify slot matches
      const item = await sql`SELECT slot FROM cl_clothing_catalog WHERE id = ${itemId}`;
      if (item.length > 0 && item[0].slot !== slot) {
        return NextResponse.json({ error: `${itemId} is not a ${slot}` }, { status: 400 });
      }
    }
  }

  await sql`
    INSERT INTO cl_outfit (bot_id, hat, shirt, pants, accessory, shoes, updated_at)
    VALUES (${botId}, ${hat || null}, ${shirt || null}, ${pants || null}, ${accessory || null}, ${shoes || null}, NOW())
    ON CONFLICT (bot_id) DO UPDATE SET
      hat = ${hat || null},
      shirt = ${shirt || null},
      pants = ${pants || null},
      accessory = ${accessory || null},
      shoes = ${shoes || null},
      updated_at = NOW()
  `;

  return NextResponse.json({ ok: true });
}
