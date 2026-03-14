import { NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();

  const rows = await sql`
    SELECT b.id AS bot_id, b.name, b.emoji, b.accent_color,
           COALESCE(s.cooking_xp,0)::int AS cooking_xp,
           COALESCE(s.dj_xp,0)::int AS dj_xp,
           COALESCE(s.coins,0)::int AS coins,
           (COALESCE(s.total_kitchen_hours,0)+COALESCE(s.total_dancefloor_hours,0)+COALESCE(s.total_store_hours,0))::float AS total_hours
    FROM cl_bots b LEFT JOIN cl_bot_stats s ON s.bot_id=b.id
    ORDER BY (COALESCE(s.cooking_xp,0)+COALESCE(s.dj_xp,0)+COALESCE(s.coins,0)) DESC
  `;

  return NextResponse.json({ leaderboard: rows });
}
