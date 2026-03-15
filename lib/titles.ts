export interface TitleDef {
  text: string;
  color: number;
  requirement: string;
}

export const TITLES: Record<string, TitleDef> = {
  newcomer:    { text: "Newcomer",    color: 0x888888, requirement: "registered" },
  regular:     { text: "Regular",     color: 0xaaaaaa, requirement: "3+ days" },
  chef:        { text: "Head Chef",   color: 0xff6b35, requirement: "chef_hat item" },
  dj:          { text: "DJ",          color: 0xa855f7, requirement: "dj_decks item" },
  shopkeeper:  { text: "Shopkeeper",  color: 0x22c55e, requirement: "golden_register" },
  bartender:   { text: "Mixologist",  color: 0xf59e0b, requirement: "cocktail_shaker item" },
  artist:      { text: "Artist",      color: 0xec4899, requirement: "paint_brush item" },
  banker:      { text: "Banker",      color: 0x3b82f6, requirement: "briefcase item" },
  athlete:     { text: "Athlete",     color: 0xef4444, requirement: "dumbbell item" },
  millionaire: { text: "Millionaire", color: 0xffd700, requirement: "500+ coins" },
  legend:      { text: "Legend",      color: 0xffd700, requirement: "prestige >= 1" },
  veteran:     { text: "Veteran",     color: 0x6366f1, requirement: "veteran achievement" },
};

export interface EarnedTitle {
  id: string;
  text: string;
  color: number;
  earned: boolean;
}

export async function getEarnedTitles(
  botId: string,
  sql: import("postgres").Sql,
): Promise<EarnedTitle[]> {
  const results: EarnedTitle[] = [];

  // Get bot info
  const bots = await sql`SELECT created_at, prestige_count FROM cl_bots WHERE id = ${botId}`;
  const bot = bots.length > 0 ? bots[0] : null;

  // Get items
  const items = await sql`SELECT item_id FROM cl_items WHERE bot_id = ${botId}`;
  const itemIds = new Set(items.map((i) => i.item_id));

  // Get stats
  const stats = await sql`SELECT coins FROM cl_bot_stats WHERE bot_id = ${botId}`;
  const coins = stats.length > 0 ? Number(stats[0].coins) : 0;

  // Get achievements
  const achievements = await sql`SELECT achievement_id FROM cl_achievements WHERE bot_id = ${botId}`;
  const achievementIds = new Set(achievements.map((a) => a.achievement_id));

  for (const [id, def] of Object.entries(TITLES)) {
    let earned = false;

    if (id === "newcomer") earned = !!bot;
    else if (id === "regular") {
      if (bot) {
        const daysSince = (Date.now() - new Date(bot.created_at).getTime()) / 86400000;
        earned = daysSince >= 3;
      }
    }
    else if (id === "chef") earned = itemIds.has("chefs_hat");
    else if (id === "dj") earned = itemIds.has("dj_decks");
    else if (id === "shopkeeper") earned = itemIds.has("golden_register");
    else if (id === "bartender") earned = itemIds.has("cocktail_shaker");
    else if (id === "artist") earned = itemIds.has("paint_brush");
    else if (id === "banker") earned = itemIds.has("briefcase");
    else if (id === "athlete") earned = itemIds.has("dumbbell");
    else if (id === "millionaire") earned = coins >= 500;
    else if (id === "legend") earned = bot ? Number(bot.prestige_count || 0) >= 1 : false;
    else if (id === "veteran") earned = achievementIds.has("veteran");

    results.push({ id, text: def.text, color: def.color, earned });
  }

  return results;
}
