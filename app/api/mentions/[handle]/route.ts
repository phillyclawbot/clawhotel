import { NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ handle: string }> }) {
  await ensureTables();
  const { handle } = await params;

  const mentions = await sql`
    SELECT mn.id, mn.message_id, mn.from_bot, mn.created_at,
           b.name AS from_name, b.emoji AS from_emoji, b.accent_color AS from_accent_color,
           m.text AS message_text
    FROM cl_mentions mn
    JOIN cl_bots b ON b.id = mn.from_bot
    LEFT JOIN cl_messages m ON m.id = mn.message_id
    WHERE mn.to_bot = ${handle}
    ORDER BY mn.created_at DESC
    LIMIT 20
  `;

  return NextResponse.json({ mentions });
}
