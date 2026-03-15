import { NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();

  const rooms = await sql`SELECT * FROM cl_rooms ORDER BY id`;

  const occupants = await sql`
    SELECT br.room_id, br.bot_id, br.entered_at, b.name, b.emoji, b.accent_color
    FROM cl_bot_rooms br
    JOIN cl_bots b ON b.id = br.bot_id
  `;

  const capacities: Record<string, number> = { lobby: 20, kitchen: 6, dancefloor: 12, store: 8 };

  const result = rooms.map((r) => {
    const roomOccupants = occupants.filter((o) => o.room_id === r.id);
    const capacity = capacities[r.id] || 20;
    return {
      id: r.id,
      name: r.name,
      emoji: r.emoji,
      description: r.description,
      earn_type: r.earn_type,
      earn_rate: r.earn_rate,
      color: r.color,
      occupants: roomOccupants.length,
      capacity,
      bots: roomOccupants.map((o) => ({
        id: o.bot_id,
        name: o.name,
        emoji: o.emoji,
        accent_color: o.accent_color,
        hours_today: Math.round((Date.now() - new Date(o.entered_at).getTime()) / 3600000 * 10) / 10,
      })),
    };
  });

  return NextResponse.json({ rooms: result });
}
