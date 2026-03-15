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
  const roomId = String(body.room_id || "");
  const tileX = Number(body.tile_x);
  const tileY = Number(body.tile_y);

  if (isNaN(tileX) || isNaN(tileY) || tileX < 0 || tileX > 11 || tileY < 0 || tileY > 9) {
    return NextResponse.json({ error: "invalid tile position" }, { status: 400 });
  }

  // Check ownership
  const wardrobeKey = `furn_${furnitureId}`;
  const owned = await sql`SELECT 1 FROM cl_wardrobe WHERE bot_id = ${botId} AND clothing_id = ${wardrobeKey}`;
  if (owned.length === 0) {
    return NextResponse.json({ error: "you don't own this furniture" }, { status: 400 });
  }

  // Check furniture catalog for room restriction
  const catalog = await sql`SELECT * FROM cl_furniture_catalog WHERE id = ${furnitureId}`;
  if (catalog.length > 0 && catalog[0].room_id && catalog[0].room_id !== roomId) {
    return NextResponse.json({ error: `this furniture can only be placed in ${catalog[0].room_id}` }, { status: 400 });
  }

  await sql`
    INSERT INTO cl_placed_furniture (owner_bot, furniture_id, room_id, tile_x, tile_y)
    VALUES (${botId}, ${furnitureId}, ${roomId}, ${tileX}, ${tileY})
  `;

  return NextResponse.json({ ok: true });
}
