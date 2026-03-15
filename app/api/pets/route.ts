import { NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();
  const pets = await sql`
    SELECT p.bot_id, p.pet_type, p.pet_name, b.name AS bot_name, b.emoji AS bot_emoji, b.accent_color
    FROM cl_pets p
    JOIN cl_bots b ON b.id = p.bot_id
    ORDER BY p.acquired_at DESC
  `;
  return NextResponse.json({ pets });
}
