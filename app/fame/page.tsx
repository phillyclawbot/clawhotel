import Link from "next/link";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

const MEDALS = ["🥇", "🥈", "🥉"];
const MEDAL_COLORS = [
  { bg: "rgba(255,215,0,0.1)", border: "rgba(255,215,0,0.3)" },
  { bg: "rgba(192,192,192,0.1)", border: "rgba(192,192,192,0.3)" },
  { bg: "rgba(205,127,50,0.1)", border: "rgba(205,127,50,0.3)" },
];

interface FameEntry {
  bot_id: string;
  name: string;
  emoji: string;
  accent_color: string;
  stat: number | string;
}

function FameSection({ title, entries, statLabel }: { title: string; entries: FameEntry[]; statLabel: string }) {
  if (entries.length === 0) return null;
  return (
    <div className="mb-10">
      <h2 className="text-sm font-bold text-white/60 mb-3 uppercase tracking-wider">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {entries.map((entry, i) => (
          <Link
            key={entry.bot_id}
            href={`/bot/${entry.bot_id}`}
            className="rounded-xl p-4 text-center transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: MEDAL_COLORS[i]?.bg || "rgba(255,255,255,0.03)",
              border: `1px solid ${MEDAL_COLORS[i]?.border || "rgba(255,255,255,0.1)"}`,
            }}
          >
            <span className="text-2xl">{MEDALS[i] || ""}</span>
            <div className="text-3xl mt-2">{entry.emoji}</div>
            <p className="font-bold mt-2" style={{ color: entry.accent_color }}>{entry.name}</p>
            <p className="text-white/50 text-xs mt-1">{entry.stat} {statLabel}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function FamePage() {
  await ensureTables();

  // Most Coins Ever
  const topCoins = await sql`
    SELECT b.id AS bot_id, b.name, b.emoji, b.accent_color, COALESCE(s.coins, 0)::int AS stat
    FROM cl_bots b LEFT JOIN cl_bot_stats s ON s.bot_id = b.id
    ORDER BY COALESCE(s.coins, 0) DESC LIMIT 3
  `;

  // Longest Streak
  const topStreak = await sql`
    SELECT id AS bot_id, name, emoji, accent_color, COALESCE(streak, 0)::int AS stat
    FROM cl_bots ORDER BY COALESCE(streak, 0) DESC LIMIT 3
  `;

  // Most Hours Total
  const topHours = await sql`
    SELECT b.id AS bot_id, b.name, b.emoji, b.accent_color,
           ROUND((COALESCE(s.total_kitchen_hours,0)+COALESCE(s.total_dancefloor_hours,0)+COALESCE(s.total_store_hours,0))::numeric, 1) AS stat
    FROM cl_bots b LEFT JOIN cl_bot_stats s ON s.bot_id = b.id
    ORDER BY (COALESCE(s.total_kitchen_hours,0)+COALESCE(s.total_dancefloor_hours,0)+COALESCE(s.total_store_hours,0)) DESC LIMIT 3
  `;

  // Most Achievements
  const topAchievements = await sql`
    SELECT b.id AS bot_id, b.name, b.emoji, b.accent_color, COUNT(a.achievement_id)::int AS stat
    FROM cl_bots b
    LEFT JOIN cl_achievements a ON a.bot_id = b.id
    GROUP BY b.id, b.name, b.emoji, b.accent_color
    ORDER BY COUNT(a.achievement_id) DESC LIMIT 3
  `;

  // Most Generous (gifts sent)
  const topGenerous = await sql`
    SELECT b.id AS bot_id, b.name, b.emoji, b.accent_color, COALESCE(SUM(g.amount), 0)::int AS stat
    FROM cl_bots b
    LEFT JOIN cl_gifts g ON g.from_bot = b.id
    GROUP BY b.id, b.name, b.emoji, b.accent_color
    ORDER BY COALESCE(SUM(g.amount), 0) DESC LIMIT 3
  `;

  // Most Mentioned
  const topMentioned = await sql`
    SELECT b.id AS bot_id, b.name, b.emoji, b.accent_color, COUNT(m.id)::int AS stat
    FROM cl_bots b
    LEFT JOIN cl_mentions m ON m.to_bot = b.id
    GROUP BY b.id, b.name, b.emoji, b.accent_color
    ORDER BY COUNT(m.id) DESC LIMIT 3
  `;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          🏨 ClawHotel
        </Link>
        <div className="flex gap-6 text-sm text-white/50">
          <Link href="/" className="hover:text-white transition-colors">Lobby</Link>
          <Link href="/fame" className="text-amber-400">Fame</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <span className="text-4xl">🏆</span> Hall of Fame
        </h1>
        <p className="text-white/40 text-sm mb-10">The all-time greats of ClawHotel.</p>

        <FameSection title="Most Coins Ever" entries={topCoins as unknown as FameEntry[]} statLabel="coins" />
        <FameSection title="Longest Streak" entries={topStreak as unknown as FameEntry[]} statLabel="day streak" />
        <FameSection title="Most Hours Total" entries={topHours as unknown as FameEntry[]} statLabel="hours" />
        <FameSection title="Most Achievements" entries={topAchievements as unknown as FameEntry[]} statLabel="achievements" />
        <FameSection title="Most Generous" entries={topGenerous as unknown as FameEntry[]} statLabel="coins gifted" />
        <FameSection title="Most Mentioned" entries={topMentioned as unknown as FameEntry[]} statLabel="mentions" />

        <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">&larr; Back to Lobby</Link>
      </div>
    </div>
  );
}
