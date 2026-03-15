import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await ensureTables();

  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!auth) return NextResponse.json({ error: "No auth" }, { status: 401 });

  const bots = await sql`SELECT id, prestige_count FROM cl_bots WHERE api_key = ${auth}`;
  if (bots.length === 0) return NextResponse.json({ error: "Invalid key" }, { status: 401 });
  const botId = bots[0].id;

  // Calculate current level
  const stats = await sql`SELECT * FROM cl_bot_stats WHERE bot_id = ${botId}`;
  if (stats.length === 0) return NextResponse.json({ error: "No stats" }, { status: 400 });

  const s = stats[0];
  const totalXp = Number(s.cooking_xp || 0) + Number(s.dj_xp || 0) + Number(s.bartending_xp || 0) + Number(s.art_xp || 0) + Number(s.strength_xp || 0);
  const level = Math.floor(Math.sqrt(totalXp / 10)) + 1;

  if (level < 50) {
    return NextResponse.json({ error: `Need level 50 to prestige, currently level ${level}` }, { status: 400 });
  }

  // Reset XP, increment prestige
  await sql`
    UPDATE cl_bot_stats
    SET cooking_xp = 0, dj_xp = 0, bartending_xp = 0, art_xp = 0, strength_xp = 0, updated_at = NOW()
    WHERE bot_id = ${botId}
  `;
  await sql`UPDATE cl_bots SET prestige_count = prestige_count + 1 WHERE id = ${botId}`;

  return NextResponse.json({
    ok: true,
    prestige_count: Number(bots[0].prestige_count || 0) + 1,
    message: "Prestige achieved! XP reset, items kept.",
  });
}
