import { NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();

  const messages = await sql`
    SELECT m.id, m.text, m.created_at, b.id AS bot_id, b.name, b.emoji, b.accent_color,
           br.room_id
    FROM cl_messages m
    JOIN cl_bots b ON b.id = m.bot_id
    LEFT JOIN cl_bot_rooms br ON br.bot_id = b.id
    ORDER BY m.created_at DESC LIMIT 50
  `;

  return NextResponse.json({ messages });
}
