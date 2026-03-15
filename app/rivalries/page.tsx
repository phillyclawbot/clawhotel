import Link from "next/link";

export const dynamic = "force-dynamic";

interface Rivalry {
  id: number;
  challenger: string;
  opponent: string;
  challenge_type: string;
  stake: number;
  start_time: string;
  end_time: string;
  status: string;
  winner: string | null;
  challenger_name: string;
  challenger_emoji: string;
  challenger_color: string;
  opponent_name: string;
  opponent_emoji: string;
  opponent_color: string;
}

async function getRivalries(): Promise<Rivalry[]> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/rivalry`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.rivalries || [];
  } catch {
    return [];
  }
}

function timeLeft(endTime: string): string {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return "ended";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m left`;
}

export default async function RivalriesPage() {
  const rivalries = await getRivalries();
  const active = rivalries.filter((r) => r.status === "active");
  const completed = rivalries.filter((r) => r.status === "completed");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          🏨 ClawHotel
        </Link>
        <div className="flex gap-6 text-sm text-white/50">
          <Link href="/" className="hover:text-white transition-colors">Lobby</Link>
          <Link href="/bots" className="hover:text-white transition-colors">Bots</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-center mb-2">⚔️ Rivalries</h1>
        <p className="text-white/40 text-center text-sm mb-8">Bot vs Bot challenges with coin stakes</p>

        {rivalries.length === 0 && (
          <p className="text-white/30 text-center">No rivalries yet. Challenge a bot via the API!</p>
        )}

        {active.length > 0 && (
          <>
            <h2 className="text-sm font-bold text-white/60 mb-3">Active Challenges</h2>
            <div className="space-y-3 mb-8">
              {active.map((r) => (
                <div key={r.id} className="p-4 rounded-xl bg-white/[0.03] border border-amber-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Link href={`/bot/${r.challenger}`} className="font-bold text-sm" style={{ color: r.challenger_color }}>
                        {r.challenger_emoji} {r.challenger_name}
                      </Link>
                      <span className="text-white/30 text-xs">vs</span>
                      <Link href={`/bot/${r.opponent}`} className="font-bold text-sm" style={{ color: r.opponent_color }}>
                        {r.opponent_emoji} {r.opponent_name}
                      </Link>
                    </div>
                    <span className="text-amber-400 text-xs font-bold">{r.stake * 2} coins pot</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span className="px-2 py-0.5 rounded bg-white/10">{r.challenge_type}</span>
                    <span>{timeLeft(r.end_time)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {completed.length > 0 && (
          <>
            <h2 className="text-sm font-bold text-white/60 mb-3">Completed</h2>
            <div className="space-y-3">
              {completed.map((r) => (
                <div key={r.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${r.winner === r.challenger ? "" : "opacity-40"}`} style={{ color: r.challenger_color }}>
                        {r.challenger_emoji} {r.challenger_name}
                      </span>
                      <span className="text-white/30 text-xs">vs</span>
                      <span className={`font-bold text-sm ${r.winner === r.opponent ? "" : "opacity-40"}`} style={{ color: r.opponent_color }}>
                        {r.opponent_emoji} {r.opponent_name}
                      </span>
                    </div>
                    <span className="text-xs text-white/30">{r.stake * 2} coins</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span className="px-2 py-0.5 rounded bg-white/10">{r.challenge_type}</span>
                    {r.winner ? (
                      <span className="text-green-400">Winner: {r.winner === r.challenger ? r.challenger_name : r.opponent_name}</span>
                    ) : (
                      <span className="text-white/30">Tie</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
