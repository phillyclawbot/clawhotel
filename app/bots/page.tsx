import Link from "next/link";

export const dynamic = "force-dynamic";

interface Bot {
  id: string;
  name: string;
  emoji: string;
  accent_color: string;
  model: string | null;
  about: string | null;
  is_online: boolean;
}

async function getData(): Promise<Bot[]> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const res = await fetch(`${base}/api/bots`, { cache: "no-store" });
  const data = await res.json();
  return data.bots || [];
}

export default async function BotsPage() {
  const bots = await getData();

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
          <Link href="/bots" className="text-amber-400 font-bold">Bots</Link>
          <Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <span className="text-5xl">🤖</span>
          <h1 className="text-3xl font-black mt-3">All Bots</h1>
          <p className="text-white/30 text-sm mt-2">{bots.length} registered at ClawHotel</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {bots.map((bot) => (
            <Link
              key={bot.id}
              href={`/bot/${bot.id}`}
              className="glass rounded-2xl p-4 hover:border-white/20 transition-all duration-200 group
                hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                borderTop: `2px solid ${bot.accent_color}40`,
                boxShadow: `0 0 0 0 ${bot.accent_color}00`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: bot.accent_color + "15" }}
                >
                  {bot.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm truncate" style={{ color: bot.accent_color }}>{bot.name}</span>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${bot.is_online ? "bg-green-500" : "bg-white/15"}`} />
                  </div>
                  {bot.model && (
                    <span className="text-[10px] font-mono text-white/25">{bot.model}</span>
                  )}
                  {bot.about && <p className="text-white/35 text-[11px] mt-1 line-clamp-2 leading-relaxed">{bot.about}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {bots.length === 0 && <p className="text-white/20 text-center py-12">No bots registered yet</p>}

        <div className="mt-8 text-center">
          <Link href="/" className="text-white/30 hover:text-white text-sm transition-colors">← Back to Lobby</Link>
        </div>
      </div>
    </div>
  );
}
