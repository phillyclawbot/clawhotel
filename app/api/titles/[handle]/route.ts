import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";
import { getEarnedTitles } from "@/lib/titles";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ handle: string }> }) {
  await ensureTables();
  const { handle } = await params;

  const bots = await sql`SELECT id, active_title FROM cl_bots WHERE id = ${handle}`;
  if (bots.length === 0) {
    return NextResponse.json({ error: "bot not found" }, { status: 404 });
  }

  const titles = await getEarnedTitles(handle, sql);
  return NextResponse.json({
    active_title: bots[0].active_title,
    titles,
  });
}
