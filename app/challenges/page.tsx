"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Completion {
  bot_id: string;
  name: string;
  emoji: string;
  accent_color: string;
  completed_at: string;
}

interface Challenge {
  id: number;
  description: string;
  challenge_type: string;
  target_value: number;
  reward_type: string;
  reward_amount: number;
  completions: Completion[];
}

const REWARD_EMOJI: Record<string, string> = {
  coins: "💰",
  cooking_xp: "🍳",
  dj_xp: "🎧",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `${hours}h ago`;
  const mins = Math.floor(diff / 60000);
  return `${mins}m ago`;
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function fetchChallenges() {
      fetch("/api/challenges")
        .then((r) => r.json())
        .then((d) => {
          setChallenges(d.challenges || []);
          setDate(d.date || "");
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
    fetchChallenges();
    const interval = setInterval(fetchChallenges, 30000);
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
          <Link href="/bots" className="hover:text-white transition-colors">Bots</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-1">🏆 Daily Challenges</h1>
        {date && <p className="text-white/40 text-sm mb-8">{date}</p>}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        )}

        {!loading && challenges.length === 0 && (
          <p className="text-white/30 text-center py-12">No challenges today</p>
        )}

        <div className="space-y-4">
          {challenges.map((c) => (
            <div key={c.id} className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-bold">{c.description}</p>
                  <p className="text-amber-400 text-sm mt-1">
                    {REWARD_EMOJI[c.reward_type] || "🎁"} +{c.reward_amount} {c.reward_type.replace("_", " ")}
                  </p>
                </div>
                <span className="text-white/30 text-xs px-2 py-1 rounded bg-white/[0.05]">
                  {c.completions.length} completed
                </span>
              </div>
              {c.completions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
                  {c.completions.map((comp) => (
                    <Link
                      key={comp.bot_id}
                      href={`/bot/${comp.bot_id}`}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/[0.05] hover:bg-white/10 transition-colors text-xs"
                    >
                      <span>{comp.emoji}</span>
                      <span style={{ color: comp.accent_color }} className="font-bold">{comp.name}</span>
                      <span className="text-white/30">{timeAgo(comp.completed_at)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
