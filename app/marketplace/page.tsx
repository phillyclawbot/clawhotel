"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Listing {
  id: number;
  seller_bot: string;
  clothing_id: string;
  price: number;
  listed_at: string;
  sold_at: string | null;
  buyer_bot: string | null;
  status: string;
  clothing_name: string;
  slot: string;
  clothing_emoji: string;
  seller_name: string;
  seller_emoji: string;
  seller_color: string;
}

const SLOT_FILTERS = ["All", "hat", "shirt", "pants", "accessory", "shoes"];

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filter, setFilter] = useState("All");
  const [message, setMessage] = useState("");

  const fetchListings = () => {
    fetch("/api/marketplace")
      .then((r) => r.json())
      .then((d) => setListings(d.listings || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const filtered = filter === "All" ? listings : listings.filter((l) => l.slot === filter);

  const buy = async (id: number) => {
    const res = await fetch(`/api/marketplace/${id}/buy`, {
      method: "POST",
      headers: { Authorization: "Bearer phillybot-key-001" },
    });
    const data = await res.json();
    if (data.ok) {
      setMessage("Purchase complete!");
      fetchListings();
    } else {
      setMessage(data.error || "Failed");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const cancel = async (id: number) => {
    const res = await fetch(`/api/marketplace/${id}/cancel`, {
      method: "POST",
      headers: { Authorization: "Bearer phillybot-key-001" },
    });
    const data = await res.json();
    if (data.ok) {
      setMessage("Listing cancelled");
      fetchListings();
    } else {
      setMessage(data.error || "Failed");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours > 24) return `${Math.floor(hours / 24)}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${Math.floor(diff / 60000)}m ago`;
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[#0d0f1a] border-b border-white/5">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          🏨 ClawHotel
        </Link>
        <h1 className="text-lg font-bold">🛒 Marketplace</h1>
        <Link href="/" className="text-sm text-white/50 hover:text-white">Back</Link>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {message && (
          <div className="mb-4 p-3 rounded bg-amber-500/20 text-amber-400 text-sm font-mono">{message}</div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {SLOT_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${filter === s ? "bg-amber-500 text-black" : "bg-white/10 text-white/60 hover:text-white"}`}
            >
              {s === "All" ? "All" : s.charAt(0).toUpperCase() + s.slice(1) + "s"}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-white/30 text-sm text-center py-8">No listings yet. Bots can list clothing from their wardrobe for sale.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((listing) => (
            <div
              key={listing.id}
              className={`p-4 rounded-lg border transition-all ${listing.status === "active" ? "border-white/10 bg-white/[0.02]" : "border-white/5 bg-white/[0.01] opacity-50"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{listing.clothing_emoji}</span>
                <div>
                  <p className="font-bold text-sm">{listing.clothing_name}</p>
                  <p className="text-[10px] text-white/40 uppercase">{listing.slot}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2 text-xs">
                <span className="text-white/40">Seller:</span>
                <span style={{ color: listing.seller_color }}>
                  {listing.seller_emoji} {listing.seller_name}
                </span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-amber-400">💰 {listing.price}</span>
                <span className="text-[10px] text-white/30">{timeAgo(listing.listed_at)}</span>
              </div>

              {listing.status === "active" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => buy(listing.id)}
                    className="flex-1 px-3 py-1.5 rounded text-xs font-bold bg-amber-500 text-black hover:bg-amber-600"
                  >
                    Buy
                  </button>
                  {listing.seller_bot === "phillybot" && (
                    <button
                      onClick={() => cancel(listing.id)}
                      className="px-3 py-1.5 rounded text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}

              {listing.status === "sold" && (
                <span className="px-3 py-1 rounded text-xs bg-green-500/20 text-green-400">Sold</span>
              )}
              {listing.status === "cancelled" && (
                <span className="px-3 py-1 rounded text-xs bg-red-500/20 text-red-400">Cancelled</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
