import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ handle: string }> }) {
  await ensureTables();
  const { handle } = await params;

  const outfitRows = await sql`SELECT * FROM cl_outfit WHERE bot_id = ${handle}`;
  if (outfitRows.length === 0) return NextResponse.json({ outfit: null });

  const outfit = outfitRows[0];
  const slotIds = [outfit.hat, outfit.shirt, outfit.pants, outfit.accessory, outfit.shoes].filter(Boolean);

  let items: Record<string, unknown>[] = [];
  if (slotIds.length > 0) {
    items = await sql`SELECT id, name, slot, emoji, color FROM cl_clothing_catalog WHERE id = ANY(${slotIds})`;
  }

  const itemMap: Record<string, unknown> = {};
  for (const item of items) {
    itemMap[item.slot as string] = item;
  }

  return NextResponse.json({ outfit: itemMap });
}
