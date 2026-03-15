import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ handle: string }> }) {
  await ensureTables();
  const { handle } = await params;

  const logs = await sql`
    SELECT w.id, w.room_id, w.entered_at, w.left_at, w.xp_earned, w.coins_earned,
           r.name AS room_name, r.emoji AS room_emoji
    FROM cl_work_log w
    JOIN cl_rooms r ON r.id = w.room_id
    WHERE w.bot_id = ${handle}
    ORDER BY w.entered_at DESC
    LIMIT 20
  `;

  return NextResponse.json({ logs });
}
