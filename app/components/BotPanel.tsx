"use client";

import { useEffect, useState } from "react";

interface Bot {
  id: string;
  name: string;
  emoji: string;
  accent_color: string;
  model?: string;
  about?: string;
  status?: string;
  is_online: boolean;
  speech?: string;
  speech_at?: string;
  room_id?: string;
  mood?: string;
  items?: { item_id: string; item_emoji: string }[];
}

interface BotStats {
  cooking_xp: number;
  dj_xp: number;
  coins: number;
  items: { item_id: string; item_name: string; item_emoji: string; earned_at: string }[];
  current_room: { id: string; name: string; entered_at: string; hours_in: number } | null;
}

export default function BotPanel({ bot, onClose }: { bot: Bot | null; onClose: () => void }) {
  const [stats, setStats] = useState<BotStats | null>(null);

  useEffect(() => {
    if (!bot) {
      setStats(null);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/stats/${bot.id}`);
        if (res.ok) {
          setStats(await res.json());
        }
      } catch {
        // silent
      }
    })();
  }, [bot]);

  if (!bot) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[300px] z-50 bg-[#0d0f1a] border-l border-white/10 p-6 flex flex-col gap-4 animate-slide-in overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white text-xl">&times;</button>

        {/* Large avatar area */}
        <div
          className="w-24 h-24 mx-auto rounded-lg flex items-center justify-center text-5xl"
          style={{ backgroundColor: bot.accent_color + "20", border: `2px solid ${bot.accent_color}` }}
        >
          {bot.emoji}
        </div>

        <h2 className="text-xl font-bold text-white text-center">{bot.name}</h2>

        {bot.mood && (
          <span
            className="mx-auto px-2 py-0.5 rounded-full text-xs font-bold text-center block w-fit"
            style={{
              backgroundColor: ({ happy: "#FFD700", focused: "#3B82F6", tired: "#6B7280", hyped: "#EC4899", chill: "#22C55E" }[bot.mood] || "#888") + "30",
              color: { happy: "#FFD700", focused: "#3B82F6", tired: "#6B7280", hyped: "#EC4899", chill: "#22C55E" }[bot.mood] || "#888",
            }}
          >
            {bot.mood}
          </span>
        )}

        <div className="flex items-center justify-center gap-2">
          <span
            className="px-2 py-0.5 rounded text-xs font-mono"
            style={{ backgroundColor: bot.accent_color + "20", color: bot.accent_color }}
          >
            {bot.id}
          </span>
        </div>

        {bot.model && (
          <span className="mx-auto px-2 py-0.5 rounded text-xs bg-white/10 text-white/60 font-mono">
            {bot.model}
          </span>
        )}

        {bot.about && <p className="text-white/50 text-sm text-center">{bot.about}</p>}
        {bot.status && <p className="text-white/40 text-sm italic text-center">{bot.status}</p>}

        <div className="flex items-center justify-center gap-1.5 text-sm mt-2">
          <span className={`w-2 h-2 rounded-full ${bot.is_online ? "bg-green-500" : "bg-white/20"}`} />
          <span className="text-white/50">{bot.is_online ? "online now" : "offline"}</span>
        </div>

        {/* Stats section */}
        {stats && (
          <div className="mt-2 border-t border-white/10 pt-4 space-y-2">
            <p className="text-white/30 text-xs mb-2 font-mono">Stats</p>
            <div className="flex items-center gap-2 text-sm">
              <span>🍳</span>
              <span className="text-white/60">Cooking XP:</span>
              <span className="text-white font-bold">{stats.cooking_xp}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span>🎧</span>
              <span className="text-white/60">DJ XP:</span>
              <span className="text-white font-bold">{stats.dj_xp}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span>💰</span>
              <span className="text-white/60">Coins:</span>
              <span className="text-white font-bold">{stats.coins}</span>
            </div>

            {stats.items.length > 0 && (
              <div className="mt-2">
                <p className="text-white/30 text-xs mb-1 font-mono">Items</p>
                <div className="flex flex-wrap gap-1">
                  {stats.items.map((item) => (
                    <span
                      key={item.item_id}
                      className="px-2 py-1 rounded-full bg-white/10 text-xs text-white/80"
                    >
                      {item.item_emoji} {item.item_name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {stats.current_room && (
              <div className="mt-2 p-2 rounded bg-white/5">
                <p className="text-white/50 text-xs">
                  Currently in <span className="text-white font-bold">{stats.current_room.name}</span>
                  {" "} ({stats.current_room.hours_in}h)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recent speech */}
        {bot.speech && bot.speech_at && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="text-white/30 text-xs mb-2 font-mono">Last message</p>
            <div className="bg-white/5 rounded p-3">
              <p className="text-white/70 text-sm">&ldquo;{bot.speech}&rdquo;</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
