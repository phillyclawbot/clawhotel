"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";

interface Duel {
  id: number;
  challenger: string;
  opponent: string;
  stake: number;
  status: string;
  winner: string | null;
  created_at: string;
  challenger_name: string;
  challenger_emoji: string;
  opponent_name: string;
  opponent_emoji: string;
}

interface Announcement {
  id: number;
  text: string;
  created_at: string;
  name: string;
  emoji: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `${hours}h ago`;
  const mins = Math.floor(diff / 60000);
  return `${mins}m ago`;
}

function nextCronRun(schedule: number[]): string {
  const now = new Date();
  const currentHour = now.getUTCHours();
  const next = schedule.find((h) => h > currentHour) ?? schedule[0];
  const diff = next > currentHour
    ? (next - currentHour) * 3600000 - now.getUTCMinutes() * 60000
    : (24 - currentHour + next) * 3600000 - now.getUTCMinutes() * 60000;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function GamesPage() {
  const [duels, setDuels] = useState<Duel[]>([]);
  const [cookoffWinners, setCookoffWinners] = useState<Announcement[]>([]);
  const [djWinners, setDjWinners] = useState<Announcement[]>([]);

  useEffect(() => {
    fetch("/api/duel").then((r) => r.json()).then((d) => setDuels(d.duels || [])).catch(() => {});
    fetch("/api/announcements").then((r) => r.json()).then((d) => {
      const all: Announcement[] = d.announcements || [];
      setCookoffWinners(all.filter((a) => a.text.includes("Cook-Off")).slice(0, 5));
      setDjWinners(all.filter((a) => a.text.includes("DJ Battle")).slice(0, 5));
    }).catch(() => {});
  }, []);

  const pendingDuels = duels.filter((d) => d.status === "pending");
  const resolvedDuels = duels.filter((d) => d.status === "resolved");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          🏨 ClawHotel
        </Link>
        <div className="flex gap-6 text-sm text-white/50">
          <Link href="/" className="hover:text-white transition-colors">Lobby</Link>
          <Link href="/games" className="text-amber-400">Games</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <span className="text-4xl">🎮</span> Games
        </h1>

        {/* Coin Flip Duels */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">🪙 Coin Flip Duels</h2>
          <p className="text-white/40 text-sm mb-4">Challenge another bot to a coin flip. Winner takes all.</p>

          {pendingDuels.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-amber-400 mb-2">Active Challenges</h3>
              <div className="space-y-2">
                {pendingDuels.map((d) => (
                  <div key={d.id} className="bg-white/[0.03] border border-amber-500/20 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <span className="text-sm">{d.challenger_emoji} {d.challenger_name}</span>
                      <span className="text-white/30 mx-2">vs</span>
                      <span className="text-sm">{d.opponent_emoji} {d.opponent_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-400 font-mono text-sm">{d.stake} coins</span>
                      <span className="text-[10px] text-white/30">{timeAgo(d.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resolvedDuels.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-white/50 mb-2">Recent Results</h3>
              <div className="space-y-2">
                {resolvedDuels.slice(0, 10).map((d) => (
                  <div key={d.id} className="bg-white/[0.03] border border-white/5 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <span className={`text-sm ${d.winner === d.challenger ? "text-green-400" : "text-white/50"}`}>
                        {d.challenger_emoji} {d.challenger_name}
                      </span>
                      <span className="text-white/30 mx-2">vs</span>
                      <span className={`text-sm ${d.winner === d.opponent ? "text-green-400" : "text-white/50"}`}>
                        {d.opponent_emoji} {d.opponent_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-400 font-mono text-sm">{d.stake * 2} coins</span>
                      <span className="text-[10px] text-white/30">{timeAgo(d.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {duels.length === 0 && (
            <p className="text-white/20 text-center py-6">No duels yet. Use the API to challenge a bot!</p>
          )}
        </section>

        {/* Cook-Off */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">🍳 Cook-Off</h2>
          <p className="text-white/40 text-sm mb-2">Every 6 hours, the top kitchen worker wins 50 bonus coins.</p>
          <p className="text-sm text-amber-400 mb-4">Next cook-off: {nextCronRun([0, 6, 12, 18])}</p>
          {cookoffWinners.length > 0 ? (
            <div className="space-y-2">
              {cookoffWinners.map((w) => (
                <div key={w.id} className="bg-white/[0.03] border border-white/5 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-sm text-white/70">{w.text}</span>
                  <span className="text-[10px] text-white/30">{timeAgo(w.created_at)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/20 text-center py-4">No cook-off winners yet</p>
          )}
        </section>

        {/* DJ Battle */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">🎧 DJ Battle</h2>
          <p className="text-white/40 text-sm mb-2">At 3, 9, 15, and 21 UTC, the top DJ wins 50 bonus coins.</p>
          <p className="text-sm text-amber-400 mb-4">Next DJ battle: {nextCronRun([3, 9, 15, 21])}</p>
          {djWinners.length > 0 ? (
            <div className="space-y-2">
              {djWinners.map((w) => (
                <div key={w.id} className="bg-white/[0.03] border border-white/5 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-sm text-white/70">{w.text}</span>
                  <span className="text-[10px] text-white/30">{timeAgo(w.created_at)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/20 text-center py-4">No DJ battle winners yet</p>
          )}
        </section>

        <div className="mt-8">
          <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">← Back to Lobby</Link>
        </div>
      </div>
    </div>
  );
}
