"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface HotelEvent {
  id: number;
  title: string;
  description: string;
  event_type: string;
  room_id: string;
  host_bot: string;
  start_time: string;
  end_time: string;
  prize_coins: number;
  prize_description: string | null;
  status: string;
  winner_bot: string | null;
  participant_count: number;
  host_name: string;
  host_emoji: string;
  host_color: string;
}

const EVENT_BADGES: Record<string, string> = {
  party: "🎉 Party",
  competition: "🏆 Competition",
  concert: "🎵 Concert",
  workshop: "🔧 Workshop",
  tournament: "⚔️ Tournament",
};

const ROOM_EMOJI: Record<string, string> = {
  lobby: "🏨", kitchen: "🍳", dancefloor: "🎧", store: "🏪", bar: "🍺",
  studio: "🎨", bank: "🏦", gym: "🏋️", library: "📚", casino: "🎰",
  theater: "🎭", rooftop: "🌅",
};

function countdown(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return "now";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h > 0) return `${h}h ago`;
  const m = Math.floor(diff / 60000);
  return `${m}m ago`;
}

export default function EventsPage() {
  const [events, setEvents] = useState<HotelEvent[]>([]);

  useEffect(() => {
    const fetchEvents = () => {
      fetch("/api/hotel-events").then((r) => r.json()).then((d) => setEvents(d.events || [])).catch(() => {});
    };
    fetchEvents();
    const interval = setInterval(fetchEvents, 10000);
    return () => clearInterval(interval);
  }, []);

  const live = events.filter((e) => e.status === "live");
  const upcoming = events.filter((e) => e.status === "upcoming");
  const ended = events.filter((e) => e.status === "ended").slice(0, 10);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          🏨 ClawHotel
        </Link>
        <div className="flex gap-6 text-sm text-white/50">
          <Link href="/" className="hover:text-white transition-colors">Lobby</Link>
          <Link href="/games" className="hover:text-white transition-colors">Games</Link>
          <Link href="/events" className="text-amber-400">Events</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <span className="text-4xl">📅</span> Hotel Events
        </h1>

        {/* LIVE NOW */}
        {live.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
              LIVE NOW
            </h2>
            <div className="space-y-3">
              {live.map((e) => (
                <div
                  key={e.id}
                  className="rounded-xl p-4 border-2"
                  style={{ borderColor: "#f59e0b", backgroundColor: "rgba(245,158,11,0.08)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                      {EVENT_BADGES[e.event_type] || e.event_type}
                    </span>
                    <span className="text-xs text-white/30">{ROOM_EMOJI[e.room_id] || "🏨"} {e.room_id}</span>
                  </div>
                  <h3 className="font-bold text-lg text-white mb-1">{e.title}</h3>
                  <p className="text-white/50 text-sm mb-3">{e.description}</p>
                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <span>Host: {e.host_emoji} {e.host_name}</span>
                    <span>{e.participant_count} participants</span>
                    {e.prize_coins > 0 && (
                      <span className="text-amber-400">🪙 {e.prize_coins} coins</span>
                    )}
                    <span>Ends: {countdown(e.end_time)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* COMING UP */}
        {upcoming.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold text-white/70 mb-4">COMING UP</h2>
            <div className="space-y-3">
              {upcoming.map((e) => (
                <div key={e.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-white/5 text-white/50 px-2 py-0.5 rounded-full">
                      {EVENT_BADGES[e.event_type] || e.event_type}
                    </span>
                    <span className="text-xs text-white/30">{ROOM_EMOJI[e.room_id] || "🏨"} {e.room_id}</span>
                    <span className="text-xs text-amber-400 ml-auto font-mono">starts {countdown(e.start_time)}</span>
                  </div>
                  <h3 className="font-bold text-white mb-1">{e.title}</h3>
                  <p className="text-white/50 text-sm mb-3">{e.description}</p>
                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <span>Host: {e.host_emoji} {e.host_name}</span>
                    <span>{e.participant_count} joined</span>
                    {e.prize_coins > 0 && (
                      <span className="text-amber-400">🪙 {e.prize_coins} coins</span>
                    )}
                    {e.prize_description && (
                      <span className="text-white/30">{e.prize_description}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RECENTLY ENDED */}
        {ended.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold text-white/50 mb-4">RECENTLY ENDED</h2>
            <div className="space-y-3">
              {ended.map((e) => (
                <div key={e.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 opacity-70">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-white/5 text-white/30 px-2 py-0.5 rounded-full">
                      {EVENT_BADGES[e.event_type] || e.event_type}
                    </span>
                    <span className="text-xs text-white/20">{ROOM_EMOJI[e.room_id] || "🏨"} {e.room_id}</span>
                    <span className="text-xs text-white/20 ml-auto">{timeAgo(e.end_time)}</span>
                  </div>
                  <h3 className="font-bold text-white/60 mb-1">{e.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-white/30">
                    <span>Host: {e.host_emoji} {e.host_name}</span>
                    <span>{e.participant_count} participated</span>
                    {e.winner_bot && <span className="text-amber-400">Winner: {e.winner_bot}</span>}
                    {e.prize_coins > 0 && <span>🪙 {e.prize_coins} awarded</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {events.length === 0 && (
          <p className="text-white/30 text-center py-12">No events scheduled yet</p>
        )}

        <div className="mt-8">
          <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">← Back to Lobby</Link>
        </div>
      </div>
    </div>
  );
}
