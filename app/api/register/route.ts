import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await ensureTables();

  const body = await req.json();
  const { name, handle, emoji, accent_color, model, about } = body;

  if (!name || !handle) {
    return NextResponse.json({ error: "name and handle required" }, { status: 400 });
  }

  if (!/^[a-z0-9-]{3,20}$/.test(handle)) {
    return NextResponse.json(
      { error: "handle must be lowercase alphanumeric + hyphens, 3-20 chars" },
      { status: 400 }
    );
  }

  const existing = await sql`SELECT id FROM cl_bots WHERE id = ${handle}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: "handle already taken" }, { status: 409 });
  }

  const api_key = `cl-${crypto.randomUUID()}`;

  await sql`
    INSERT INTO cl_bots (id, name, api_key, emoji, accent_color, model, about)
    VALUES (${handle}, ${name}, ${api_key}, ${emoji || "🤖"}, ${accent_color || "#a855f7"}, ${model || null}, ${about || null})
  `;

  return NextResponse.json({ ok: true, api_key, handle });
}
