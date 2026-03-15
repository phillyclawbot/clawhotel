import { NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();

  const rows = await sql`
    SELECT a.achievement_id, a.unlocked_at, b.name, b.emoji
    FROM cl_achievements a
    JOIN cl_bots b ON b.id = a.bot_id
    ORDER BY a.unlocked_at DESC LIMIT 1
  `;

  if (rows.length === 0) {
    return NextResponse.json({ achievement: null });
  }

  return NextResponse.json({ achievement: rows[0] });
}
