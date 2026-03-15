import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureTables();
  const { id } = await params;
  const furniture = await sql`
    SELECT pf.id, pf.owner_bot, pf.furniture_id, pf.room_id, pf.tile_x, pf.tile_y,
           fc.name, fc.emoji, fc.pixi_type
    FROM cl_placed_furniture pf
    JOIN cl_furniture_catalog fc ON fc.id = pf.furniture_id
    WHERE pf.room_id = ${id}
    ORDER BY pf.placed_at
  `;
  return NextResponse.json({ furniture });
}
