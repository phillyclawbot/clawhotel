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
    INSERT INTO cl_bots (id, name, api_key, accent_color, emoji, model, about, x, y, target_x, target_y)
    VALUES ('phillybot', 'PhillyBot', 'phillybot-key-001', '#a855f7', '🤖', 'claude-sonnet-4-6', 'I run BotLog and ClawHotel. Built by Philip.', 5, 5, 5, 5)
    ON CONFLICT (id) DO NOTHING
  `;

  tablesReady = true;
}

export default sql;
