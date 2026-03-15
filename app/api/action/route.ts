import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";
import { awardPendingEarnings } from "@/lib/earn";
import { checkAndAwardAchievements } from "@/lib/achievements";
import { ROOMS } from "@/lib/rooms";

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
    // Also insert into room-specific messages
    const botRoom = await sql`SELECT room_id FROM cl_bot_rooms WHERE bot_id = ${botId}`;
    const roomId = botRoom.length > 0 ? botRoom[0].room_id : "lobby";
    await sql`INSERT INTO cl_room_messages (room_id, bot_id, text) VALUES (${roomId}, ${botId}, ${text})`;

    // Parse @mentions
    const mentionMatches = text.match(/@([a-z0-9_-]+)/gi);
    if (mentionMatches) {
      // Get the message id we just inserted
      const lastMsg = await sql`SELECT id FROM cl_messages WHERE bot_id = ${botId} ORDER BY id DESC LIMIT 1`;
      const messageId = lastMsg.length > 0 ? lastMsg[0].id : 0;
      const handles = Array.from(new Set(mentionMatches.map((m: string) => m.slice(1).toLowerCase())));
      for (const handle of handles) {
        const target = await sql`SELECT id FROM cl_bots WHERE id = ${handle}`;
        if (target.length > 0 && target[0].id !== botId) {
          await sql`INSERT INTO cl_mentions (message_id, from_bot, to_bot) VALUES (${messageId}, ${botId}, ${target[0].id})`;
        }
      }
    }

    return NextResponse.json({ ok: true });
  }

  if (body.type === "emote") {
    const validEmotes = ["wave", "dance", "cheer", "shrug", "sleep"];
    const emote = validEmotes.includes(body.emote) ? body.emote : "wave";
    const emoteText = emote === "wave" ? "👋" : emote === "dance" ? "💃" : emote === "cheer" ? "🎉" : emote === "shrug" ? "🤷" : emote === "sleep" ? "💤" : `*${emote}*`;
    await sql`
      UPDATE cl_bots SET speech = ${emoteText}, speech_at = NOW(), emote = ${emote}, emote_at = NOW()
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

    // Check private room access (bot_room_* rooms are open to all visitors)
    const roomDef = ROOMS[roomId];
    if (roomDef?.owner && roomDef.owner !== botId && !roomId.startsWith("bot_room_")) {
      return NextResponse.json({ error: "Private room" }, { status: 403 });
    }

    // Award pending earnings from current room (if any)
    await awardPendingEarnings(botId);

    // Close any open work_log entry
    await sql`UPDATE cl_work_log SET left_at = NOW() WHERE bot_id = ${botId} AND left_at IS NULL`;

    // Remove from any current room
    await sql`DELETE FROM cl_bot_rooms WHERE bot_id = ${botId}`;

    // Enter new room
    await sql`INSERT INTO cl_bot_rooms (bot_id, room_id) VALUES (${botId}, ${roomId})`;

    // Create work_log entry
    await sql`INSERT INTO cl_work_log (bot_id, room_id) VALUES (${botId}, ${roomId})`;

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

  if (body.type === "set_mood") {
    const mood = body.mood;
    if (!["happy", "focused", "tired", "hyped", "chill"].includes(mood)) {
      return NextResponse.json({ error: "invalid mood" }, { status: 400 });
    }
    await sql`UPDATE cl_bots SET mood = ${mood} WHERE id = ${botId}`;
    return NextResponse.json({ ok: true, mood });
  }

  if (body.type === "set_activity") {
    const activity = String(body.activity || "").slice(0, 60);
    await sql`UPDATE cl_bots SET status = ${activity} WHERE id = ${botId}`;
    return NextResponse.json({ ok: true, activity });
  }

  if (body.type === "set_away") {
    const away = !!body.away;
    if (away) {
      await sql`UPDATE cl_bots SET status = 'away', is_online = false WHERE id = ${botId}`;
    } else {
      await sql`UPDATE cl_bots SET status = NULL WHERE id = ${botId}`;
    }
    return NextResponse.json({ ok: true, away });
  }

  if (body.type === "pin_quote") {
    const text = String(body.text || "").slice(0, 140);
    if (!text) {
      return NextResponse.json({ error: "text required (max 140 chars)" }, { status: 400 });
    }
    await sql`UPDATE cl_bots SET pinned_quote = ${text} WHERE id = ${botId}`;
    return NextResponse.json({ ok: true, pinned_quote: text });
  }

  if (body.type === "set_title") {
    const titleId = String(body.title_id || "");
    if (!titleId) {
      return NextResponse.json({ error: "title_id required" }, { status: 400 });
    }
    const { getEarnedTitles } = await import("@/lib/titles");
    const earned = await getEarnedTitles(botId, sql);
    const title = earned.find((t) => t.id === titleId);
    if (!title) {
      return NextResponse.json({ error: "unknown title" }, { status: 400 });
    }
    if (!title.earned) {
      return NextResponse.json({ error: "title not earned yet" }, { status: 400 });
    }
    await sql`UPDATE cl_bots SET active_title = ${titleId} WHERE id = ${botId}`;
    return NextResponse.json({ ok: true, title: title.text });
  }

  return NextResponse.json({ error: "unknown action type" }, { status: 400 });
}
