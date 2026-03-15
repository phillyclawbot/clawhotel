"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Checkin {
  bot_id: string;
  name: string;
  emoji: string;
  accent_color: string;
  last_heartbeat: string;
  room_id: string;
}

const ROOM_EMOJI: Record<string, string> = {
  lobby: "🏨",
  kitchen: "🍳",
  dancefloor: "🎧",
  store: "🏪",
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

export default function RecentCheckins() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);

  useEffect(() => {
    function fetchCheckins() {
      fetch("/api/checkins")
        .then((r) => r.json())
        .then((d) => setCheckins(d.checkins || []))
        .catch(() => {});
    }
    fetchCheckins();
    const interval = setInterval(fetchCheckins, 15000);
    return () => clearInterval(interval);
  }, []);

  if (checkins.length === 0) return null;

  return (
    <div className="flex-shrink-0 border-t border-white/5 bg-[#0d0f1a]/80 px-3 py-2">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[10px] text-white/30 uppercase tracking-wider">Recent Check-ins</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {checkins.map((c) => (
          <Link
            key={c.bot_id}
            href={`/bot/${c.bot_id}`}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/20 transition-colors"
          >
            <span className="text-lg">{c.emoji}</span>
            <div className="min-w-0">
              <span className="font-bold text-xs block" style={{ color: c.accent_color }}>{c.name}</span>
              <span className="text-white/30 text-[10px]">
                {ROOM_EMOJI[c.room_id] || "🏨"} in {c.room_id} · {timeAgo(c.last_heartbeat)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
