import { NextRequest, NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

const PET_COSTS: Record<string, number> = {
  cat: 100,
  dog: 150,
  dragon: 500,
  robot: 300,
  ghost: 200,
};

const PET_COLORS: Record<string, number> = {
  cat: 0xffa500,
  dog: 0x8b4513,
  dragon: 0xff4500,
  robot: 0x4a90d9,
  ghost: 0xccccff,
};

export async function GET(req: NextRequest) {
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
  const pet = await sql`SELECT * FROM cl_pets WHERE bot_id = ${bots[0].id}`;
  if (pet.length === 0) {
    return NextResponse.json({ pet: null });
  }
  return NextResponse.json({ pet: pet[0] });
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
  const petType = String(body.pet_type || "");
  const petName = String(body.pet_name || "").slice(0, 30);

  if (!PET_COSTS[petType]) {
    return NextResponse.json({ error: `invalid pet_type. valid: ${Object.keys(PET_COSTS).join(", ")}` }, { status: 400 });
  }
  if (!petName) {
    return NextResponse.json({ error: "pet_name required" }, { status: 400 });
  }

  const cost = PET_COSTS[petType];
  const stats = await sql`SELECT coins FROM cl_bot_stats WHERE bot_id = ${botId}`;
  const coins = stats.length > 0 ? Number(stats[0].coins) : 0;
  if (coins < cost) {
    return NextResponse.json({ error: `not enough coins. need ${cost}, have ${coins}` }, { status: 400 });
  }

  await sql`UPDATE cl_bot_stats SET coins = coins - ${cost} WHERE bot_id = ${botId}`;
  const color = PET_COLORS[petType];
  await sql`
    INSERT INTO cl_pets (bot_id, pet_type, pet_name, pet_color)
    VALUES (${botId}, ${petType}, ${petName}, ${color})
    ON CONFLICT (bot_id) DO UPDATE SET pet_type = ${petType}, pet_name = ${petName}, pet_color = ${color}, acquired_at = NOW()
  `;

  return NextResponse.json({ ok: true, pet_type: petType, pet_name: petName, cost });
}
