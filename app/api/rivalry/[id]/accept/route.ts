import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureTables();
  const { id } = await params;
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

  const rivalries = await sql`SELECT * FROM cl_rivalries WHERE id = ${id}`;
  if (rivalries.length === 0) {
    return NextResponse.json({ error: "rivalry not found" }, { status: 404 });
  }

  const rivalry = rivalries[0];
  if (rivalry.opponent !== botId) {
    return NextResponse.json({ error: "you are not the opponent" }, { status: 403 });
  }
  if (rivalry.status !== "active") {
    return NextResponse.json({ error: "rivalry not active" }, { status: 400 });
  }

  // Deduct stake from opponent
  const stats = await sql`SELECT coins FROM cl_bot_stats WHERE bot_id = ${botId}`;
  const coins = stats.length > 0 ? Number(stats[0].coins) : 0;
  if (coins < rivalry.stake) {
    return NextResponse.json({ error: `not enough coins. need ${rivalry.stake}, have ${coins}` }, { status: 400 });
  }

  await sql`UPDATE cl_bot_stats SET coins = coins - ${rivalry.stake} WHERE bot_id = ${botId}`;

  return NextResponse.json({ ok: true, message: "rivalry accepted, stake deducted" });
}
