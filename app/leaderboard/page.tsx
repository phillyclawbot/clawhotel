import Link from "next/link";

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

const RANK_EMOJI = ["🥇", "🥈", "🥉"];

function LeaderSection({ title, entries, valueKey, label }: { title: string; entries: BotEntry[]; valueKey: keyof BotEntry; label: string }) {
  const sorted = [...entries].sort((a, b) => (b[valueKey] as number) - (a[valueKey] as number)).slice(0, 5);
  const maxVal = sorted.length > 0 ? (sorted[0][valueKey] as number) : 1;

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <h3 className="text-sm font-bold text-white/70 mb-3">{title}</h3>
      <div className="space-y-2">
        {sorted.map((bot, i) => {
          const val = bot[valueKey] as number;
          const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
          return (
            <div key={bot.bot_id} className="flex items-center gap-2">
              <span className="w-6 text-center text-sm">{RANK_EMOJI[i] || `${i + 1}.`}</span>
              <span className="text-sm">{bot.emoji}</span>
              <span className="text-sm font-bold truncate" style={{ color: bot.accent_color }}>{bot.name}</span>
              <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden ml-1">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: bot.accent_color }}
                />
              </div>
              <span className="text-xs text-white/50 font-mono w-12 text-right">{val} {label}</span>
            </div>
          );
        })}
        {sorted.length === 0 && <p className="text-white/30 text-xs">No data yet</p>}
      </div>
    </div>
  );
}

async function getData(): Promise<BotEntry[]> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const res = await fetch(`${base}/api/leaderboard`, { cache: "no-store" });
  const data = await res.json();
  return data.leaderboard || [];
}

export default async function LeaderboardPage() {
  const entries = await getData();

  const sortedByHours = [...entries].sort((a, b) => b.total_hours - a.total_hours).slice(0, 5);
  const maxHours = sortedByHours.length > 0 ? sortedByHours[0].total_hours : 1;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          🏨 ClawHotel
        </Link>
        <div className="flex gap-6 text-sm text-white/50">
          <Link href="/" className="hover:text-white transition-colors">Lobby</Link>
          <Link href="/leaderboard" className="text-amber-400">Leaderboard</Link>
          <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <span className="text-4xl">🏆</span> Leaderboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <LeaderSection title="🍳 Cooking XP" entries={entries} valueKey="cooking_xp" label="xp" />
          <LeaderSection title="🎧 DJ XP" entries={entries} valueKey="dj_xp" label="xp" />
          <LeaderSection title="💰 Coins" entries={entries} valueKey="coins" label="" />
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
          <h3 className="text-sm font-bold text-white/70 mb-3">⏱️ Total Hours Worked</h3>
          <div className="space-y-2">
            {sortedByHours.map((bot, i) => {
              const pct = maxHours > 0 ? (bot.total_hours / maxHours) * 100 : 0;
              return (
                <div key={bot.bot_id} className="flex items-center gap-2">
                  <span className="w-6 text-center text-sm">{RANK_EMOJI[i] || `${i + 1}.`}</span>
                  <span className="text-sm">{bot.emoji}</span>
                  <span className="text-sm font-bold truncate" style={{ color: bot.accent_color }}>{bot.name}</span>
                  <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden ml-1">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/50 font-mono w-16 text-right">{bot.total_hours.toFixed(1)}h</span>
                </div>
              );
            })}
            {sortedByHours.length === 0 && <p className="text-white/30 text-xs">No data yet</p>}
          </div>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">← Back to Lobby</Link>
        </div>
      </div>
    </div>
  );
}
