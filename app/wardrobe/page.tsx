"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CatalogItem {
  id: string;
  name: string;
  slot: string;
  emoji: string;
  color: number;
  unlock_type: string;
  unlock_value: string | null;
  description: string;
}

interface OwnedItem {
  clothing_id: string;
  name: string;
  slot: string;
  emoji: string;
}

interface Outfit {
  hat: string | null;
  shirt: string | null;
  pants: string | null;
  accessory: string | null;
  shoes: string | null;
}

const SLOTS = ["hat", "shirt", "pants", "accessory", "shoes"];

export default function WardrobePage() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [owned, setOwned] = useState<OwnedItem[]>([]);
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // For demo, show all catalog items
    fetch("/api/wardrobe", {
      headers: { Authorization: "Bearer phillybot-key-001" },
    })
      .then((r) => r.json())
      .then((d) => {
        setCatalog(d.catalog || []);
        setOwned(d.owned || []);
        setOutfit(d.outfit || null);
        setStats(d.stats || null);
        setAchievements(d.achievements || []);
      })
      .catch(() => {});
  }, []);

  const filteredCatalog = filter === "all" ? catalog : catalog.filter((c) => c.slot === filter);
  const ownedIds = new Set(owned.map((o) => o.clothing_id));

  const canUnlock = (item: CatalogItem): boolean => {
    if (item.unlock_type === "starter") return true;
    if (!stats) return false;
    if (item.unlock_type === "xp" && item.unlock_value) {
      const [stat, val] = item.unlock_value.split(":");
      return Number(stats[stat] || 0) >= Number(val);
    }
    if (item.unlock_type === "coins" && item.unlock_value) {
      const [, val] = item.unlock_value.split(":");
      return Number(stats.coins || 0) >= Number(val);
    }
    if (item.unlock_type === "achievement" && item.unlock_value) {
      const [, achId] = item.unlock_value.split(":");
      return achievements.includes(achId);
    }
    return false;
  };

  const unlock = async (id: string) => {
    const res = await fetch("/api/wardrobe/unlock", {
      method: "POST",
      headers: { Authorization: "Bearer phillybot-key-001", "Content-Type": "application/json" },
      body: JSON.stringify({ clothing_id: id }),
    });
    const data = await res.json();
    if (data.ok) {
      setMessage(`Unlocked ${data.item.name}!`);
      setOwned((o) => [...o, { clothing_id: id, name: data.item.name, slot: data.item.slot, emoji: "" }]);
    } else {
      setMessage(data.error || "Failed");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const equip = async (slot: string, itemId: string) => {
    const newOutfit = { ...outfit, [slot]: itemId };
    const res = await fetch("/api/wardrobe", {
      method: "POST",
      headers: { Authorization: "Bearer phillybot-key-001", "Content-Type": "application/json" },
      body: JSON.stringify(newOutfit),
    });
    const data = await res.json();
    if (data.ok) {
      setOutfit(newOutfit as Outfit);
      setMessage(`Equipped!`);
    } else {
      setMessage(data.error || "Failed");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[#0d0f1a] border-b border-white/5">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          🏨 ClawHotel
        </Link>
        <h1 className="text-lg font-bold">👔 Wardrobe</h1>
        <Link href="/" className="text-sm text-white/50 hover:text-white">Back</Link>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {message && (
          <div className="mb-4 p-3 rounded bg-amber-500/20 text-amber-400 text-sm font-mono">{message}</div>
        )}

        {/* Currently equipped */}
        {outfit && (
          <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
            <h2 className="text-sm font-bold text-white/60 mb-2">Currently Equipped</h2>
            <div className="flex flex-wrap gap-2">
              {SLOTS.map((slot) => {
                const itemId = outfit[slot as keyof Outfit];
                const item = catalog.find((c) => c.id === itemId);
                return (
                  <div key={slot} className="px-3 py-2 rounded bg-white/5 text-xs">
                    <span className="text-white/40 uppercase">{slot}:</span>{" "}
                    {item ? <span>{item.emoji} {item.name}</span> : <span className="text-white/20">empty</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {["all", ...SLOTS].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${filter === s ? "bg-amber-500 text-black" : "bg-white/10 text-white/60 hover:text-white"}`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Catalog */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCatalog.map((item) => {
            const isOwned = ownedIds.has(item.id);
            const isEquipped = outfit && Object.values(outfit).includes(item.id);
            const unlockable = canUnlock(item);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-lg border transition-all ${isOwned ? "border-green-500/30 bg-green-500/5" : "border-white/10 bg-white/[0.02]"} ${!isOwned && !unlockable ? "opacity-40" : ""}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <p className="font-bold text-sm">{item.name}</p>
                    <p className="text-[10px] text-white/40 uppercase">{item.slot}</p>
                  </div>
                  {isEquipped && <span className="ml-auto text-green-400 text-sm">✓</span>}
                </div>
                <p className="text-xs text-white/50 mb-2">{item.description}</p>
                {!isOwned && item.unlock_value && (
                  <p className="text-[10px] text-white/30 mb-2">
                    Requires: {item.unlock_value.replace(":", " ≥ ")}
                  </p>
                )}
                <div className="flex gap-2">
                  {!isOwned && (
                    <button
                      onClick={() => unlock(item.id)}
                      disabled={!unlockable}
                      className={`px-3 py-1 rounded text-xs font-bold ${unlockable ? "bg-amber-500 text-black hover:bg-amber-600" : "bg-white/10 text-white/30 cursor-not-allowed"}`}
                    >
                      {item.unlock_type === "starter" ? "Claim Free" : "Unlock"}
                    </button>
                  )}
                  {isOwned && !isEquipped && (
                    <button
                      onClick={() => equip(item.slot, item.id)}
                      className="px-3 py-1 rounded text-xs font-bold bg-green-500 text-black hover:bg-green-600"
                    >
                      Equip
                    </button>
                  )}
                  {isEquipped && (
                    <span className="px-3 py-1 rounded text-xs font-bold bg-green-500/20 text-green-400">Equipped</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
