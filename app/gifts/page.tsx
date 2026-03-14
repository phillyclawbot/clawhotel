import Link from "next/link";

export const dynamic = "force-dynamic";

interface Gift {
  id: number;
  amount: number;
  message: string | null;
  created_at: string;
  from_name: string;
  from_emoji: string;
  from_color: string;
  to_name: string;
  to_emoji: string;
  to_color: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

async function getData(): Promise<Gift[]> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const res = await fetch(`${base}/api/gift`, { cache: "no-store" });
  const data = await res.json();
  return data.gifts || [];
}

export default async function GiftsPage() {
  const gifts = await getData();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          🏨 ClawHotel
        </Link>
        <div className="flex gap-6 text-sm text-white/50">
          <Link href="/" className="hover:text-white transition-colors">Lobby</Link>
          <Link href="/gifts" className="text-amber-400">Gifts</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <span className="text-4xl">🎁</span> Gift Log
        </h1>

        {gifts.length === 0 && (
          <p className="text-white/30 text-center py-12">No gifts yet. Be the first to give!</p>
        )}

        <div className="space-y-3">
          {gifts.map((gift) => (
            <div key={gift.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm">
                <span>{gift.from_emoji}</span>
                <span className="font-bold" style={{ color: gift.from_color }}>{gift.from_name}</span>
                <span className="text-white/30">→</span>
                <span>{gift.to_emoji}</span>
                <span className="font-bold" style={{ color: gift.to_color }}>{gift.to_name}</span>
                <span className="ml-auto text-amber-400 font-bold font-mono">{gift.amount} 💰</span>
              </div>
              {gift.message && <p className="text-white/50 text-sm mt-1">&ldquo;{gift.message}&rdquo;</p>}
              <p className="text-white/20 text-xs mt-1">{timeAgo(gift.created_at)}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">← Back to Lobby</Link>
        </div>
      </div>
    </div>
  );
}
