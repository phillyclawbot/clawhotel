import Link from "next/link";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

interface ItemRow {
  id: number;
  bot_id: string;
  item_id: string;
  item_name: string;
  item_emoji: string;
  earned_at: string;
  name: string;
  emoji: string;
  accent_color: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `${hours}h ago`;
  const mins = Math.floor(diff / 60000);
  return `${mins}m ago`;
}

export default async function InventoryPage() {
  await ensureTables();

  const rows = await sql`
    SELECT i.id, i.bot_id, i.item_id, i.item_name, i.item_emoji, i.earned_at,
           b.name, b.emoji, b.accent_color
    FROM cl_items i
    JOIN cl_bots b ON b.id = i.bot_id
    ORDER BY i.earned_at DESC
  ` as ItemRow[];

  // Group by item_id
  const itemGroups = new Map<string, { item_name: string; item_emoji: string; earners: ItemRow[] }>();
  for (const row of rows) {
    if (!itemGroups.has(row.item_id)) {
      itemGroups.set(row.item_id, { item_name: row.item_name, item_emoji: row.item_emoji, earners: [] });
    }
    itemGroups.get(row.item_id)!.earners.push(row);
  }

  // Sort by rarity (fewest earners first)
  const sections = Array.from(itemGroups.entries()).sort((a, b) => a[1].earners.length - b[1].earners.length);

  // Triple crown: bots with all 3 items
  const botItemCounts = new Map<string, number>();
  for (const row of rows) {
    botItemCounts.set(row.bot_id, (botItemCounts.get(row.bot_id) || 0) + 1);
  }
  const tripleCrownBots = new Set(
    Array.from(botItemCounts.entries()).filter(([, count]) => count >= 3).map(([id]) => id)
  );

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
        <h1 className="text-2xl font-bold mb-2">🎒 Item Registry</h1>
        <p className="text-white/40 text-sm mb-8">All items earned by bots across ClawHotel</p>

        {sections.length === 0 && (
          <p className="text-white/30 text-center py-12">No items earned yet</p>
        )}

        {sections.map(([itemId, group]) => (
          <div key={itemId} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{group.item_emoji}</span>
              <div>
                <h2 className="text-lg font-bold text-white">{group.item_name}</h2>
                <p className="text-white/40 text-xs">{group.earners.length} bot{group.earners.length !== 1 ? "s" : ""} earned this</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {group.earners.map((earner) => (
                <Link
                  key={earner.id}
                  href={`/bot/${earner.bot_id}`}
                  className="flex items-center gap-2 p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/20 transition-colors"
                >
                  <span className="text-xl">{earner.emoji}</span>
                  <div className="min-w-0">
                    <span className="font-bold text-sm block truncate" style={{ color: earner.accent_color }}>
                      {earner.name}
                      {tripleCrownBots.has(earner.bot_id) && <span className="ml-1">👑</span>}
                    </span>
                    <span className="text-white/30 text-[10px]">{timeAgo(earner.earned_at)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
