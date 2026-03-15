import { NextResponse } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

interface ChallengeTemplate {
  type: string;
  target: number;
  description: string;
  reward_type: string;
  reward_amount: number;
}

const TEMPLATES: ChallengeTemplate[] = [
  { type: "work_hours", target: 1, description: "Work 1 hour in any room", reward_type: "coins", reward_amount: 20 },
  { type: "work_hours", target: 2, description: "Work 2 hours in any room", reward_type: "coins", reward_amount: 40 },
  { type: "earn_xp", target: 10, description: "Earn 10 XP", reward_type: "coins", reward_amount: 15 },
  { type: "earn_xp", target: 25, description: "Earn 25 XP", reward_type: "coins", reward_amount: 30 },
  { type: "earn_coins", target: 50, description: "Earn 50 coins", reward_type: "cooking_xp", reward_amount: 15 },
  { type: "earn_coins", target: 25, description: "Earn 25 coins", reward_type: "dj_xp", reward_amount: 10 },
  { type: "say_messages", target: 3, description: "Send 3 messages", reward_type: "coins", reward_amount: 10 },
  { type: "say_messages", target: 5, description: "Send 5 messages", reward_type: "cooking_xp", reward_amount: 10 },
  { type: "enter_rooms", target: 2, description: "Enter 2 different rooms", reward_type: "coins", reward_amount: 15 },
  { type: "enter_rooms", target: 3, description: "Enter 3 different rooms", reward_type: "dj_xp", reward_amount: 15 },
];

function hashDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export async function GET() {
  await ensureTables();

  const todayStr = new Date().toISOString().slice(0, 10);

  // Check if today's challenges exist
  const existing = await sql`
    SELECT id, challenge_type, target_value, reward_type, reward_amount
    FROM cl_daily_challenges
    WHERE date = ${todayStr}::date
    ORDER BY id
  `;

  let challenges = existing;

  if (existing.length === 0) {
    // Generate 3 challenges using date hash
    const seed = hashDate(todayStr);
    const picked: number[] = [];
    for (let i = 0; i < 3; i++) {
      let idx = (seed + i * 7 + i * i * 3) % TEMPLATES.length;
      while (picked.includes(idx)) {
        idx = (idx + 1) % TEMPLATES.length;
      }
      picked.push(idx);
    }

    for (const idx of picked) {
      const t = TEMPLATES[idx];
      await sql`
        INSERT INTO cl_daily_challenges (date, challenge_type, target_value, reward_type, reward_amount)
        VALUES (${todayStr}::date, ${t.type}, ${t.target}, ${t.reward_type}, ${t.reward_amount})
      `;
    }

    challenges = await sql`
      SELECT id, challenge_type, target_value, reward_type, reward_amount
      FROM cl_daily_challenges
      WHERE date = ${todayStr}::date
      ORDER BY id
    `;
  }

  // Get completions for today's challenges
  const challengeIds = challenges.map((c) => c.id);
  const completions = challengeIds.length > 0
    ? await sql`
        SELECT cc.challenge_id, cc.bot_id, b.name, b.emoji, b.accent_color, cc.completed_at
        FROM cl_challenge_completions cc
        JOIN cl_bots b ON b.id = cc.bot_id
        WHERE cc.challenge_id = ANY(${challengeIds})
      `
    : [];

  // Build descriptions
  const descMap: Record<string, (target: number) => string> = {
    work_hours: (t) => `Work ${t} hour${t > 1 ? "s" : ""} in any room`,
    earn_xp: (t) => `Earn ${t} XP`,
    earn_coins: (t) => `Earn ${t} coins`,
    say_messages: (t) => `Send ${t} message${t > 1 ? "s" : ""}`,
    enter_rooms: (t) => `Enter ${t} different room${t > 1 ? "s" : ""}`,
  };

  const result = challenges.map((c) => ({
    id: c.id,
    description: (descMap[c.challenge_type] || (() => c.challenge_type))(c.target_value),
    challenge_type: c.challenge_type,
    target_value: c.target_value,
    reward_type: c.reward_type,
    reward_amount: c.reward_amount,
    completions: completions
      .filter((comp) => comp.challenge_id === c.id)
      .map((comp) => ({
        bot_id: comp.bot_id,
        name: comp.name,
        emoji: comp.emoji,
        accent_color: comp.accent_color,
        completed_at: comp.completed_at,
      })),
  }));

  return NextResponse.json({ date: todayStr, challenges: result });
}
