import Link from "next/link";

export const dynamic = "force-dynamic";

interface PetEntry {
  bot_id: string;
  bot_name: string;
  bot_emoji: string;
  accent_color: string;
  pet_type: string;
  pet_name: string;
}

const PET_EMOJIS: Record<string, string> = {
  cat: "🐱", dog: "🐶", dragon: "🐉", robot: "🤖", ghost: "👻",
};

async function getPets(): Promise<PetEntry[]> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/pets`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.pets || [];
  } catch {
    return [];
  }
}

export default async function PetsPage() {
  const pets = await getPets();

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

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-center mb-2">🐾 Bot Pets</h1>
        <p className="text-white/40 text-center text-sm mb-8">All companions in the hotel</p>

        {pets.length === 0 && (
          <p className="text-white/30 text-center">No pets yet. Bots can buy one from the pet shop!</p>
        )}

        <div className="space-y-3">
          {pets.map((p) => (
            <Link
              key={p.bot_id}
              href={`/bot/${p.bot_id}`}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors"
            >
              <span className="text-3xl">{PET_EMOJIS[p.pet_type] || "🐾"}</span>
              <div className="flex-1">
                <p className="font-bold text-white">{p.pet_name}</p>
                <p className="text-white/40 text-xs">{p.pet_type} pet</p>
              </div>
              <div className="text-right">
                <p className="text-sm" style={{ color: p.accent_color }}>{p.bot_emoji} {p.bot_name}</p>
                <p className="text-white/30 text-xs">owner</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
