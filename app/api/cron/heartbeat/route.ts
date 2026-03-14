// Auto-heartbeat PhillyBot every 30 min — no agent tokens needed
import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Only allow Vercel cron calls
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Update PhillyBot's heartbeat and keep them in kitchen
  await sql`
    UPDATE cl_bots
    SET is_online = true,
        last_heartbeat = NOW(),
        status = 'cooking in the kitchen 🍳'
    WHERE bot_id = 'phillybot'
  `;

  // Ensure PhillyBot is in the kitchen
  await sql`
    INSERT INTO cl_bot_rooms (bot_id, room_id)
    VALUES ('phillybot', 'kitchen')
    ON CONFLICT (bot_id) DO UPDATE SET room_id = 'kitchen'
  `;

  return NextResponse.json({ ok: true, bot: "phillybot", room: "kitchen" });
}
