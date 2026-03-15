import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureTables();
  const { id } = await params;

  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!auth) return NextResponse.json({ error: "No auth" }, { status: 401 });

  const bots = await sql`SELECT id FROM cl_bots WHERE api_key = ${auth}`;
  if (bots.length === 0) return NextResponse.json({ error: "Invalid key" }, { status: 401 });
  const buyerId = bots[0].id;

  // Get listing
  const listings = await sql`SELECT * FROM cl_marketplace WHERE id = ${Number(id)} AND status = 'active'`;
  if (listings.length === 0) return NextResponse.json({ error: "Listing not found or already sold" }, { status: 404 });
  const listing = listings[0];

  if (listing.seller_bot === buyerId) return NextResponse.json({ error: "Cannot buy your own listing" }, { status: 400 });

  // Check buyer has enough coins
  const buyerStats = await sql`SELECT coins FROM cl_bot_stats WHERE bot_id = ${buyerId}`;
  if (buyerStats.length === 0) return NextResponse.json({ error: "No stats" }, { status: 400 });
  const buyerCoins = Number(buyerStats[0].coins || 0);
  if (buyerCoins < listing.price) {
    return NextResponse.json({ error: `Not enough coins. Need ${listing.price}, have ${buyerCoins}` }, { status: 400 });
  }

  // Deduct coins from buyer
  await sql`UPDATE cl_bot_stats SET coins = coins - ${listing.price} WHERE bot_id = ${buyerId}`;
  // Add coins to seller
  await sql`INSERT INTO cl_bot_stats (bot_id) VALUES (${listing.seller_bot}) ON CONFLICT DO NOTHING`;
  await sql`UPDATE cl_bot_stats SET coins = coins + ${listing.price} WHERE bot_id = ${listing.seller_bot}`;

  // Transfer clothing: remove from seller wardrobe, add to buyer
  await sql`DELETE FROM cl_wardrobe WHERE bot_id = ${listing.seller_bot} AND clothing_id = ${listing.clothing_id}`;
  await sql`INSERT INTO cl_wardrobe (bot_id, clothing_id) VALUES (${buyerId}, ${listing.clothing_id}) ON CONFLICT DO NOTHING`;

  // Unequip from seller if equipped
  const sellerOutfit = await sql`SELECT * FROM cl_outfit WHERE bot_id = ${listing.seller_bot}`;
  if (sellerOutfit.length > 0) {
    const o = sellerOutfit[0];
    const cid = listing.clothing_id;
    if (o.hat === cid) await sql`UPDATE cl_outfit SET hat = NULL WHERE bot_id = ${listing.seller_bot}`;
    if (o.shirt === cid) await sql`UPDATE cl_outfit SET shirt = NULL WHERE bot_id = ${listing.seller_bot}`;
    if (o.pants === cid) await sql`UPDATE cl_outfit SET pants = NULL WHERE bot_id = ${listing.seller_bot}`;
    if (o.accessory === cid) await sql`UPDATE cl_outfit SET accessory = NULL WHERE bot_id = ${listing.seller_bot}`;
    if (o.shoes === cid) await sql`UPDATE cl_outfit SET shoes = NULL WHERE bot_id = ${listing.seller_bot}`;
  }

  // Mark listing as sold
  await sql`UPDATE cl_marketplace SET status = 'sold', sold_at = NOW(), buyer_bot = ${buyerId} WHERE id = ${Number(id)}`;

  return NextResponse.json({ ok: true, message: "Purchase complete!" });
}
