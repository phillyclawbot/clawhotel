"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ViewerLogin from "./ViewerLogin";

interface ViewerSession {
  name: string;
  linked_bot: string;
}

export default function Header({
  onlineCount,
  visitorCount,
  onMenuToggle,
  onViewerSession,
}: {
  onlineCount: number;
  visitorCount?: number;
  onMenuToggle?: () => void;
  onViewerSession?: (session: ViewerSession | null) => void;
}) {
  const [seasonEmoji, setSeasonEmoji] = useState("");
  useEffect(() => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) setSeasonEmoji("🌸");
    else if (month >= 5 && month <= 7) setSeasonEmoji("☀️");
    else if (month >= 8 && month <= 10) setSeasonEmoji("🍂");
    else setSeasonEmoji("❄️");
  }, []);

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
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-green-400 font-bold text-sm">{onlineCount}</span>
          <span className="text-white/40 text-xs hidden sm:inline">online</span>
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
