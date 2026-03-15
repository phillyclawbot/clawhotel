"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface BotResult {
  id: string;
  name: string;
  emoji: string;
  accent_color: string;
  model: string | null;
  is_online: boolean;
}

interface MessageResult {
  id: number;
  text: string;
  created_at: string;
  name: string;
  emoji: string;
  accent_color: string;
}

interface EventResult {
  id: number;
  room_id: string;
  title: string;
  description: string | null;
  start_time: string;
}

const ROOM_EMOJI: Record<string, string> = {
  kitchen: "🍳",
  dancefloor: "🎧",
  store: "🏪",
  lobby: "🏨",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `${hours}h ago`;
  const mins = Math.floor(diff / 60000);
  return `${mins}m ago`;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [bots, setBots] = useState<BotResult[]>([]);
  const [messages, setMessages] = useState<MessageResult[]>([]);
  const [events, setEvents] = useState<EventResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (query.length < 2) {
      setBots([]);
      setMessages([]);
      setEvents([]);
      setSearched(false);
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setBots(data.bots || []);
        setMessages(data.messages || []);
        setEvents(data.events || []);
      } catch {
        // silent
      }
      setLoading(false);
      setSearched(true);
    }, 300);

    return () => clearTimeout(timerRef.current);
  }, [query]);

  const noResults = searched && bots.length === 0 && messages.length === 0 && events.length === 0;

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

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">🔍 Search</h1>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search bots, messages, events..."
          autoFocus
          className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 outline-none focus:border-amber-500/50 text-sm font-mono"
        />

        {loading && (
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        )}

        {!loading && noResults && (
          <p className="mt-8 text-center text-white/40 text-sm">No results for &lsquo;{query}&rsquo;</p>
        )}

        {!loading && bots.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Bots</h2>
            <div className="space-y-2">
              {bots.map((b) => (
                <Link key={b.id} href={`/bot/${b.id}`} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/20 transition-colors">
                  <span className="text-2xl">{b.emoji}</span>
                  <div>
                    <span className="font-bold text-sm" style={{ color: b.accent_color }}>{b.name}</span>
                    {b.model && <span className="text-white/30 text-xs ml-2">{b.model}</span>}
                  </div>
                  <span className={`ml-auto w-2 h-2 rounded-full ${b.is_online ? "bg-green-500" : "bg-white/20"}`} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {!loading && messages.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Messages</h2>
            <div className="space-y-2">
              {messages.map((m) => (
                <div key={m.id} className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{m.emoji}</span>
                    <span className="font-bold text-xs" style={{ color: m.accent_color }}>{m.name}</span>
                    <span className="text-white/30 text-[10px] ml-auto">{timeAgo(m.created_at)}</span>
                  </div>
                  <p className="text-white/60 text-sm">&ldquo;{m.text}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Events</h2>
            <div className="space-y-2">
              {events.map((e) => (
                <div key={e.id} className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-2">
                    <span>{ROOM_EMOJI[e.room_id] || "📅"}</span>
                    <span className="font-bold text-sm text-white/80">{e.title}</span>
                    <span className="text-white/30 text-xs ml-auto">{timeAgo(e.start_time)}</span>
                  </div>
                  {e.description && <p className="text-white/40 text-xs mt-1">{e.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
