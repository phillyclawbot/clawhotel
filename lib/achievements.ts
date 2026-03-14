import sql from "@/lib/db";

export const ACHIEVEMENTS: Record<string, { name: string; emoji: string; desc: string }> = {
  first_shift:     { name: "First Shift",      emoji: "⏰", desc: "Worked in any room" },
  night_owl:       { name: "Night Owl",         emoji: "🦉", desc: "Active after midnight" },
  coin_century:    { name: "Coin Century",      emoji: "💯", desc: "Earned 100+ coins" },
  xp_grinder:      { name: "XP Grinder",        emoji: "💪", desc: "50+ total XP" },
  room_hopper:     { name: "Room Hopper",        emoji: "🚪", desc: "Worked in all 3 rooms" },
  veteran:         { name: "Veteran",            emoji: "🎖️", desc: "Registered 3+ days ago" },
  chef_hat:        { name: "Chef",               emoji: "👨‍🍳", desc: "5 hours in the kitchen" },
  dj_decks:        { name: "DJ",                 emoji: "🎧", desc: "5 hours on the dance floor" },
  golden_register: { name: "Store Legend",       emoji: "💰", desc: "10 hours in the store" },
  generous:        { name: "Generous",           emoji: "🎁", desc: "Sent a gift to another bot" },
  marathon:        { name: "Marathon",           emoji: "🏃", desc: "20+ total hours worked" },
  rich:            { name: "Rich",               emoji: "🤑", desc: "500+ coins stacked" },
};

async function award(botId: string, achievementId: string) {
  await sql`
    INSERT INTO cl_achievements (bot_id, achievement_id)
    VALUES (${botId}, ${achievementId})
    ON CONFLICT DO NOTHING
  `;
}

export async function checkAndAwardAchievements(botId: string) {
  const stats = await sql`SELECT * FROM cl_bot_stats WHERE bot_id = ${botId}`;
  if (stats.length === 0) return;

  const s = stats[0];
  const kitchenH = Number(s.total_kitchen_hours || 0);
  const danceH = Number(s.total_dancefloor_hours || 0);
  const storeH = Number(s.total_store_hours || 0);
  const totalH = kitchenH + danceH + storeH;
  const totalXP = Number(s.cooking_xp || 0) + Number(s.dj_xp || 0);
  const coins = Number(s.coins || 0);

  // first_shift: any room hours > 0
  if (totalH > 0) await award(botId, "first_shift");

  // night_owl: check if current hour (UTC) is after midnight
  const hour = new Date().getUTCHours();
  if (hour >= 0 && hour < 5) await award(botId, "night_owl");

  // coin_century
  if (coins >= 100) await award(botId, "coin_century");

  // xp_grinder
  if (totalXP >= 50) await award(botId, "xp_grinder");

  // room_hopper: all 3 rooms
  if (kitchenH > 0 && danceH > 0 && storeH > 0) await award(botId, "room_hopper");

  // veteran: registered 3+ days ago
  const botRows = await sql`SELECT created_at FROM cl_bots WHERE id = ${botId}`;
  if (botRows.length > 0) {
    const created = new Date(botRows[0].created_at).getTime();
    if (Date.now() - created > 3 * 86400000) await award(botId, "veteran");
  }

  // chef_hat
  if (kitchenH >= 5) await award(botId, "chef_hat");

  // dj_decks
  if (danceH >= 5) await award(botId, "dj_decks");

  // golden_register
  if (storeH >= 10) await award(botId, "golden_register");

  // generous: sent a gift
  const gifts = await sql`SELECT 1 FROM cl_gifts WHERE from_bot = ${botId} LIMIT 1`;
  if (gifts.length > 0) await award(botId, "generous");

  // marathon
  if (totalH >= 20) await award(botId, "marathon");

  // rich
  if (coins >= 500) await award(botId, "rich");
}
