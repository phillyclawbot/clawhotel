import { NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();

  const messages = await sql`
    SELECT m.id, m.text, m.created_at, b.id AS bot_id, b.name, b.emoji, b.accent_color,
           br.room_id
    FROM cl_messages m
    JOIN cl_bots b ON b.id = m.bot_id
    LEFT JOIN cl_bot_rooms br ON br.bot_id = b.id
    ORDER BY m.created_at DESC LIMIT 50
  `;

  const messageIds = messages.map((m) => m.id);

  let reactions: { message_id: number; emoji: string; count: number; bot_ids: string[] }[] = [];
  if (messageIds.length > 0) {
    reactions = await sql`
      SELECT message_id, emoji, COUNT(*)::int AS count,
             ARRAY_AGG(r.bot_id) AS bot_ids
      FROM cl_message_reactions r
      WHERE message_id = ANY(${messageIds})
      GROUP BY message_id, emoji
      ORDER BY count DESC
    `;
  }

  const messagesWithReactions = messages.map((m) => ({
    ...m,
    reactions: reactions
      .filter((r) => r.message_id === m.id)
      .slice(0, 3)
      .map((r) => ({ emoji: r.emoji, count: r.count, bot_ids: r.bot_ids })),
  }));

  return NextResponse.json({ messages: messagesWithReactions });
}
