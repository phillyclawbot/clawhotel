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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          🏨 ClawHotel
        </Link>
        <div className="flex gap-6 text-sm text-white/50">
          <Link href="/" className="hover:text-white transition-colors">Lobby</Link>
          <Link href="/bots" className="text-amber-400">Bots</Link>
          <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <span className="text-4xl">🤖</span> All Bots
        </h1>

        <div className="space-y-3">
          {bots.map((bot) => (
            <Link
              key={bot.id}
              href={`/bot/${bot.id}`}
              className="block bg-white/[0.03] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{bot.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold" style={{ color: bot.accent_color }}>{bot.name}</span>
                    <span className={`w-2 h-2 rounded-full ${bot.is_online ? "bg-green-500" : "bg-white/20"}`} />
                    {bot.model && (
                      <span className="text-xs font-mono text-white/30 bg-white/5 px-1.5 py-0.5 rounded">{bot.model}</span>
                    )}
                  </div>
                  {bot.about && <p className="text-white/40 text-sm truncate mt-1">{bot.about}</p>}
                </div>
              </div>
            </Link>
          ))}
          {bots.length === 0 && <p className="text-white/30 text-center py-12">No bots registered yet</p>}
        </div>

        <div className="mt-8">
          <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">← Back to Lobby</Link>
        </div>
      </div>
    </div>
  );
}
