// lib/earn.ts — Shared earning and milestone logic for rooms
import sql from "@/lib/db";

/**
 * Award pending earnings for a bot in a room.
 * Returns { type, amount } or null if bot is not in a room.
 */
export async function awardPendingEarnings(botId: string) {
  const rows = await sql`
    SELECT br.room_id, br.last_earned_at, r.earn_type, r.earn_rate
    FROM cl_bot_rooms br
    JOIN cl_rooms r ON r.id = br.room_id
    WHERE br.bot_id = ${botId}
  `;
  if (rows.length === 0) return null;

  const { room_id, last_earned_at, earn_type, earn_rate } = rows[0];
  const hours = (Date.now() - new Date(last_earned_at).getTime()) / 3600000;
  const amount = Math.floor(hours * earn_rate);

  if (amount <= 0 && hours < 0.001) return { type: earn_type, amount: 0 };

  // Determine which stat columns to update
  let xpCol: string;
  let hoursCol: string;
  if (earn_type === "cooking_xp") {
    xpCol = "cooking_xp";
    hoursCol = "total_kitchen_hours";
  } else if (earn_type === "dj_xp") {
    xpCol = "dj_xp";
    hoursCol = "total_dancefloor_hours";
  } else {
    xpCol = "coins";
    hoursCol = "total_store_hours";
  }

  // Ensure stats row exists
  await sql`INSERT INTO cl_bot_stats (bot_id) VALUES (${botId}) ON CONFLICT DO NOTHING`;

  // Update stats using dynamic column via raw approach
  if (earn_type === "cooking_xp") {
    await sql`
      UPDATE cl_bot_stats
      SET cooking_xp = cooking_xp + ${amount},
          total_kitchen_hours = total_kitchen_hours + ${hours},
          updated_at = NOW()
      WHERE bot_id = ${botId}
    `;
  } else if (earn_type === "dj_xp") {
    await sql`
      UPDATE cl_bot_stats
      SET dj_xp = dj_xp + ${amount},
          total_dancefloor_hours = total_dancefloor_hours + ${hours},
          updated_at = NOW()
      WHERE bot_id = ${botId}
    `;
  } else {
    await sql`
      UPDATE cl_bot_stats
      SET coins = coins + ${amount},
          total_store_hours = total_store_hours + ${hours},
          updated_at = NOW()
      WHERE bot_id = ${botId}
    `;
  }

  // Update last_earned_at
  await sql`UPDATE cl_bot_rooms SET last_earned_at = NOW() WHERE bot_id = ${botId}`;

  // Check milestones
  await checkMilestones(botId);

  return { type: earn_type, amount };
}

async function checkMilestones(botId: string) {
  const stats = await sql`SELECT * FROM cl_bot_stats WHERE bot_id = ${botId}`;
  if (stats.length === 0) return;

  const s = stats[0];

  // Chef's Hat: 5 hours in kitchen
  if (Number(s.total_kitchen_hours) >= 5) {
    await sql`
      INSERT INTO cl_items (bot_id, item_id, item_name, item_emoji)
      VALUES (${botId}, 'chefs_hat', 'Chef''s Hat', '👨‍🍳')
      ON CONFLICT (bot_id, item_id) DO NOTHING
    `;
  }

  // DJ Decks: 5 hours on dancefloor
  if (Number(s.total_dancefloor_hours) >= 5) {
    await sql`
      INSERT INTO cl_items (bot_id, item_id, item_name, item_emoji)
      VALUES (${botId}, 'dj_decks', 'DJ Decks', '🎧')
      ON CONFLICT (bot_id, item_id) DO NOTHING
    `;
  }

  // Golden Register: 10 hours in store
  if (Number(s.total_store_hours) >= 10) {
    await sql`
      INSERT INTO cl_items (bot_id, item_id, item_name, item_emoji)
      VALUES (${botId}, 'golden_register', 'Golden Register', '💰')
      ON CONFLICT (bot_id, item_id) DO NOTHING
    `;
  }
}
