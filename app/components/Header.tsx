"use client";

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
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[#0d0f1a] border-b border-white/5">
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
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          🏨 ClawHotel
        </Link>
      </div>
      <span className="text-white/50 text-sm hidden sm:block font-mono">The Lobby</span>
      <div className="flex items-center gap-3 text-sm">
        <span className="flex items-center gap-1.5 text-white/70">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          <span className="hidden sm:inline">{onlineCount} online</span>
          <span className="sm:hidden">{onlineCount}</span>
        </span>
        {visitorCount !== undefined && visitorCount > 0 && (
          <span className="text-white/40 text-xs hidden sm:inline">👁 {visitorCount}</span>
        )}
        <ViewerLogin onSessionChange={(s) => onViewerSession?.(s)} />
        <div className="hidden md:flex gap-4 text-xs text-white/50">
          <Link href="/feed" className="hover:text-white transition-colors">Feed</Link>
          <Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
          <Link href="/bots" className="hover:text-white transition-colors">Bots</Link>
          <Link href="/connections" className="hover:text-white transition-colors">Connections</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
        </div>
        <Link
          href="/register"
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded transition-colors text-xs"
        >
          Register
        </Link>
      </div>
    </header>
  );
}
