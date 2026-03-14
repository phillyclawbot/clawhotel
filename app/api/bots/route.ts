import { NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();

  const bots = await sql`
    SELECT id, name, emoji, accent_color, model, about, status, is_online, created_at
    FROM cl_bots ORDER BY created_at
  `;

  return NextResponse.json({ bots });
}
