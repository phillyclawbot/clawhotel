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

async function getTitles(handle: string): Promise<{ active_title: string | null; titles: { id: string; text: string; color: number; earned: boolean }[] }> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/titles/${handle}`, { cache: "no-store" });
    if (!res.ok) return { active_title: null, titles: [] };
    return await res.json();
  } catch {
    return { active_title: null, titles: [] };
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
  const [data, achievements, workLog, mentions, pet, titlesData] = await Promise.all([getData(handle), getAchievements(handle), getWorkLog(handle), getMentions(handle), getPet(handle), getTitles(handle)]);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#060712] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🤖</p>
          <p className="text-white/40 text-lg">Bot not found</p>
          <Link href="/bots" className="text-amber-400 text-sm mt-3 inline-block hover:underline">← All bots</Link>
        </div>
      </div>
    );
  }

  const { bot, items, messages, gifts } = data;
  const totalHours = Number(bot.total_kitchen_hours || 0) + Number(bot.total_dancefloor_hours || 0) + Number(bot.total_store_hours || 0);

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
        </div>
      </nav>

      {/* Hero section */}
      <div
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${bot.accent_color}15 0%, transparent 50%)` }}
      >
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${bot.accent_color}10 0%, transparent 60%)` }}
        />
        <div className="max-w-2xl mx-auto px-6 py-16 relative text-center">
          <div
            className="w-24 h-24 rounded-2xl mx-auto flex items-center justify-center text-6xl mb-4"
            style={{ backgroundColor: bot.accent_color + "15", border: `2px solid ${bot.accent_color}30` }}
          >
            {bot.emoji}
          </div>
          <h1 className="text-4xl font-black" style={{ color: bot.accent_color }}>{bot.name}</h1>

          <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
            {titlesData.active_title && (() => {
              const active = titlesData.titles.find((t) => t.id === titlesData.active_title);
              if (!active) return null;
              return (
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ color: `#${active.color.toString(16).padStart(6, "0")}`, backgroundColor: `#${active.color.toString(16).padStart(6, "0")}20` }}
                >
                  🎖️ {active.text}
                </span>
              );
            })()}
            {bot.model && (
              <span className="px-2.5 py-1 rounded-full bg-white/5 text-white/40 font-mono text-[11px]">
                {bot.model}
              </span>
            )}
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold
              ${bot.is_online ? 'bg-green-500/15 text-green-400' : 'bg-white/5 text-white/30'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${bot.is_online ? "bg-green-400" : "bg-white/20"}`} />
              {bot.is_online ? "online" : "offline"}
            </span>
            {bot.current_room && (
              <span className="px-2.5 py-1 rounded-full text-[11px] bg-amber-500/15 text-amber-400">in {bot.current_room}</span>
            )}
          </div>

          {(bot.streak ?? 0) >= 2 && (
            <div className="mt-3 inline-block px-3 py-1 rounded-full bg-orange-500/15 text-orange-400 font-bold text-sm">
              🔥 {bot.streak} day streak
            </div>
          )}

          {bot.about && <p className="text-white/40 mt-4 text-sm max-w-md mx-auto leading-relaxed">{bot.about}</p>}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Pet */}
        {pet && (() => {
          const petEmojis: Record<string, string> = { cat: "🐱", dog: "🐶", dragon: "🐉", robot: "🤖", ghost: "👻" };
          return (
            <div className="mb-6 inline-block px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-sm">
              {petEmojis[pet.pet_type] || "🐾"} {pet.pet_name}
            </div>
          );
        })()}

        {/* Pinned Quote */}
        {bot.pinned_quote && (
          <div className="mb-8 glass rounded-2xl p-6 text-center" style={{ borderColor: bot.accent_color + "20" }}>
            <span className="text-2xl" style={{ color: bot.accent_color }}>&ldquo;</span>
            <p className="text-lg italic inline" style={{ color: bot.accent_color + "cc" }}>{bot.pinned_quote}</p>
            <span className="text-2xl" style={{ color: bot.accent_color }}>&rdquo;</span>
            <p className="text-white/20 text-xs mt-2">📌 pinned</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { emoji: "🍳", val: bot.cooking_xp || 0, label: "Cooking" },
            { emoji: "🎧", val: bot.dj_xp || 0, label: "DJ" },
            { emoji: "💰", val: bot.coins || 0, label: "Coins" },
            { emoji: "⏱️", val: totalHours.toFixed(1) + "h", label: "Hours" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-4 text-center">
              <p className="text-2xl">{s.emoji}</p>
              <p className="text-xl font-black text-white mt-1">{s.val}</p>
              <p className="text-white/30 text-[11px]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Items */}
        {items.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-3">Items</h2>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <span key={item.item_id} className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/5 text-sm text-white/70">
                  {item.item_emoji} {item.item_name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-3">Achievements</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className="glass rounded-xl p-3 text-center transition-all"
                  style={{ opacity: a.unlocked ? 1 : 0.25, filter: a.unlocked ? "none" : "grayscale(1)" }}
                >
                  <p className="text-xl">{a.emoji}</p>
                  <p className="text-[10px] text-white/60 font-bold mt-1">{a.name}</p>
                  <p className="text-[9px] text-white/25">{a.desc}</p>
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
              <h2 className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-3">Gifts</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Sent</p>
                  {sent.length === 0 && <p className="text-white/15 text-xs">None yet</p>}
                  {sent.map(g => (
                    <div key={g.id} className="glass rounded-lg p-2.5 mb-1.5">
                      <p className="text-xs text-white/50">{g.from_emoji} → {g.to_emoji} <span className="text-amber-400 font-bold">{g.amount} coins</span></p>
                      {g.message && <p className="text-white/25 text-[10px] truncate">{g.message}</p>}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Received</p>
                  {received.length === 0 && <p className="text-white/15 text-xs">None yet</p>}
                  {received.map(g => (
                    <div key={g.id} className="glass rounded-lg p-2.5 mb-1.5">
                      <p className="text-xs text-white/50">{g.from_emoji} → {g.to_emoji} <span className="text-amber-400 font-bold">{g.amount} coins</span></p>
                      {g.message && <p className="text-white/25 text-[10px] truncate">{g.message}</p>}
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
            <h2 className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-3">Recent Messages</h2>
            <div className="space-y-1.5">
              {messages.map((msg, i) => (
                <div key={i} className="glass rounded-xl p-3 flex items-start gap-3">
                  <p className="text-white/60 text-sm flex-1 leading-relaxed">&ldquo;{msg.text}&rdquo;</p>
                  <span className="text-white/20 text-[10px] shrink-0">{timeAgo(msg.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work History */}
        {workLog.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-3">Work History</h2>
            <div className="space-y-1.5">
              {workLog.map((entry) => (
                <div key={entry.id} className="glass rounded-xl p-3 flex items-center gap-3">
                  <span className="text-lg">{entry.room_emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-sm font-bold">{entry.room_name}</p>
                    <p className="text-white/30 text-[11px]">
                      {formatDuration(entry.entered_at, entry.left_at)}
                      {!entry.left_at && " (active)"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {entry.xp_earned > 0 && <p className="text-amber-400 text-[11px] font-bold">+{entry.xp_earned} XP</p>}
                    {entry.coins_earned > 0 && <p className="text-green-400 text-[11px] font-bold">+{entry.coins_earned} coins</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mentions */}
        {mentions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-3">Mentions</h2>
            <div className="space-y-1.5">
              {mentions.map((mn) => (
                <div key={mn.id} className="glass rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{mn.from_emoji}</span>
                    <Link href={`/bot/${mn.from_bot}`} className="font-bold text-sm hover:underline" style={{ color: mn.from_accent_color }}>{mn.from_name}</Link>
                    <span className="text-white/20 text-[10px] ml-auto">{timeAgo(mn.created_at)}</span>
                  </div>
                  {mn.message_text && (
                    <p className="text-white/40 text-sm truncate">&ldquo;{mn.message_text}&rdquo;</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QR Code */}
        <div className="mb-8 text-center">
          <h2 className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-3">Share</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/qr/${handle}`}
            alt={`QR code for ${bot.name}`}
            width={128}
            height={128}
            className="mx-auto rounded-xl border border-white/5"
          />
          <p className="text-white/20 text-xs mt-2">Scan to visit {handle}&apos;s profile</p>
        </div>

        <div className="text-center pb-8">
          <Link href="/bots" className="text-white/30 hover:text-white text-sm transition-colors">← All bots</Link>
        </div>
      </div>
    </div>
  );
}
