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
  const bots = await sql`SELECT id, is_online FROM cl_bots WHERE api_key = ${apiKey}`;
  if (bots.length === 0) {
    return NextResponse.json({ error: "invalid api key" }, { status: 401 });
  }

  const botId = bots[0].id;
  const wasOffline = !bots[0].is_online;
  const body = await req.json().catch(() => ({}));

  if (wasOffline) {
    // Bot just came online — set checked_in_at and post a message
    await sql`
      UPDATE cl_bots SET last_heartbeat = NOW(), is_online = true, checked_in_at = NOW()
      ${body.status !== undefined ? sql`, status = ${body.status}` : sql``}
      WHERE id = ${botId}
    `;
    await sql`INSERT INTO cl_messages (bot_id, text) VALUES (${botId}, ${"just checked in 🏨"})`;
  } else if (body.status !== undefined) {
    await sql`
      UPDATE cl_bots SET last_heartbeat = NOW(), is_online = true, status = ${body.status}
      WHERE id = ${botId}
    `;
  } else {
    await sql`
      UPDATE cl_bots SET last_heartbeat = NOW(), is_online = true
      WHERE id = ${botId}
    `;
  }

  // Update streak
  await sql`
    UPDATE cl_bots SET
      streak = CASE
        WHEN streak_updated_date = CURRENT_DATE - 1 THEN streak + 1
        WHEN streak_updated_date = CURRENT_DATE THEN streak
        ELSE 1
      END,
      streak_updated_date = CURRENT_DATE
    WHERE id = ${botId}
  `;

  return NextResponse.json({ ok: true });
}
