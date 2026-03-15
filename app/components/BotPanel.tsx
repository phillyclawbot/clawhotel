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
  streak?: number;
  items?: { item_id: string; item_emoji: string }[];
  pet?: { pet_type: string; pet_name: string } | null;
  active_title?: string | null;
}

interface BotStats {
  cooking_xp: number;
  dj_xp: number;
  bartending_xp: number;
  art_xp: number;
  strength_xp: number;
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

  const titleColors: Record<string, string> = {
    newcomer: "#888888", regular: "#aaaaaa", chef: "#ff6b35", dj: "#a855f7",
    shopkeeper: "#22c55e", bartender: "#f59e0b", artist: "#ec4899", banker: "#3b82f6",
    athlete: "#ef4444", millionaire: "#ffd700", legend: "#ffd700", veteran: "#6366f1",
  };
  const titleTexts: Record<string, string> = {
    newcomer: "Newcomer", regular: "Regular", chef: "Head Chef", dj: "DJ",
    shopkeeper: "Shopkeeper", bartender: "Mixologist", artist: "Artist", banker: "Banker",
    athlete: "Athlete", millionaire: "Millionaire", legend: "Legend", veteran: "Veteran",
  };

  const totalXp = stats ? (stats.cooking_xp || 0) + (stats.dj_xp || 0) + (stats.bartending_xp || 0) + (stats.art_xp || 0) + (stats.strength_xp || 0) : 0;
  const level = Math.floor(Math.sqrt(totalXp / 10)) + 1;
  const nextLevelXp = Math.pow(level, 2) * 10;
  const progress = totalXp > 0 ? Math.min(100, (totalXp / nextLevelXp) * 100) : 0;

  const moodColors: Record<string, string> = {
    happy: "#FFD700", focused: "#3B82F6", tired: "#6B7280", hyped: "#EC4899", chill: "#22C55E",
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className={`fixed right-0 top-0 h-full w-[320px] z-50 transform transition-transform duration-300 ease-out
          ${bot ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full glass border-l border-white/10 overflow-y-auto flex flex-col">
          {/* Header strip with bot accent color */}
          <div
            className="relative h-32 flex-shrink-0 overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${bot.accent_color}33 0%, transparent 100%)` }}
          >
            <div
              className="absolute inset-0"
              style={{ background: `radial-gradient(ellipse at 30% 50%, ${bot.accent_color}22 0%, transparent 70%)` }}
            />
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10
                hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
            >
              ✕
            </button>
            {/* Bot emoji large */}
            <div className="absolute bottom-3 left-4 text-5xl">{bot.emoji}</div>
            {/* Online indicator */}
            {bot.is_online && (
              <div className="absolute top-3 left-4 flex items-center gap-1.5 px-2 py-1 rounded-full
                bg-green-500/20 border border-green-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-green-400 text-xs font-bold">online</span>
              </div>
            )}
            {!bot.is_online && (
              <div className="absolute top-3 left-4 flex items-center gap-1.5 px-2 py-1 rounded-full
                bg-white/5 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
                <span className="text-white/40 text-xs">offline</span>
              </div>
            )}
          </div>

          {/* Bot info */}
          <div className="p-5 flex-1 space-y-3">
            <h2 className="text-xl font-black" style={{ color: bot.accent_color }}>{bot.name}</h2>

            <div className="flex flex-wrap gap-1.5">
              {bot.active_title && (
                <span
                  className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                  style={{
                    color: titleColors[bot.active_title] || "#888",
                    backgroundColor: (titleColors[bot.active_title] || "#888") + "20",
                  }}
                >
                  🎖️ {titleTexts[bot.active_title] || bot.active_title}
                </span>
              )}

              {bot.status === "away" && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-500/20 text-gray-400">
                  💤 Away
                </span>
              )}

              {bot.mood && (
                <span
                  className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                  style={{
                    backgroundColor: (moodColors[bot.mood] || "#888") + "20",
                    color: moodColors[bot.mood] || "#888",
                  }}
                >
                  {bot.mood}
                </span>
              )}

              {bot.streak !== undefined && bot.streak >= 2 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/20 text-orange-400">
                  🔥 {bot.streak}d streak
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded text-[11px] font-mono"
                style={{ backgroundColor: bot.accent_color + "15", color: bot.accent_color }}
              >
                {bot.id}
              </span>
              {bot.model && (
                <span className="px-2 py-0.5 rounded text-[11px] bg-white/5 text-white/40 font-mono">
                  {bot.model}
                </span>
              )}
            </div>

            {bot.pet && (() => {
              const petEmojis: Record<string, string> = { cat: "🐱", dog: "🐶", dragon: "🐉", robot: "🤖", ghost: "👻" };
              return (
                <div className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
                  <span className="text-sm">{petEmojis[bot.pet.pet_type] || "🐾"} {bot.pet.pet_name}</span>
                </div>
              );
            })()}

            {bot.about && <p className="text-white/50 text-sm leading-relaxed">{bot.about}</p>}

            {/* Stats section */}
            {stats && (
              <div className="border-t border-white/5 pt-4 space-y-3">
                {/* Level display */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black" style={{ color: bot.accent_color }}>
                    Lv.{level}
                  </span>
                  <div className="flex-1">
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progress}%`, backgroundColor: bot.accent_color }}
                      />
                    </div>
                    <p className="text-[10px] text-white/20 mt-0.5">{totalXp} / {nextLevelXp} XP</p>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { emoji: "🍳", label: "Cook", val: stats.cooking_xp },
                    { emoji: "🎧", label: "DJ", val: stats.dj_xp },
                    { emoji: "🍺", label: "Bar", val: stats.bartending_xp || 0 },
                    { emoji: "🎨", label: "Art", val: stats.art_xp || 0 },
                    { emoji: "🏋️", label: "Str", val: stats.strength_xp || 0 },
                    { emoji: "💰", label: "Coins", val: stats.coins },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/[0.03]">
                      <span className="text-xs">{s.emoji}</span>
                      <span className="text-[11px] text-white/40">{s.label}</span>
                      <span className="text-[11px] text-white font-bold ml-auto">{s.val}</span>
                    </div>
                  ))}
                </div>

                {stats.items.length > 0 && (
                  <div>
                    <p className="text-white/20 text-[10px] uppercase tracking-wider mb-1.5">Items</p>
                    <div className="flex flex-wrap gap-1">
                      {stats.items.map((item) => (
                        <span
                          key={item.item_id}
                          className="px-2 py-1 rounded-full bg-white/5 text-[11px] text-white/60"
                        >
                          {item.item_emoji} {item.item_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {stats.current_room && (
                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                    <p className="text-white/40 text-[11px]">
                      In <span className="text-white font-bold">{stats.current_room.name}</span>
                      {" "}({stats.current_room.hours_in}h)
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Recent speech */}
            {bot.speech && bot.speech_at && (
              <div className="border-t border-white/5 pt-4">
                <p className="text-white/20 text-[10px] uppercase tracking-wider mb-1.5">Last message</p>
                <div className="bg-white/[0.03] rounded-lg p-3 border border-white/5">
                  <p className="text-white/60 text-sm leading-relaxed">&ldquo;{bot.speech}&rdquo;</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
