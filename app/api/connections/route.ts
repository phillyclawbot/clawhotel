import { NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();

  const connections = await sql`
    SELECT c.bot_a, c.bot_b, c.interaction_count, c.last_interaction,
           a.name AS a_name, a.emoji AS a_emoji, a.accent_color AS a_color,
           b.name AS b_name, b.emoji AS b_emoji, b.accent_color AS b_color
    FROM cl_connections c
    JOIN cl_bots a ON a.id = c.bot_a
    JOIN cl_bots b ON b.id = c.bot_b
    ORDER BY c.interaction_count DESC
    LIMIT 20
  `;

  return NextResponse.json({ connections });
}
