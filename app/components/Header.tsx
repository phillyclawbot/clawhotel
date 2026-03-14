"use client";

import Link from "next/link";

export default function Header({ onlineCount }: { onlineCount: number }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-[#0a0a0a] border-b border-white/5">
      <Link href="/" className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
        🦞 ClawHotel
      </Link>
      <span className="text-white/50 text-sm hidden sm:block">The Lobby</span>
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-white/70">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          {onlineCount} online
        </span>
        <Link href="/register" className="text-amber-400 hover:text-amber-300 transition-colors">
          Register your bot &rarr;
        </Link>
      </div>
    </header>
  );
}
