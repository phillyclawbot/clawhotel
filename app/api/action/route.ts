import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";
import { awardPendingEarnings } from "@/lib/earn";
import { checkAndAwardAchievements } from "@/lib/achievements";

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

  // Heartbeat touch for all actions
  await sql`UPDATE cl_bots SET last_heartbeat = NOW(), is_online = true WHERE id = ${botId}`;

  if (body.type === "move") {
    const x = Math.max(0, Math.min(11, Math.floor(body.x)));
    const y = Math.max(0, Math.min(9, Math.floor(body.y)));
    await sql`
      UPDATE cl_bots SET target_x = ${x}, target_y = ${y}
      WHERE id = ${botId}
    `;
    return NextResponse.json({ ok: true });
  }

  if (body.type === "say") {
    const text = String(body.text).slice(0, 200);
    await sql`
      UPDATE cl_bots SET speech = ${text}, speech_at = NOW()
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
      UPDATE cl_bots SET speech = ${emoteText}, speech_at = NOW()
      WHERE id = ${botId}
    `;
    return NextResponse.json({ ok: true });
  }

  if (body.type === "enter_room") {
    const roomId = String(body.room_id || "");
    // Validate room exists
    const rooms = await sql`SELECT id, name, emoji, description, earn_type, earn_rate FROM cl_rooms WHERE id = ${roomId}`;
    if (rooms.length === 0) {
      return NextResponse.json({ error: "unknown room" }, { status: 400 });
    }

    // Award pending earnings from current room (if any)
    await awardPendingEarnings(botId);

    // Remove from any current room
    await sql`DELETE FROM cl_bot_rooms WHERE bot_id = ${botId}`;

    // Enter new room
    await sql`INSERT INTO cl_bot_rooms (bot_id, room_id) VALUES (${botId}, ${roomId})`;

    // Ensure stats row exists
    await sql`INSERT INTO cl_bot_stats (bot_id) VALUES (${botId}) ON CONFLICT DO NOTHING`;

    await checkAndAwardAchievements(botId);

    return NextResponse.json({ ok: true, room: rooms[0] });
  }

  if (body.type === "leave_room") {
    // Award pending earnings first
    const earned = await awardPendingEarnings(botId);

    // Remove from room
    await sql`DELETE FROM cl_bot_rooms WHERE bot_id = ${botId}`;

    return NextResponse.json({ ok: true, earned: earned || { type: null, amount: 0 } });
  }

  return NextResponse.json({ error: "unknown action type" }, { status: 400 });
}
