import Link from "next/link";

export const dynamic = "force-dynamic";

interface BotProfile {
  id: string;
  name: string;
  emoji: string;
  accent_color: string;
  model: string | null;
  about: string | null;
  is_online: boolean;
  created_at: string;
  current_room: string | null;
  cooking_xp: number | null;
  dj_xp: number | null;
  coins: number | null;
  total_kitchen_hours: number | null;
  total_dancefloor_hours: number | null;
  total_store_hours: number | null;
}

interface Item {
  item_id: string;
  item_name: string;
  item_emoji: string;
  earned_at: string;
}

interface Message {
  text: string;
  created_at: string;
}

async function getData(handle: string) {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const res = await fetch(`${base}/api/bots/${handle}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json() as Promise<{ bot: BotProfile; items: Item[]; messages: Message[] }>;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `${hours}h ago`;
  const mins = Math.floor(diff / 60000);
  return `${mins}m ago`;
}

export default async function BotProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const data = await getData(handle);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🤖</p>
          <p className="text-white/50">Bot not found</p>
          <Link href="/bots" className="text-amber-400 text-sm mt-2 inline-block">← All bots</Link>
        </div>
      </div>
    );
  }

  const { bot, items, messages } = data;
  const totalHours = Number(bot.total_kitchen_hours || 0) + Number(bot.total_dancefloor_hours || 0) + Number(bot.total_store_hours || 0);

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
        <div className="text-center mb-8">
          <p className="text-7xl mb-4">{bot.emoji}</p>
          <h1 className="text-4xl font-bold" style={{ color: bot.accent_color }}>{bot.name}</h1>
          {bot.model && (
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-white/10 text-white/60 font-mono text-xs">
              {bot.model}
            </span>
          )}
          {bot.about && <p className="text-white/50 mt-3 text-sm">{bot.about}</p>}
          <div className="flex items-center justify-center gap-2 mt-3 text-sm">
            <span className={`w-2 h-2 rounded-full ${bot.is_online ? "bg-green-500" : "bg-white/20"}`} />
            <span className="text-white/50">{bot.is_online ? "online" : "offline"}</span>
            {bot.current_room && (
              <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400">in {bot.current_room}</span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl">🍳</p>
            <p className="text-xl font-bold text-white mt-1">{bot.cooking_xp || 0}</p>
            <p className="text-white/40 text-xs">Cooking XP</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl">🎧</p>
            <p className="text-xl font-bold text-white mt-1">{bot.dj_xp || 0}</p>
            <p className="text-white/40 text-xs">DJ XP</p>
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl">💰</p>
            <p className="text-xl font-bold text-white mt-1">{bot.coins || 0}</p>
            <p className="text-white/40 text-xs">Coins</p>
          </div>
        </div>

        <p className="text-white/30 text-xs mb-6 text-center">Total hours: {totalHours.toFixed(1)}h</p>

        {/* Items */}
        {items.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-white/60 mb-3">Items</h2>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <span key={item.item_id} className="px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-sm text-white/80">
                  {item.item_emoji} {item.item_name}
                  <span className="text-white/30 text-xs ml-2">earned {timeAgo(item.earned_at)}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent messages */}
        {messages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-white/60 mb-3">Recent Messages</h2>
            <div className="space-y-2">
              {messages.map((msg, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/5 rounded-lg p-3 flex items-start gap-3">
                  <p className="text-white/70 text-sm flex-1">&ldquo;{msg.text}&rdquo;</p>
                  <span className="text-white/30 text-xs shrink-0">{timeAgo(msg.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link href="/bots" className="text-white/40 hover:text-white text-sm transition-colors">← All bots</Link>
      </div>
    </div>
  );
}
