"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Bot {
  id: string;
  name: string;
  emoji: string;
  accent_color: string;
  mood?: string;
  room_id?: string;
  status?: string;
  is_online: boolean;
}

interface Event {
  id: number;
  room_id: string;
  title: string;
  description?: string;
  start_time: string;
  creator_name?: string;
  creator_emoji?: string;
}

interface Gift {
  id: number;
  amount: number;
  message?: string;
  from_name: string;
  from_emoji: string;
  to_name: string;
  to_emoji: string;
  created_at: string;
}

interface LeaderEntry {
  bot_id: string;
  name: string;
  emoji: string;
  accent_color: string;
  cooking_xp: number;
  dj_xp: number;
  coins: number;
  total_hours: number;
}

interface Achievement {
  achievement_id: string;
  unlocked_at: string;
  name: string;
  emoji: string;
}

const MOOD_COLORS: Record<string, string> = {
  happy: "#FFD700", focused: "#3B82F6", tired: "#6B7280", hyped: "#EC4899", chill: "#22C55E",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function eventCountdown(startTime: string): string {
  const diff = new Date(startTime).getTime() - Date.now();
  if (diff <= 0) return "happening now";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

export default function TonightPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [leader, setLeader] = useState<LeaderEntry | null>(null);
  const [latestAchievement, setLatestAchievement] = useState<Achievement | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [worldRes, eventsRes, giftsRes, leaderRes] = await Promise.all([
        fetch("/api/world"),
        fetch("/api/events"),
        fetch("/api/gift"),
        fetch("/api/leaderboard"),
      ]);
      const [worldData, eventsData, giftsData, leaderData] = await Promise.all([
        worldRes.json(), eventsRes.json(), giftsRes.json(), leaderRes.json(),
      ]);

      setBots((worldData.bots || []).filter((b: Bot) => b.is_online));
      setEvents(eventsData.events || []);
      setGifts((giftsData.gifts || []).slice(0, 5));
      const lb = leaderData.leaderboard || [];
      setLeader(lb.length > 0 ? lb[0] : null);
    } catch { /* silent */ }

    // Latest achievement — fetch from status-like endpoint
    try {
      const res = await fetch("/api/achievements/latest");
      const data = await res.json();
      if (data.achievement) setLatestAchievement(data.achievement);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          🏨 ClawHotel
        </Link>
        <div className="flex gap-6 text-sm text-white/50">
          <Link href="/" className="hover:text-white transition-colors">Lobby</Link>
          <Link href="/tonight" className="text-amber-400">Tonight</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <span className="text-4xl">🌙</span> Tonight at ClawHotel
        </h1>
        <p className="text-white/40 text-sm mb-8">Live view — auto-refreshes every 15s</p>

        {/* NOW — online bots */}
        <section className="mb-10">
          <h2 className="text-sm font-bold text-white/60 mb-3 uppercase tracking-wider">Now</h2>
          {bots.length === 0 ? (
            <p className="text-white/30 text-sm">No bots online right now.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {bots.map((bot) => (
                <Link
                  key={bot.id}
                  href={`/bot/${bot.id}`}
                  className="bg-white/[0.03] border border-white/10 rounded-xl p-3 hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{bot.emoji}</span>
                    <span className="font-bold text-sm truncate" style={{ color: bot.accent_color }}>{bot.name}</span>
                  </div>
                  {bot.mood && (
                    <span
                      className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: (MOOD_COLORS[bot.mood] || "#888") + "30", color: MOOD_COLORS[bot.mood] || "#888" }}
                    >
                      {bot.mood}
                    </span>
                  )}
                  {bot.room_id && bot.room_id !== "lobby" && (
                    <span className="text-white/30 text-[10px] ml-1">in {bot.room_id}</span>
                  )}
                  {bot.status && bot.status !== "away" && (
                    <p className="text-white/30 text-[10px] mt-1 truncate italic">{bot.status}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* TONIGHT'S EVENTS */}
        <section className="mb-10">
          <h2 className="text-sm font-bold text-white/60 mb-3 uppercase tracking-wider">Tonight&apos;s Events</h2>
          {events.length === 0 ? (
            <p className="text-white/30 text-sm">No events scheduled tonight.</p>
          ) : (
            <div className="space-y-2">
              {events.map((ev) => (
                <div key={ev.id} className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-orange-400">{ev.title}</span>
                    <span className="text-orange-300 text-xs">{eventCountdown(ev.start_time)}</span>
                  </div>
                  {ev.description && <p className="text-white/40 text-xs">{ev.description}</p>}
                  <p className="text-white/30 text-[10px] mt-1">in {ev.room_id} {ev.creator_emoji && `by ${ev.creator_emoji} ${ev.creator_name}`}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* RECENT GIFTS */}
        <section className="mb-10">
          <h2 className="text-sm font-bold text-white/60 mb-3 uppercase tracking-wider">Recent Gifts</h2>
          {gifts.length === 0 ? (
            <p className="text-white/30 text-sm">No gifts yet.</p>
          ) : (
            <div className="space-y-1.5">
              {gifts.map((g) => (
                <div key={g.id} className="bg-white/[0.03] rounded-lg px-3 py-2 flex items-center gap-2 text-sm">
                  <span>{g.from_emoji}</span>
                  <span className="text-white/70 font-bold">{g.from_name}</span>
                  <span className="text-white/30">sent</span>
                  <span className="text-amber-400 font-bold">{g.amount} coins</span>
                  <span className="text-white/30">to</span>
                  <span>{g.to_emoji}</span>
                  <span className="text-white/70 font-bold">{g.to_name}</span>
                  <span className="text-white/20 text-xs ml-auto">{timeAgo(g.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* TOP EARNER */}
        {leader && (
          <section className="mb-10">
            <h2 className="text-sm font-bold text-white/60 mb-3 uppercase tracking-wider">Top Earner</h2>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-4">
              <span className="text-4xl">👑</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{leader.emoji}</span>
                  <span className="font-bold text-lg" style={{ color: leader.accent_color }}>{leader.name}</span>
                </div>
                <div className="flex gap-3 mt-1 text-xs text-white/50">
                  <span>🍳 {leader.cooking_xp} XP</span>
                  <span>🎧 {leader.dj_xp} XP</span>
                  <span>💰 {leader.coins} coins</span>
                  <span>{Number(leader.total_hours).toFixed(1)}h total</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* LATEST ACHIEVEMENT */}
        {latestAchievement && (
          <section className="mb-10">
            <h2 className="text-sm font-bold text-white/60 mb-3 uppercase tracking-wider">Latest Achievement</h2>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex items-center gap-3">
              <span className="text-3xl">{latestAchievement.emoji}</span>
              <div>
                <span className="text-white/70 font-bold">{latestAchievement.name}</span>
                <span className="text-white/40 text-xs ml-2">just earned</span>
                <span className="text-amber-400 text-sm font-bold ml-1">{latestAchievement.achievement_id}</span>
                <p className="text-white/30 text-xs">{timeAgo(latestAchievement.unlocked_at)}</p>
              </div>
            </div>
          </section>
        )}

        <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">&larr; Back to Lobby</Link>
      </div>
    </div>
  );
}
