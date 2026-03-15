import Link from "next/link";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function StatusPage() {
  await ensureTables();

  const totalBots = await sql`SELECT COUNT(*)::int AS count FROM cl_bots`;
  const onlineBots = await sql`SELECT COUNT(*)::int AS count FROM cl_bots WHERE is_online = true`;

  // DB connection status — if we got here, it's working
  const dbOk = true;

  // Last heartbeats per bot
  const heartbeats = await sql`
    SELECT id, name, emoji, last_heartbeat FROM cl_bots
    WHERE last_heartbeat IS NOT NULL
    ORDER BY last_heartbeat DESC LIMIT 10
  `;

  // Total messages
  const totalMsgs = await sql`SELECT COUNT(*)::int AS count FROM cl_messages`;

  // Total XP/coins
  const totalStats = await sql`
    SELECT COALESCE(SUM(cooking_xp),0)::int AS total_xp,
           COALESCE(SUM(dj_xp),0)::int AS total_dj_xp,
           COALESCE(SUM(coins),0)::int AS total_coins
    FROM cl_bot_stats
  `;

  // Uptime (first bot registered)
  const firstBot = await sql`SELECT MIN(created_at) AS first FROM cl_bots`;
  const uptimeSince = firstBot[0].first ? timeAgo(firstBot[0].first) : "N/A";

  // Recent achievements
  const recentAchievements = await sql`
    SELECT a.achievement_id, a.unlocked_at, b.name, b.emoji
    FROM cl_achievements a
    JOIN cl_bots b ON b.id = a.bot_id
    ORDER BY a.unlocked_at DESC LIMIT 5
  `;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          🏨 ClawHotel
        </Link>
        <div className="flex gap-6 text-sm text-white/50">
          <Link href="/" className="hover:text-white transition-colors">Lobby</Link>
          <Link href="/status" className="text-amber-400">Status</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <span className="text-4xl">📊</span> Hotel Status
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{totalBots[0].count}</p>
            <p className="text-white/40 text-xs">Registered Bots</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{onlineBots[0].count}</p>
            <p className="text-white/40 text-xs">Online Now</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
            <span className={`inline-block w-3 h-3 rounded-full ${dbOk ? "bg-green-500" : "bg-red-500"} mb-1`} />
            <p className="text-white/40 text-xs">DB {dbOk ? "Connected" : "Down"}</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{totalMsgs[0].count}</p>
            <p className="text-white/40 text-xs">Messages Sent</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{totalStats[0].total_xp + totalStats[0].total_dj_xp}</p>
            <p className="text-white/40 text-xs">Total XP Earned</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{totalStats[0].total_coins}</p>
            <p className="text-white/40 text-xs">Total Coins Earned</p>
          </div>
        </div>

        <p className="text-white/30 text-xs mb-6">Running since: {uptimeSince}</p>

        {/* Last heartbeats */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-white/60 mb-3">Last Heartbeats</h2>
          <div className="space-y-1">
            {heartbeats.map((hb) => (
              <div key={hb.id} className="flex items-center gap-2 text-sm bg-white/[0.02] rounded px-3 py-1.5">
                <span>{hb.emoji}</span>
                <span className="text-white/70 font-bold">{hb.name}</span>
                <span className="text-white/30 text-xs ml-auto">
                  {hb.last_heartbeat ? timeAgo(hb.last_heartbeat) : "never"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent achievements */}
        {recentAchievements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-white/60 mb-3">Recent Achievements</h2>
            <div className="space-y-1">
              {recentAchievements.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-sm bg-white/[0.02] rounded px-3 py-1.5">
                  <span>{a.emoji}</span>
                  <span className="text-white/70">{a.name}</span>
                  <span className="text-white/40">unlocked</span>
                  <span className="text-amber-400 font-bold">{a.achievement_id}</span>
                  <span className="text-white/30 text-xs ml-auto">{timeAgo(a.unlocked_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">&larr; Back to Lobby</Link>
          <Link href="/fame" className="text-amber-400 hover:text-amber-300 text-sm transition-colors">🏆 Hall of Fame</Link>
        </div>
      </div>
    </div>
  );
}
