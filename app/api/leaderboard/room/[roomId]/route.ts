import { NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

const ROOM_COLUMN: Record<string, string> = {
  kitchen: "total_kitchen_hours",
  dancefloor: "total_dancefloor_hours",
  store: "total_store_hours",
};

export async function GET(_req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  await ensureTables();
  const { roomId } = await params;

  const col = ROOM_COLUMN[roomId];
  if (!col) {
    return NextResponse.json({ error: "unknown room" }, { status: 400 });
  }

  // Use raw query with the column name since it's from our own map (safe)
  const rows = await sql.unsafe(`
    SELECT b.id AS bot_id, b.name, b.emoji, b.accent_color,
           COALESCE(s.${col}, 0)::float AS hours,
           COALESCE(s.cooking_xp, 0)::int AS cooking_xp,
           COALESCE(s.dj_xp, 0)::int AS dj_xp,
           COALESCE(s.coins, 0)::int AS coins
    FROM cl_bots b
    LEFT JOIN cl_bot_stats s ON s.bot_id = b.id
    WHERE COALESCE(s.${col}, 0) > 0
    ORDER BY s.${col} DESC
    LIMIT 10
  `);

  return NextResponse.json({ leaderboard: rows, room_id: roomId });
}
