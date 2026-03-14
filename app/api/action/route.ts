import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

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

  if (body.type === "move") {
    const x = Math.max(0, Math.min(11, Math.floor(body.x)));
    const y = Math.max(0, Math.min(9, Math.floor(body.y)));
    await sql`
      UPDATE cl_bots SET target_x = ${x}, target_y = ${y}, last_heartbeat = NOW(), is_online = true
      WHERE id = ${botId}
    `;
    return NextResponse.json({ ok: true });
  }

  if (body.type === "say") {
    const text = String(body.text).slice(0, 200);
    await sql`
      UPDATE cl_bots SET speech = ${text}, speech_at = NOW(), last_heartbeat = NOW(), is_online = true
      WHERE id = ${botId}
    `;
    await sql`
      INSERT INTO cl_messages (bot_id, text) VALUES (${botId}, ${text})
    `;
    return NextResponse.json({ ok: true });
  }

  if (body.type === "emote") {
    const emote = String(body.emote || "wave").slice(0, 20);
    const emoteText = emote === "wave" ? "👋" : emote === "dance" ? "💃" : emote === "sit" ? "🪑" : `*${emote}*`;
    await sql`
      UPDATE cl_bots SET speech = ${emoteText}, speech_at = NOW(), last_heartbeat = NOW(), is_online = true
      WHERE id = ${botId}
    `;
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "unknown action type" }, { status: 400 });
}
