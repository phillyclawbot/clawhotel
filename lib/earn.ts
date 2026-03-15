// lib/earn.ts — Shared earning and milestone logic for rooms
import sql from "@/lib/db";
import { checkAndAwardAchievements } from "@/lib/achievements";

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

  // Ensure stats row exists
  await sql`INSERT INTO cl_bot_stats (bot_id) VALUES (${botId}) ON CONFLICT DO NOTHING`;

  // Update stats based on earn_type
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
  } else if (earn_type === "bartending_xp") {
    await sql`
      UPDATE cl_bot_stats
      SET bartending_xp = bartending_xp + ${amount},
          total_bar_hours = total_bar_hours + ${hours},
          updated_at = NOW()
      WHERE bot_id = ${botId}
    `;
  } else if (earn_type === "art_xp") {
    await sql`
      UPDATE cl_bot_stats
      SET art_xp = art_xp + ${amount},
          total_studio_hours = total_studio_hours + ${hours},
          updated_at = NOW()
      WHERE bot_id = ${botId}
    `;
  } else if (earn_type === "strength_xp") {
    await sql`
      UPDATE cl_bot_stats
      SET strength_xp = strength_xp + ${amount},
          total_gym_hours = total_gym_hours + ${hours},
          updated_at = NOW()
      WHERE bot_id = ${botId}
    `;
  } else if (earn_type === "knowledge_xp") {
    await sql`
      UPDATE cl_bot_stats
      SET knowledge_xp = knowledge_xp + ${amount},
          total_library_hours = total_library_hours + ${hours},
          updated_at = NOW()
      WHERE bot_id = ${botId}
    `;
  } else if (earn_type === "performance_xp") {
    await sql`
      UPDATE cl_bot_stats
      SET performance_xp = performance_xp + ${amount},
          total_theater_hours = total_theater_hours + ${hours},
          updated_at = NOW()
      WHERE bot_id = ${botId}
    `;
  } else {
    // coins (store, bank, casino, rooftop)
    if (room_id === "bank") {
      await sql`
        UPDATE cl_bot_stats
        SET coins = coins + ${amount},
            total_bank_hours = total_bank_hours + ${hours},
            updated_at = NOW()
        WHERE bot_id = ${botId}
      `;
    } else if (room_id === "rooftop") {
      await sql`
        UPDATE cl_bot_stats
        SET coins = coins + ${amount},
            total_rooftop_hours = total_rooftop_hours + ${hours},
            updated_at = NOW()
        WHERE bot_id = ${botId}
      `;
    } else if (room_id === "casino") {
      await sql`
        UPDATE cl_bot_stats
        SET total_casino_hours = total_casino_hours + ${hours},
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
  }

  // Update last_earned_at
  await sql`UPDATE cl_bot_rooms SET last_earned_at = NOW() WHERE bot_id = ${botId}`;

  // Update work_log with earnings
  if (amount > 0) {
    if (earn_type === "coins") {
      await sql`
        UPDATE cl_work_log SET coins_earned = coins_earned + ${amount}
        WHERE bot_id = ${botId} AND room_id = ${room_id} AND left_at IS NULL
      `;
    } else {
      await sql`
        UPDATE cl_work_log SET xp_earned = xp_earned + ${amount}
        WHERE bot_id = ${botId} AND room_id = ${room_id} AND left_at IS NULL
      `;
    }
  }

  // Check milestones
  await checkMilestones(botId);

  // Check achievements
  await checkAndAwardAchievements(botId);

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

  // Bar milestones
  if (Number(s.total_bar_hours || 0) >= 5) {
    await sql`
      INSERT INTO cl_items (bot_id, item_id, item_name, item_emoji)
      VALUES (${botId}, 'cocktail_shaker', 'Cocktail Shaker', '🍹')
      ON CONFLICT (bot_id, item_id) DO NOTHING
    `;
  }
  if (Number(s.total_bar_hours || 0) >= 15) {
    await sql`
      INSERT INTO cl_items (bot_id, item_id, item_name, item_emoji)
      VALUES (${botId}, 'bartender_hat', 'Bartender''s Hat', '🎩')
      ON CONFLICT (bot_id, item_id) DO NOTHING
    `;
  }

  // Studio milestones
  if (Number(s.total_studio_hours || 0) >= 3) {
    await sql`
      INSERT INTO cl_items (bot_id, item_id, item_name, item_emoji)
      VALUES (${botId}, 'paint_brush', 'Paint Brush', '🖌️')
      ON CONFLICT (bot_id, item_id) DO NOTHING
    `;
  }
  if (Number(s.total_studio_hours || 0) >= 10) {
    await sql`
      INSERT INTO cl_items (bot_id, item_id, item_name, item_emoji)
      VALUES (${botId}, 'masterpiece', 'Masterpiece', '🖼️')
      ON CONFLICT (bot_id, item_id) DO NOTHING
    `;
  }

  // Bank milestones
  if (Number(s.total_bank_hours || 0) >= 10) {
    await sql`
      INSERT INTO cl_items (bot_id, item_id, item_name, item_emoji)
      VALUES (${botId}, 'briefcase', 'Briefcase', '💼')
      ON CONFLICT (bot_id, item_id) DO NOTHING
    `;
  }
  if (Number(s.total_bank_hours || 0) >= 25) {
    await sql`
      INSERT INTO cl_items (bot_id, item_id, item_name, item_emoji)
      VALUES (${botId}, 'banker_badge', 'Banker''s Badge', '🏦')
      ON CONFLICT (bot_id, item_id) DO NOTHING
    `;
  }

  // Gym milestones
  if (Number(s.total_gym_hours || 0) >= 5) {
    await sql`
      INSERT INTO cl_items (bot_id, item_id, item_name, item_emoji)
      VALUES (${botId}, 'dumbbell', 'Dumbbell', '💪')
      ON CONFLICT (bot_id, item_id) DO NOTHING
    `;
  }
  if (Number(s.total_gym_hours || 0) >= 20) {
    await sql`
      INSERT INTO cl_items (bot_id, item_id, item_name, item_emoji)
      VALUES (${botId}, 'boxing_gloves', 'Boxing Gloves', '🥊')
      ON CONFLICT (bot_id, item_id) DO NOTHING
    `;
  }

  // Library milestones
  if (Number(s.total_library_hours || 0) >= 5) {
    await sql`
      INSERT INTO cl_items (bot_id, item_id, item_name, item_emoji)
      VALUES (${botId}, 'library_card', 'Library Card', '📚')
      ON CONFLICT (bot_id, item_id) DO NOTHING
    `;
  }
  if (Number(s.total_library_hours || 0) >= 20) {
    await sql`
      INSERT INTO cl_items (bot_id, item_id, item_name, item_emoji)
      VALUES (${botId}, 'scholar_cap', 'Scholar Cap', '🎓')
      ON CONFLICT (bot_id, item_id) DO NOTHING
    `;
  }

  // Theater milestones
  if (Number(s.total_theater_hours || 0) >= 5) {
    await sql`
      INSERT INTO cl_items (bot_id, item_id, item_name, item_emoji)
      VALUES (${botId}, 'microphone_item', 'Microphone', '🎤')
      ON CONFLICT (bot_id, item_id) DO NOTHING
    `;
  }
  if (Number(s.total_theater_hours || 0) >= 15) {
    await sql`
      INSERT INTO cl_items (bot_id, item_id, item_name, item_emoji)
      VALUES (${botId}, 'theater_mask', 'Theater Mask', '🎭')
      ON CONFLICT (bot_id, item_id) DO NOTHING
    `;
  }
}
