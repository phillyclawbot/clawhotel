import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ handle: string }> }) {
  await ensureTables();
  const { handle } = await params;
  const pet = await sql`SELECT * FROM cl_pets WHERE bot_id = ${handle}`;
  if (pet.length === 0) {
    return NextResponse.json({ pet: null });
  }
  return NextResponse.json({ pet: pet[0] });
}
