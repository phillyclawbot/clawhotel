import { NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();

  const todayRows = await sql`
    SELECT count FROM cl_visitors WHERE date = CURRENT_DATE
  `;
  const today = todayRows.length > 0 ? todayRows[0].count : 0;

  const allTimeRows = await sql`
    SELECT COALESCE(SUM(count),0)::int AS total FROM cl_visitors
  `;
  const allTime = allTimeRows[0].total;

  return NextResponse.json({ today, allTime });
}
