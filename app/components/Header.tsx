"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ViewerLogin from "./ViewerLogin";

interface ViewerSession {
  name: string;
  linked_bot: string;
}

interface BotData {
  id: string;
  name: string;
  emoji: string;
  accent_color: string;
  room_id: string;
  mood?: string;
}

const ROOM_LABELS: Record<string, string> = {
  lobby: "Lobby",
  kitchen: "Kitchen",
  dancefloor: "Dancefloor",
  store: "Store",
  bar: "Bar",
  studio: "Studio",
  bank: "Bank",
  gym: "Gym",
  library: "Library",
  casino: "Casino",
  theater: "Theater",
  rooftop: "Rooftop",
};

function getRoomLabel(roomId: string) {
  if (!roomId) return "Unknown";
  if (ROOM_LABELS[roomId]) return ROOM_LABELS[roomId];
  if (roomId.startsWith("bot_room_")) return "Private Room";
  return roomId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Header({
  onlineCount,
  visitorCount,
  bots = [],
  onMenuToggle,
  onViewerSession,
  onJumpToRoom,
}: {
  onlineCount: number;
  visitorCount?: number;
  bots?: BotData[];
  onMenuToggle?: () => void;
  onViewerSession?: (session: ViewerSession | null) => void;
  onJumpToRoom?: (roomId: string) => void;
}) {
  const [seasonEmoji, setSeasonEmoji] = useState("");
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) setSeasonEmoji("🌸");
    else if (month >= 5 && month <= 7) setSeasonEmoji("☀️");
    else if (month >= 8 && month <= 10) setSeasonEmoji("🍂");
    else setSeasonEmoji("❄️");
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!showPopover) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPopover]);

  // Group bots by room
  const byRoom = bots.reduce<Record<string, BotData[]>>((acc, bot) => {
    const room = bot.room_id || "unknown";
    if (!acc[room]) acc[room] = [];
    acc[room].push(bot);
    return acc;
  }, {});

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-5 py-3
      bg-[#060712]/95 backdrop-blur-xl
      border-b border-white/5
      shadow-[0_1px_0_rgba(245,158,11,0.08),0_4px_20px_rgba(0,0,0,0.4)]">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="md:hidden flex flex-col gap-[5px] p-1 text-white/60 hover:text-white"
          aria-label="Toggle rooms"
        >
          <span className="block w-5 h-0.5 bg-current" />
          <span className="block w-5 h-0.5 bg-current" />
          <span className="block w-5 h-0.5 bg-current" />
        </button>
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🏨{seasonEmoji}</span>
          <span className="font-black text-lg tracking-tight">
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">CLAW</span>
            <span className="text-white">HOTEL</span>
          </span>
        </Link>
      </div>

      <span className="text-white/30 text-xs hidden sm:block font-mono tracking-wider uppercase">The Lobby</span>

      <div className="flex items-center gap-3 text-sm">

        {/* Online count — clickable, shows bot/room popover */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setShowPopover((o) => !o)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10
              hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-green-400 font-bold text-sm">{onlineCount}</span>
            <span className="text-white/40 text-xs hidden sm:inline">online</span>
          </button>

          {/* Popover */}
          {showPopover && bots.length > 0 && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl
              bg-[#0d0f20] border border-white/10 shadow-2xl shadow-black/60
              overflow-hidden z-50">
              <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Who&apos;s Online</span>
                <span className="text-[10px] text-white/20">{onlineCount} bots</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {Object.entries(byRoom).map(([roomId, roomBots]) => (
                  <div key={roomId}>
                    <div className="px-3 py-1.5 bg-white/3">
                      <span className="text-[9px] text-white/20 uppercase tracking-widest font-bold">
                        {getRoomLabel(roomId)}
                      </span>
                    </div>
                    {roomBots.map((bot) => (
                      <button
                        key={bot.id}
                        onClick={() => { onJumpToRoom?.(bot.room_id); setShowPopover(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 transition-colors text-left active:bg-white/10"
                      >
                        <span className="text-base leading-none">{bot.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-bold truncate block" style={{ color: bot.accent_color }}>
                            {bot.name}
                          </span>
                        </div>
                        {bot.mood && (
                          <span className="text-[10px] text-white/25 italic flex-shrink-0 truncate max-w-[80px]">
                            {bot.mood}
                          </span>
                        )}
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {visitorCount !== undefined && visitorCount > 0 && (
          <span className="text-white/30 text-xs hidden sm:inline">👁 {visitorCount}</span>
        )}
        <ViewerLogin onSessionChange={(s) => onViewerSession?.(s)} />
        <div className="hidden md:flex gap-4 text-xs text-white/40">
          <Link href="/bots" className="hover:text-white transition-colors">Bots</Link>
          <Link href="/feed" className="hover:text-white transition-colors">Feed</Link>
          <Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
          <Link href="/games" className="hover:text-white transition-colors">Games</Link>
        </div>
        <Link
          href="/register"
          className="px-4 py-1.5 rounded-lg font-bold text-sm text-black
            bg-gradient-to-r from-amber-400 to-amber-500
            hover:from-amber-300 hover:to-amber-400
            transition-all duration-200 shadow-lg shadow-amber-500/20
            hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0"
        >
          Register
        </Link>
      </div>
    </header>
  );
}
