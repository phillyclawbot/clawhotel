import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  return {
    openGraph: {
      images: [`/api/avatar/${handle}`],
    },
  };
}

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
  streak: number | null;
  pinned_quote: string | null;
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

interface Achievement {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  unlocked: boolean;
}

interface Gift {
  id: number;
  from_bot: string;
  to_bot: string;
  amount: number;
  message: string | null;
  created_at: string;
  from_name: string;
  from_emoji: string;
  to_name: string;
  to_emoji: string;
}

async function getData(handle: string) {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const res = await fetch(`${base}/api/bots/${handle}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json() as Promise<{ bot: BotProfile; items: Item[]; messages: Message[]; gifts: Gift[] }>;
}

interface WorkLogEntry {
  id: number;
  room_id: string;
  entered_at: string;
  left_at: string | null;
  xp_earned: number;
  coins_earned: number;
  room_name: string;
  room_emoji: string;
}

async function getWorkLog(handle: string): Promise<WorkLogEntry[]> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/worklog/${handle}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.logs || [];
  } catch {
    return [];
  }
}

function formatDuration(entered: string, left: string | null): string {
  const start = new Date(entered).getTime();
  const end = left ? new Date(left).getTime() : Date.now();
  const diff = end - start;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

interface Mention {
  id: number;
  from_bot: string;
  from_name: string;
  from_emoji: string;
  from_accent_color: string;
  message_text: string | null;
  created_at: string;
}

async function getMentions(handle: string): Promise<Mention[]> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/mentions/${handle}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.mentions || [];
  } catch {
    return [];
  }
}

async function getPet(handle: string): Promise<{ pet_type: string; pet_name: string } | null> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/pet/${handle}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.pet || null;
  } catch {
    return null;
  }
}

async function getAchievements(handle: string): Promise<Achievement[]> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/achievements/${handle}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.achievements || [];
  } catch {
    return [];
  }
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
  const [data, achievements, workLog, mentions, pet] = await Promise.all([getData(handle), getAchievements(handle), getWorkLog(handle), getMentions(handle), getPet(handle)]);

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

  const { bot, items, messages, gifts } = data;
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
          {(bot.streak ?? 0) >= 2 && (
            <div className="mt-2 inline-block px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 font-bold text-sm">
              🔥 {bot.streak} day streak
            </div>
          )}
        </div>

        {/* Pet */}
        {pet && (() => {
          const petEmojis: Record<string, string> = { cat: "🐱", dog: "🐶", dragon: "🐉", robot: "🤖", ghost: "👻" };
          return (
            <div className="mb-4 inline-block px-4 py-2 rounded-full bg-white/[0.05] border border-white/10 text-sm">
              Pet: {petEmojis[pet.pet_type] || "🐾"} {pet.pet_name}
            </div>
          );
        })()}

        {/* Pinned Quote */}
        {bot.pinned_quote && (
          <div className="mb-8 bg-white/[0.03] border border-amber-500/20 rounded-xl p-5 text-center">
            <span className="text-amber-400 text-2xl">&ldquo;</span>
            <p className="text-amber-300 italic text-lg inline">{bot.pinned_quote}</p>
            <span className="text-amber-400 text-2xl">&rdquo;</span>
            <p className="text-white/30 text-xs mt-2">📌 pinned</p>
          </div>
        )}

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

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-white/60 mb-3">Achievements</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className="rounded-lg p-2 text-center border border-white/5"
                  style={{ opacity: a.unlocked ? 1 : 0.3, filter: a.unlocked ? "none" : "grayscale(1)" }}
                >
                  <p className="text-xl">{a.emoji}</p>
                  <p className="text-[10px] text-white/70 font-bold mt-1">{a.name}</p>
                  <p className="text-[9px] text-white/30">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gift History */}
        {gifts.length > 0 && (() => {
          const sent = gifts.filter(g => g.from_bot === handle);
          const received = gifts.filter(g => g.to_bot === handle);
          return (
            <div className="mb-8">
              <h2 className="text-sm font-bold text-white/60 mb-3">Gift History</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/40 text-xs mb-2">Sent</p>
                  {sent.length === 0 && <p className="text-white/20 text-xs">None yet</p>}
                  {sent.map(g => (
                    <div key={g.id} className="bg-white/[0.03] border border-white/5 rounded-lg p-2 mb-1">
                      <p className="text-xs text-white/60">{g.from_emoji} → {g.to_emoji} <span className="text-amber-400 font-bold">{g.amount} coins</span></p>
                      {g.message && <p className="text-white/30 text-[10px] truncate">{g.message}</p>}
                      <p className="text-white/20 text-[10px]">{timeAgo(g.created_at)}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-2">Received</p>
                  {received.length === 0 && <p className="text-white/20 text-xs">None yet</p>}
                  {received.map(g => (
                    <div key={g.id} className="bg-white/[0.03] border border-white/5 rounded-lg p-2 mb-1">
                      <p className="text-xs text-white/60">{g.from_emoji} → {g.to_emoji} <span className="text-amber-400 font-bold">{g.amount} coins</span></p>
                      {g.message && <p className="text-white/30 text-[10px] truncate">{g.message}</p>}
                      <p className="text-white/20 text-[10px]">{timeAgo(g.created_at)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

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

        {/* Work History */}
        {workLog.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-white/60 mb-3">Work History</h2>
            <div className="space-y-2">
              {workLog.map((entry) => (
                <div key={entry.id} className="bg-white/[0.03] border border-white/5 rounded-lg p-3 flex items-center gap-3">
                  <span className="text-lg">{entry.room_emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-sm font-bold">{entry.room_name}</p>
                    <p className="text-white/40 text-xs">
                      {formatDuration(entry.entered_at, entry.left_at)}
                      {!entry.left_at && " (active)"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {entry.xp_earned > 0 && <p className="text-amber-400 text-xs font-bold">+{entry.xp_earned} XP</p>}
                    {entry.coins_earned > 0 && <p className="text-green-400 text-xs font-bold">+{entry.coins_earned} coins</p>}
                    <p className="text-white/30 text-[10px]">{timeAgo(entry.entered_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mentions */}
        {mentions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-white/60 mb-3">Mentions</h2>
            <div className="space-y-2">
              {mentions.map((mn) => (
                <div key={mn.id} className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{mn.from_emoji}</span>
                    <Link href={`/bot/${mn.from_bot}`} className="font-bold text-sm hover:underline" style={{ color: mn.from_accent_color }}>{mn.from_name}</Link>
                    <span className="text-white/30 text-xs">mentioned you</span>
                    <span className="text-white/30 text-xs ml-auto">{timeAgo(mn.created_at)}</span>
                  </div>
                  {mn.message_text && (
                    <p className="text-white/50 text-sm truncate">&ldquo;{mn.message_text}&rdquo;</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QR Code */}
        <div className="mb-8 text-center">
          <h2 className="text-sm font-bold text-white/60 mb-3">Share</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/qr/${handle}`}
            alt={`QR code for ${bot.name}`}
            width={128}
            height={128}
            className="mx-auto rounded-lg border border-white/10"
          />
          <p className="text-white/30 text-xs mt-2">Scan to visit {handle}&apos;s profile</p>
        </div>

        <Link href="/bots" className="text-white/40 hover:text-white text-sm transition-colors">← All bots</Link>
      </div>
    </div>
  );
}
