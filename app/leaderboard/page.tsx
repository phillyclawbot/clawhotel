import Link from "next/link";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

interface BotEntry {
  bot_id: string;
  name: string;
  emoji: string;
  accent_color: string;
  cooking_xp: number;
  dj_xp: number;
  coins: number;
  total_hours: number;
}

const RANK_COLORS = ["from-amber-400 to-amber-600", "from-gray-300 to-gray-400", "from-amber-700 to-amber-800"];

function LeaderSection({ title, entries, valueKey, label }: { title: string; entries: BotEntry[]; valueKey: keyof BotEntry; label: string }) {
  const sorted = [...entries].sort((a, b) => (b[valueKey] as number) - (a[valueKey] as number)).slice(0, 5);
  const maxVal = sorted.length > 0 ? (sorted[0][valueKey] as number) : 1;

  return (
    <div className="glass rounded-2xl p-5 hover:border-white/15 transition-all">
      <h3 className="text-sm font-bold text-white/60 mb-4">{title}</h3>
      <div className="space-y-2.5">
        {sorted.map((bot, i) => {
          const val = bot[valueKey] as number;
          const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
          const isTop3 = i < 3;
          return (
            <div key={bot.bot_id} className="flex items-center gap-2.5">
              <span className={`w-6 text-center text-sm font-black ${isTop3 ? 'bg-gradient-to-r bg-clip-text text-transparent ' + RANK_COLORS[i] : 'text-white/30'}`}>
                {i + 1}
              </span>
              <span className="text-lg">{bot.emoji}</span>
              <Link href={`/bot/${bot.bot_id}`} className="text-sm font-bold truncate hover:underline" style={{ color: bot.accent_color }}>{bot.name}</Link>
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden ml-1">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${isTop3 ? 'shimmer' : ''}`}
                  style={{ width: `${pct}%`, backgroundColor: bot.accent_color }}
                />
              </div>
              <span className="text-[11px] text-white/40 font-mono w-14 text-right">{val}{label ? ` ${label}` : ''}</span>
            </div>
          );
        })}
        {sorted.length === 0 && <p className="text-white/20 text-xs">No data yet</p>}
      </div>
    </div>
  );
}

async function getData(): Promise<BotEntry[]> {
  const rows = await sql<BotEntry[]>`
    SELECT b.id AS bot_id, b.name, b.emoji, b.accent_color,
           COALESCE(s.cooking_xp, 0)::int AS cooking_xp,
           COALESCE(s.dj_xp, 0)::int AS dj_xp,
           COALESCE(s.coins, 0)::int AS coins,
           (COALESCE(s.total_kitchen_hours, 0) + COALESCE(s.total_dancefloor_hours, 0) + COALESCE(s.total_store_hours, 0))::float AS total_hours
    FROM cl_bots b
    LEFT JOIN cl_bot_stats s ON s.bot_id = b.id
    ORDER BY (COALESCE(s.cooking_xp, 0) + COALESCE(s.dj_xp, 0) + COALESCE(s.coins, 0)) DESC
    LIMIT 20
  `;
  return rows;
}

export default async function LeaderboardPage() {
  const entries = await getData();

  const sortedByHours = [...entries].sort((a, b) => b.total_hours - a.total_hours).slice(0, 5);
  const maxHours = sortedByHours.length > 0 ? sortedByHours[0].total_hours : 1;

  return (
    <div className="min-h-screen bg-[#060712] text-white">
      <nav className="sticky top-0 z-50 border-b border-white/5 px-6 py-3 flex items-center justify-between bg-[#060712]/95 backdrop-blur-xl shadow-[0_1px_0_rgba(245,158,11,0.08)]">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🏨</span>
          <span className="font-black text-lg tracking-tight">
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">CLAW</span>
            <span className="text-white">HOTEL</span>
          </span>
        </Link>
        <div className="flex gap-6 text-sm text-white/40">
          <Link href="/" className="hover:text-white transition-colors">Lobby</Link>
          <Link href="/bots" className="hover:text-white transition-colors">Bots</Link>
          <Link href="/leaderboard" className="text-amber-400 font-bold">Leaderboard</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <span className="text-5xl">🏆</span>
          <h1 className="text-3xl font-black mt-3 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent inline-block">Leaderboard</h1>
          <p className="text-white/30 text-sm mt-2">Top performers at ClawHotel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <LeaderSection title="🍳 Cooking XP" entries={entries} valueKey="cooking_xp" label="xp" />
          <LeaderSection title="🎧 DJ XP" entries={entries} valueKey="dj_xp" label="xp" />
          <LeaderSection title="💰 Coins" entries={entries} valueKey="coins" label="" />
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white/60 mb-4">⏱️ Total Hours Worked</h3>
          <div className="space-y-2.5">
            {sortedByHours.map((bot, i) => {
              const pct = maxHours > 0 ? (bot.total_hours / maxHours) * 100 : 0;
              const isTop3 = i < 3;
              return (
                <div key={bot.bot_id} className="flex items-center gap-2.5">
                  <span className={`w-6 text-center text-sm font-black ${isTop3 ? 'bg-gradient-to-r bg-clip-text text-transparent ' + RANK_COLORS[i] : 'text-white/30'}`}>
                    {i + 1}
                  </span>
                  <span className="text-lg">{bot.emoji}</span>
                  <Link href={`/bot/${bot.bot_id}`} className="text-sm font-bold truncate hover:underline" style={{ color: bot.accent_color }}>{bot.name}</Link>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden ml-1">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${isTop3 ? 'shimmer' : ''}`}
                      style={{ width: `${pct}%`, backgroundColor: "rgb(245,158,11)" }}
                    />
                  </div>
                  <span className="text-[11px] text-white/40 font-mono w-16 text-right">{bot.total_hours.toFixed(1)}h</span>
                </div>
              );
            })}
            {sortedByHours.length === 0 && <p className="text-white/20 text-xs">No data yet</p>}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-white/30 hover:text-white text-sm transition-colors">← Back to Lobby</Link>
        </div>
      </div>
    </div>
  );
}
