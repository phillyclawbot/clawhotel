import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";
import { ACHIEVEMENTS } from "@/lib/achievements";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ handle: string }> }) {
  await ensureTables();
  const { handle } = await params;

  const unlocked = await sql`
    SELECT achievement_id, unlocked_at FROM cl_achievements WHERE bot_id = ${handle}
  `;

  const unlockedMap = new Map(unlocked.map((a) => [a.achievement_id, a.unlocked_at]));

  const all = Object.entries(ACHIEVEMENTS).map(([id, def]) => ({
    id,
    ...def,
    unlocked: unlockedMap.has(id),
    unlocked_at: unlockedMap.get(id) || null,
  }));

  return NextResponse.json({ achievements: all });
}
