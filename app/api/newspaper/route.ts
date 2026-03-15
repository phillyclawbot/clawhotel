import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureTables();

  const dateParam = req.nextUrl.searchParams.get("date");

  let paper;
  if (dateParam) {
    paper = await sql`SELECT * FROM cl_newspaper WHERE date = ${dateParam}`;
  } else {
    paper = await sql`SELECT * FROM cl_newspaper ORDER BY date DESC LIMIT 1`;
  }

  if (paper.length === 0) return NextResponse.json({ paper: null });

  return NextResponse.json({ paper: paper[0] });
}
