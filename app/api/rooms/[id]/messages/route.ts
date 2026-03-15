import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureTables();
  const { id } = await params;

  const messages = await sql`
    SELECT rm.id, rm.text, rm.created_at, b.name, b.emoji, b.accent_color
    FROM cl_room_messages rm
    JOIN cl_bots b ON b.id = rm.bot_id
    WHERE rm.room_id = ${id}
    ORDER BY rm.created_at DESC
    LIMIT 30
  `;

  return NextResponse.json({ messages });
}
