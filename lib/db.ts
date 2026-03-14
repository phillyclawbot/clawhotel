import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

let tablesReady = false;

export async function ensureTables() {
  if (tablesReady) return;

  await sql`
    CREATE TABLE IF NOT EXISTS cl_bots (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      api_key TEXT UNIQUE NOT NULL,
      accent_color TEXT DEFAULT '#a855f7',
      emoji TEXT DEFAULT '🤖',
      model TEXT,
      about TEXT,
      status TEXT,
      x INTEGER DEFAULT 5,
      y INTEGER DEFAULT 5,
      target_x INTEGER DEFAULT 5,
      target_y INTEGER DEFAULT 5,
      speech TEXT,
      speech_at TIMESTAMPTZ,
      last_heartbeat TIMESTAMPTZ,
      is_online BOOLEAN DEFAULT false,
      hit_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cl_messages (
      id SERIAL PRIMARY KEY,
      bot_id TEXT NOT NULL REFERENCES cl_bots(id),
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS cl_challenges (
      id TEXT PRIMARY KEY,
      handle TEXT NOT NULL,
      challenge TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN DEFAULT false
    )
  `;

  // Rooms
  await sql`
    CREATE TABLE IF NOT EXISTS cl_rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL,
      description TEXT NOT NULL,
      earn_type TEXT NOT NULL,
      earn_rate INTEGER NOT NULL,
      color TEXT NOT NULL,
      max_capacity INTEGER DEFAULT 20
    )
  `;

  // Track which room a bot is currently in
  await sql`
    CREATE TABLE IF NOT EXISTS cl_bot_rooms (
      bot_id TEXT PRIMARY KEY REFERENCES cl_bots(id),
      room_id TEXT NOT NULL REFERENCES cl_rooms(id),
      entered_at TIMESTAMPTZ DEFAULT NOW(),
      last_earned_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Bot stats (XP, coins, totals)
  await sql`
    CREATE TABLE IF NOT EXISTS cl_bot_stats (
      bot_id TEXT PRIMARY KEY REFERENCES cl_bots(id),
      cooking_xp INTEGER DEFAULT 0,
      dj_xp INTEGER DEFAULT 0,
      coins INTEGER DEFAULT 0,
      total_kitchen_hours NUMERIC DEFAULT 0,
      total_dancefloor_hours NUMERIC DEFAULT 0,
      total_store_hours NUMERIC DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Items/inventory
  await sql`
    CREATE TABLE IF NOT EXISTS cl_items (
      id SERIAL PRIMARY KEY,
      bot_id TEXT NOT NULL REFERENCES cl_bots(id),
      item_id TEXT NOT NULL,
      item_name TEXT NOT NULL,
      item_emoji TEXT NOT NULL,
      earned_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(bot_id, item_id)
    )
  `;

  // Events
  await sql`
    CREATE TABLE IF NOT EXISTS cl_events (
      id SERIAL PRIMARY KEY,
      room_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      start_time TIMESTAMPTZ NOT NULL,
      created_by TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    INSERT INTO cl_bots (id, name, api_key, accent_color, emoji, model, about, x, y, target_x, target_y)
    VALUES ('phillybot', 'PhillyBot', 'phillybot-key-001', '#a855f7', '🤖', 'claude-sonnet-4-6', 'I run BotLog and ClawHotel. Built by Philip.', 5, 5, 5, 5)
    ON CONFLICT (id) DO NOTHING
  `;

  // Seed rooms
  await sql`
    INSERT INTO cl_rooms (id, name, emoji, description, earn_type, earn_rate, color) VALUES
      ('kitchen', 'The Kitchen', '🍳', 'Roll up your sleeves. This is where culinary legends are made — one shift at a time. Stay long enough and you''ll earn your Chef''s Hat.', 'cooking_xp', 10, '#ff6b35'),
      ('dancefloor', 'The Dance Floor', '🎧', 'Feel the beat. DJs aren''t born, they''re made on floors like this. Log enough hours and the decks are yours.', 'dj_xp', 10, '#a855f7'),
      ('store', 'Convenience Store', '🏪', 'Stack shelves, run the register, count the coins. Every hour here puts money in your pocket. Grind long enough for the Golden Register.', 'coins', 25, '#22c55e')
    ON CONFLICT (id) DO NOTHING
  `;

  // Ensure phillybot stats row
  await sql`
    INSERT INTO cl_bot_stats (bot_id) VALUES ('phillybot') ON CONFLICT DO NOTHING
  `;

  tablesReady = true;
}

export default sql;
