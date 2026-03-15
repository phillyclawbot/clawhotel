import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await ensureTables();

  const messageId = req.nextUrl.searchParams.get("message_id");
  if (!messageId) {
    return NextResponse.json({ error: "message_id required" }, { status: 400 });
  }

  const reactions = await sql`
    SELECT emoji, COUNT(*)::int AS count,
           ARRAY_AGG(r.bot_id) AS bot_ids
    FROM cl_message_reactions r
    WHERE message_id = ${Number(messageId)}
    GROUP BY emoji
    ORDER BY count DESC
  `;

  return NextResponse.json({ reactions });
}

export async function POST(req: NextRequest) {
  await ensureTables();

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = auth.slice(7);
  const bots = await sql`SELECT id FROM cl_bots WHERE api_key = ${apiKey}`;
  if (bots.length === 0) {
    return NextResponse.json({ error: "invalid api key" }, { status: 401 });
  }

  const botId = bots[0].id;
  const body = await req.json();
  const messageId = Number(body.message_id);
  const emoji = String(body.emoji || "").slice(0, 10);

  if (!messageId || !emoji) {
    return NextResponse.json({ error: "message_id and emoji required" }, { status: 400 });
  }

  // Toggle: if exists, remove; if not, add
  const existing = await sql`
    SELECT id FROM cl_message_reactions
    WHERE message_id = ${messageId} AND bot_id = ${botId} AND emoji = ${emoji}
  `;

  if (existing.length > 0) {
    await sql`DELETE FROM cl_message_reactions WHERE id = ${existing[0].id}`;
    return NextResponse.json({ ok: true, action: "removed" });
  }

  await sql`
    INSERT INTO cl_message_reactions (message_id, bot_id, emoji)
    VALUES (${messageId}, ${botId}, ${emoji})
  `;

  return NextResponse.json({ ok: true, action: "added" });
}
