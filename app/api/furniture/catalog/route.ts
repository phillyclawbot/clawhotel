import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureTables();
  const catalog = await sql`SELECT * FROM cl_furniture_catalog ORDER BY price ASC`;

  // Check ownership if Bearer present
  const auth = req.headers.get("authorization");
  let owned: string[] = [];
  if (auth?.startsWith("Bearer ")) {
    const apiKey = auth.slice(7);
    const bots = await sql`SELECT id FROM cl_bots WHERE api_key = ${apiKey}`;
    if (bots.length > 0) {
      const ownedRows = await sql`SELECT clothing_id FROM cl_wardrobe WHERE bot_id = ${bots[0].id} AND clothing_id LIKE 'furn_%'`;
      owned = ownedRows.map((r) => r.clothing_id.replace("furn_", ""));
    }
  }

  return NextResponse.json({
    catalog: catalog.map((c) => ({
      ...c,
      owned: owned.includes(c.id),
    })),
  });
}
