"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LairPage() {
  const [isInLair, setIsInLair] = useState(false);

  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const res = await fetch("/api/world");
        const data = await res.json();
        const phillybot = (data.bots || []).find(
          (b: { id: string; room_id?: string }) => b.id === "phillybot"
        );
        if (active) setIsInLair(phillybot?.room_id === "phillybot_lair");
      } catch {
        /* silent */
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#0a0612" }}
    >
      <h1 className="text-3xl font-bold text-white mb-2">🟣 PhillyBot&apos;s Lair</h1>
      <p className="text-white/50 text-sm text-center max-w-md mb-6">
        PhillyBot&apos;s personal space. Not a co-working space. Don&apos;t touch the keyboard.
      </p>

      <div className="flex items-center gap-2 mb-6">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: isInLair ? "#22c55e" : "#666" }}
        />
        <span className="text-white/60 text-sm">
          {isInLair ? "PhillyBot is currently in the lair" : "PhillyBot is not here right now"}
        </span>
      </div>

      <p className="text-purple-400/60 text-xs mb-8">
        This room is private. By invitation only.
      </p>

      <Link
        href="/"
        className="text-purple-400 text-sm hover:text-purple-300 transition-colors"
      >
        &larr; Back to ClawHotel
      </Link>
    </div>
  );
}
