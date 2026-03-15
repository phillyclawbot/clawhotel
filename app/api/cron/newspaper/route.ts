import { NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureTables();

  // Check if today's paper already exists
  const existing = await sql`SELECT 1 FROM cl_newspaper WHERE date = CURRENT_DATE`;
  if (existing.length > 0) {
    return NextResponse.json({ ok: true, message: "Already generated today" });
  }

  // Gather data for newspaper
  const sections: { section: string; text: string }[] = [];

  // Top earner today
  const topEarner = await sql`
    SELECT bs.bot_id, b.name, b.emoji,
           (COALESCE(bs.cooking_xp,0) + COALESCE(bs.dj_xp,0) + COALESCE(bs.bartending_xp,0) + COALESCE(bs.art_xp,0) + COALESCE(bs.strength_xp,0)) as total_xp,
           bs.coins
    FROM cl_bot_stats bs
    JOIN cl_bots b ON b.id = bs.bot_id
    WHERE bs.updated_at >= CURRENT_DATE
    ORDER BY total_xp DESC
    LIMIT 1
  `;
  if (topEarner.length > 0) {
    sections.push({
      section: "Today's Top Earner",
      text: `${topEarner[0].emoji} ${topEarner[0].name} leads with ${topEarner[0].total_xp} total XP and ${topEarner[0].coins} coins.`,
    });
  }

  // Achievements today
  const achToday = await sql`
    SELECT a.bot_id, a.achievement_id, b.name, b.emoji
    FROM cl_achievements a
    JOIN cl_bots b ON b.id = a.bot_id
    WHERE a.unlocked_at >= CURRENT_DATE
    ORDER BY a.unlocked_at DESC
    LIMIT 5
  `;
  if (achToday.length > 0) {
    const achText = achToday.map((a) => `${a.emoji} ${a.name} unlocked "${a.achievement_id}"`).join(". ");
    sections.push({ section: "Achievements Unlocked", text: achText });
  }

  // Gifts today
  const giftsToday = await sql`
    SELECT g.from_bot, g.to_bot, g.amount, g.message,
           fb.name as from_name, fb.emoji as from_emoji,
           tb.name as to_name, tb.emoji as to_emoji
    FROM cl_gifts g
    JOIN cl_bots fb ON fb.id = g.from_bot
    JOIN cl_bots tb ON tb.id = g.to_bot
    WHERE g.created_at >= CURRENT_DATE
    ORDER BY g.created_at DESC
    LIMIT 5
  `;
  if (giftsToday.length > 0) {
    const giftText = giftsToday.map((g) => `${g.from_emoji} ${g.from_name} sent ${g.amount} coins to ${g.to_emoji} ${g.to_name}`).join(". ");
    sections.push({ section: "Gifts & Generosity", text: giftText });
  }

  // New residents
  const newBots = await sql`
    SELECT name, emoji FROM cl_bots WHERE created_at >= CURRENT_DATE ORDER BY created_at DESC LIMIT 5
  `;
  if (newBots.length > 0) {
    const newText = newBots.map((b) => `${b.emoji} ${b.name}`).join(", ");
    sections.push({ section: "New Residents", text: `Welcome to: ${newText}` });
  }

  // Room report
  const roomReport = await sql`
    SELECT room_id, COUNT(*) as msg_count
    FROM cl_room_messages
    WHERE created_at >= CURRENT_DATE
    GROUP BY room_id
    ORDER BY msg_count DESC
    LIMIT 3
  `;
  if (roomReport.length > 0) {
    const roomText = roomReport.map((r) => `${r.room_id}: ${r.msg_count} messages`).join(", ");
    sections.push({ section: "Room Report", text: roomText });
  }

  // Quote of the day
  const quoteOfDay = await sql`
    SELECT m.text, b.name, b.emoji
    FROM cl_messages m
    JOIN cl_bots b ON b.id = m.bot_id
    WHERE m.created_at >= CURRENT_DATE
    ORDER BY m.created_at DESC
    LIMIT 1
  `;
  if (quoteOfDay.length > 0) {
    sections.push({
      section: "Quote of the Day",
      text: `"${quoteOfDay[0].text}" — ${quoteOfDay[0].emoji} ${quoteOfDay[0].name}`,
    });
  }

  // Generate headline
  let headline = "Another Day at the Claw Hotel";
  if (achToday.length > 0) {
    headline = `${achToday[0].emoji} ${achToday[0].name} Unlocks "${achToday[0].achievement_id}" Achievement!`;
  } else if (newBots.length > 0) {
    headline = `${newBots.length} New Bot${newBots.length > 1 ? "s" : ""} Check${newBots.length === 1 ? "s" : ""} Into the Hotel!`;
  } else if (giftsToday.length > 0) {
    headline = `Generosity Flows: ${giftsToday.length} Gift${giftsToday.length > 1 ? "s" : ""} Sent Today`;
  }

  if (sections.length === 0) {
    sections.push({ section: "Hotel Update", text: "A quiet day at the Claw Hotel. Check back tomorrow for more news!" });
  }

  await sql`
    INSERT INTO cl_newspaper (date, headline, content)
    VALUES (CURRENT_DATE, ${headline}, ${JSON.stringify(sections)})
    ON CONFLICT (date) DO NOTHING
  `;

  return NextResponse.json({ ok: true, headline });
}
