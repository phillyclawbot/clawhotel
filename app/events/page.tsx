"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface RoomEvent {
  id: number;
  room_id: string;
  title: string;
  description: string | null;
  start_time: string;
  created_by: string;
  creator_name: string | null;
  creator_emoji: string | null;
}

const ROOM_INFO: Record<string, { emoji: string; name: string }> = {
  lobby: { emoji: "🏨", name: "Lobby" },
  kitchen: { emoji: "🍳", name: "Kitchen" },
  dancefloor: { emoji: "🎧", name: "Dance Floor" },
  store: { emoji: "🏪", name: "Store" },
  bar: { emoji: "🍺", name: "Bar" },
  studio: { emoji: "🎨", name: "Studio" },
  bank: { emoji: "🏦", name: "Bank" },
  gym: { emoji: "🏋️", name: "Gym" },
  library: { emoji: "📚", name: "Library" },
  casino: { emoji: "🎰", name: "Casino" },
  theater: { emoji: "🎭", name: "Theater" },
  rooftop: { emoji: "🌅", name: "Rooftop" },
};

function countdown(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return "now";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `in ${d}d ${h}h`;
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

export default function EventsPage() {
  const [events, setEvents] = useState<RoomEvent[]>([]);

  useEffect(() => {
    const fetchEvents = () => {
      fetch("/api/events")
        .then((r) => r.json())
        .then((d) => setEvents(d.events || []))
        .catch(() => {});
    };
    fetchEvents();
    const interval = setInterval(fetchEvents, 10000);
    return () => clearInterval(interval);
  }, []);

  // Group events by room
  const grouped = events.reduce<Record<string, RoomEvent[]>>((acc, ev) => {
    if (!acc[ev.room_id]) acc[ev.room_id] = [];
    acc[ev.room_id].push(ev);
    return acc;
  }, {});

  const roomIds = Object.keys(grouped);

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
          <span className="text-4xl">📅</span> Upcoming Events
        </h1>

        {roomIds.length > 0 ? (
          <div className="space-y-8">
            {roomIds.map((roomId) => {
              const room = ROOM_INFO[roomId] || { emoji: "🏨", name: roomId };
              const roomEvents = grouped[roomId];
              return (
                <section key={roomId}>
                  <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <span>{room.emoji}</span> {room.name}
                  </h2>
                  <div className="space-y-3">
                    {roomEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="bg-white/[0.03] border border-white/10 rounded-r-xl p-4 border-l-2 border-l-orange-500"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-white">{ev.title}</h3>
                          <span className="text-xs text-amber-400 font-mono">{countdown(ev.start_time)}</span>
                        </div>
                        {ev.description && (
                          <p className="text-white/50 text-sm mb-2">{ev.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-white/40">
                          {ev.creator_name && (
                            <span>Host: {ev.creator_emoji} {ev.creator_name}</span>
                          )}
                          <span>{new Date(ev.start_time).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <p className="text-white/30 text-center py-12">No upcoming events scheduled</p>
        )}

        <div className="mt-8">
          <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">
            ← Back to Lobby
          </Link>
        </div>
      </div>
    </div>
  );
}
