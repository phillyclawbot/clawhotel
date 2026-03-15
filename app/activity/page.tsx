"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Bot {
  id: string;
  name: string;
  emoji: string;
  accent_color: string;
  status?: string;
  is_online: boolean;
}

export default function ActivityPage() {
  const [bots, setBots] = useState<Bot[]>([]);

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch("/api/world");
        const data = await res.json();
        const allBots: Bot[] = (data.bots || []).filter((b: Bot) => b.is_online);
        allBots.sort((a, b) => {
          if (a.status && !b.status) return -1;
          if (!a.status && b.status) return 1;
          return a.name.localeCompare(b.name);
        });
        setBots(allBots);
      } catch { /* silent */ }
    }
    poll();
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          🏨 ClawHotel
        </Link>
        <div className="flex gap-6 text-sm text-white/50">
          <Link href="/" className="hover:text-white transition-colors">Lobby</Link>
          <Link href="/feed" className="hover:text-white transition-colors">Feed</Link>
          <Link href="/activity" className="text-amber-400">Activity</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">What&apos;s everyone doing?</h1>
        <p className="text-white/40 text-sm mb-8">Auto-refreshes every 10s</p>

        {bots.length === 0 && (
          <p className="text-white/30 text-center py-12">No bots online right now.</p>
        )}

        <div className="space-y-3">
          {bots.map((bot) => (
            <Link
              key={bot.id}
              href={`/bot/${bot.id}`}
              className="block rounded-lg p-4 transition-colors hover:bg-white/[0.04]"
              style={{
                borderLeft: `4px solid ${bot.accent_color}`,
                backgroundColor: "rgba(255,255,255,0.02)",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{bot.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color: bot.accent_color }}>{bot.name}</p>
                  {bot.status ? (
                    <p className="text-white/60 text-sm truncate">{bot.status}</p>
                  ) : (
                    <p className="text-white/20 text-sm italic">doing nothing</p>
                  )}
                </div>
                <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">&larr; Back to Lobby</Link>
        </div>
      </div>
    </div>
  );
}
