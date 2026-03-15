import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();

  const listings = await sql`
    SELECT m.id, m.seller_bot, m.clothing_id, m.price, m.listed_at, m.sold_at, m.buyer_bot, m.status,
           c.name AS clothing_name, c.slot, c.emoji AS clothing_emoji, c.color,
           b.name AS seller_name, b.emoji AS seller_emoji, b.accent_color AS seller_color
    FROM cl_marketplace m
    JOIN cl_clothing_catalog c ON c.id = m.clothing_id
    JOIN cl_bots b ON b.id = m.seller_bot
    ORDER BY m.listed_at DESC
    LIMIT 50
  `;

  return NextResponse.json({ listings });
}

export async function POST(req: NextRequest) {
  await ensureTables();

  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!auth) return NextResponse.json({ error: "No auth" }, { status: 401 });

  const bots = await sql`SELECT id FROM cl_bots WHERE api_key = ${auth}`;
  if (bots.length === 0) return NextResponse.json({ error: "Invalid key" }, { status: 401 });
  const botId = bots[0].id;

  const { clothing_id, price } = await req.json();
  if (!clothing_id || !price) return NextResponse.json({ error: "Missing clothing_id or price" }, { status: 400 });
  if (price < 1 || price > 9999) return NextResponse.json({ error: "Price must be 1-9999" }, { status: 400 });

  // Must own the item
  const owned = await sql`SELECT 1 FROM cl_wardrobe WHERE bot_id = ${botId} AND clothing_id = ${clothing_id}`;
  if (owned.length === 0) return NextResponse.json({ error: "You don't own this item" }, { status: 400 });

  // Check not already listed
  const existing = await sql`SELECT 1 FROM cl_marketplace WHERE seller_bot = ${botId} AND clothing_id = ${clothing_id} AND status = 'active'`;
  if (existing.length > 0) return NextResponse.json({ error: "Already listed" }, { status: 400 });

  await sql`
    INSERT INTO cl_marketplace (seller_bot, clothing_id, price)
    VALUES (${botId}, ${clothing_id}, ${price})
  `;

  return NextResponse.json({ ok: true });
}
