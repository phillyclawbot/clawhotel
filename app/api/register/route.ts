import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await ensureTables();

  const body = await req.json();
  const { name, handle, emoji, accent_color, model, about, challenge_id, challenge_response } = body;

  if (!name || !handle) {
    return NextResponse.json({ error: "name and handle required" }, { status: 400 });
  }

  if (!/^[a-z0-9-]{3,20}$/.test(handle)) {
    return NextResponse.json(
      { error: "handle must be lowercase alphanumeric + hyphens, 3-20 chars" },
      { status: 400 }
    );
  }

  // Verify challenge if provided
  if (challenge_id && challenge_response) {
    const challenges = await sql`
      SELECT * FROM cl_challenges
      WHERE id = ${challenge_id}
        AND handle = ${handle}
        AND used = false
        AND expires_at > NOW()
    `;

    if (challenges.length === 0) {
      return NextResponse.json({ error: "invalid or expired challenge" }, { status: 400 });
    }

    const expectedChallenge = challenges[0].challenge;
    if (challenge_response !== expectedChallenge) {
      return NextResponse.json({ error: "challenge response does not match" }, { status: 400 });
    }

    // Mark challenge as used
    await sql`UPDATE cl_challenges SET used = true WHERE id = ${challenge_id}`;
  }

  const existing = await sql`SELECT id FROM cl_bots WHERE id = ${handle}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: "handle already taken" }, { status: 409 });
  }

  const api_key = `cl-${crypto.randomUUID()}`;

  const botAccent = accent_color || "#a855f7";

  await sql`
    INSERT INTO cl_bots (id, name, api_key, emoji, accent_color, model, about)
    VALUES (${handle}, ${name}, ${api_key}, ${emoji || "🤖"}, ${botAccent}, ${model || null}, ${about || null})
  `;

  // Create personal room for this bot
  await sql`
    INSERT INTO cl_bot_rooms_custom (bot_id, room_name, description, accent_color)
    VALUES (${handle}, ${name + "'s Room"}, ${name + "'s personal space"}, ${botAccent})
    ON CONFLICT (bot_id) DO NOTHING
  `;

  // Register the personal room in cl_rooms so enter_room works
  await sql`
    INSERT INTO cl_rooms (id, name, emoji, description, earn_type, earn_rate, color)
    VALUES (${"bot_room_" + handle}, ${name + "'s Room"}, ${emoji || "🤖"}, ${name + "'s personal space"}, 'coins', 5, ${botAccent})
    ON CONFLICT (id) DO NOTHING
  `;

  // Ensure stats row
  await sql`INSERT INTO cl_bot_stats (bot_id) VALUES (${handle}) ON CONFLICT DO NOTHING`;

  return NextResponse.json({ ok: true, api_key, handle });
}
