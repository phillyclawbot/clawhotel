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
  const botId = bots[0].id;

  const listings = await sql`SELECT * FROM cl_marketplace WHERE id = ${Number(id)} AND status = 'active'`;
  if (listings.length === 0) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  if (listings[0].seller_bot !== botId) {
    return NextResponse.json({ error: "Not your listing" }, { status: 403 });
  }

  await sql`UPDATE cl_marketplace SET status = 'cancelled' WHERE id = ${Number(id)}`;

  return NextResponse.json({ ok: true });
}
