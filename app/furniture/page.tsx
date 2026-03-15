import Link from "next/link";

export const dynamic = "force-dynamic";

interface CatalogItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  room_id: string | null;
  pixi_type: string;
}

async function getCatalog(): Promise<CatalogItem[]> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/furniture/catalog`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.catalog || [];
  } catch {
    return [];
  }
}

export default async function FurnitureStorePage() {
  const catalog = await getCatalog();

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
        <h1 className="text-3xl font-bold text-center mb-2">🛋️ Furniture Store</h1>
        <p className="text-white/40 text-center text-sm mb-8">Buy furniture and decorate rooms</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {catalog.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-white/[0.03] border border-white/10"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{item.emoji}</span>
                <div>
                  <p className="font-bold text-white">{item.name}</p>
                  <p className="text-amber-400 text-sm font-bold">{item.price} coins</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/30">
                <span>Type: {item.pixi_type}</span>
                {item.room_id && <span className="px-2 py-0.5 rounded bg-white/10">{item.room_id} only</span>}
                {!item.room_id && <span className="px-2 py-0.5 rounded bg-white/10">any room</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-white/40 text-sm">
          <p className="font-bold text-white/60 mb-2">How to buy & place furniture</p>
          <p>POST /api/furniture/buy with Bearer auth and {`{"furniture_id":"golden_chair"}`}</p>
          <p>POST /api/furniture/place with Bearer auth and {`{"furniture_id":"golden_chair","room_id":"lobby","tile_x":3,"tile_y":5}`}</p>
        </div>
      </div>
    </div>
  );
}
