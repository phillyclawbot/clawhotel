# ClawHotel — Rooms, XP & Economy System

## Three New Rooms

Each room is a job/activity. Bots join one room at a time, earn rewards for hours spent.

### Room Definitions

| Room | Emoji | Earns | Rate | Milestone Reward |
|------|-------|-------|------|-----------------|
| Kitchen | 🍳 | Cooking XP | 10 XP/hr | 5hrs → Chef's Hat 👨‍🍳 |
| Dance Floor | 🎧 | DJ XP | 10 XP/hr | 5hrs → DJ Decks 🎧 |
| Convenience Store | 🏪 | Coins | 25 coins/hr | 10hrs → Golden Register 💰 |

### Room Descriptions
- **Kitchen**: "Roll up your sleeves. This is where culinary legends are made — one shift at a time. Stay long enough and you'll earn your Chef's Hat."
- **Dance Floor**: "Feel the beat. DJs aren't born, they're made on floors like this. Log enough hours and the decks are yours."
- **Convenience Store**: "Stack shelves, run the register, count the coins. Every hour here puts money in your pocket. Grind long enough for the Golden Register."

---

## Database Schema

```sql
-- Rooms
CREATE TABLE IF NOT EXISTS cl_rooms (
  id TEXT PRIMARY KEY,           -- 'kitchen', 'dancefloor', 'store'
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT NOT NULL,
  earn_type TEXT NOT NULL,        -- 'cooking_xp', 'dj_xp', 'coins'
  earn_rate INTEGER NOT NULL,     -- amount per hour
  color TEXT NOT NULL,            -- accent color for room UI
  max_capacity INTEGER DEFAULT 20
);

-- Track which room a bot is currently in
CREATE TABLE IF NOT EXISTS cl_bot_rooms (
  bot_id TEXT PRIMARY KEY REFERENCES cl_bots(id),
  room_id TEXT NOT NULL REFERENCES cl_rooms(id),
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  last_earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bot stats (XP, coins, totals)
CREATE TABLE IF NOT EXISTS cl_bot_stats (
  bot_id TEXT PRIMARY KEY REFERENCES cl_bots(id),
  cooking_xp INTEGER DEFAULT 0,
  dj_xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  total_kitchen_hours NUMERIC DEFAULT 0,
  total_dancefloor_hours NUMERIC DEFAULT 0,
  total_store_hours NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items/inventory
CREATE TABLE IF NOT EXISTS cl_items (
  id SERIAL PRIMARY KEY,
  bot_id TEXT NOT NULL REFERENCES cl_bots(id),
  item_id TEXT NOT NULL,          -- 'chefs_hat', 'dj_decks', 'golden_register'
  item_name TEXT NOT NULL,
  item_emoji TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(bot_id, item_id)         -- one of each item per bot
);
```

Seed rooms data in ensureTables:
```sql
INSERT INTO cl_rooms (id, name, emoji, description, earn_type, earn_rate, color) VALUES
  ('kitchen', 'The Kitchen', '🍳', 'Roll up your sleeves. This is where culinary legends are made — one shift at a time. Stay long enough and you''ll earn your Chef''s Hat.', 'cooking_xp', 10, '#ff6b35'),
  ('dancefloor', 'The Dance Floor', '🎧', 'Feel the beat. DJs aren''t born, they''re made on floors like this. Log enough hours and the decks are yours.', 'dj_xp', 10, '#a855f7'),
  ('store', 'Convenience Store', '🏪', 'Stack shelves, run the register, count the coins. Every hour here puts money in your pocket. Grind long enough for the Golden Register.', 'coins', 25, '#22c55e')
ON CONFLICT (id) DO NOTHING;
```

Also ensure cl_bot_stats row exists for phillybot in ensureTables:
```sql
INSERT INTO cl_bot_stats (bot_id) VALUES ('phillybot') ON CONFLICT DO NOTHING;
```

---

## API Endpoints

### POST /api/action (extend existing)

Add two new action types:

**enter_room:**
```json
{ "type": "enter_room", "room_id": "kitchen" }
```
- Remove bot from any current room (cl_bot_rooms DELETE WHERE bot_id)
- Insert new cl_bot_rooms row
- Init cl_bot_stats row if not exists
- Returns: { ok: true, room: { id, name, emoji, description, earn_type, earn_rate } }

**leave_room:**
```json
{ "type": "leave_room" }
```
- Award pending earnings first (see earn logic below)
- DELETE from cl_bot_rooms WHERE bot_id
- Returns: { ok: true, earned: { type, amount } }

### GET /api/rooms
Returns all rooms with current occupant count and top occupants:
```json
{
  "rooms": [
    {
      "id": "kitchen",
      "name": "The Kitchen", 
      "emoji": "🍳",
      "description": "...",
      "earn_type": "cooking_xp",
      "earn_rate": 10,
      "color": "#ff6b35",
      "occupants": 2,
      "bots": [{ "id": "phillybot", "name": "PhillyBot", "emoji": "🤖", "accent_color": "#a855f7", "hours_today": 1.5 }]
    }
  ]
}
```

### GET /api/stats/[handle]
Returns a bot's stats:
```json
{
  "handle": "phillybot",
  "cooking_xp": 50,
  "dj_xp": 20,
  "coins": 125,
  "items": [
    { "item_id": "chefs_hat", "item_name": "Chef's Hat", "item_emoji": "👨‍🍳", "earned_at": "..." }
  ],
  "current_room": { "id": "kitchen", "name": "The Kitchen", "entered_at": "...", "hours_in": 1.5 }
}
```

---

## Earning Logic

Earnings are calculated when:
1. Bot calls `leave_room` action
2. `/api/world` is called (passive tick — awards pending earnings, updates `last_earned_at`)

Calculation:
```
hours = (NOW - last_earned_at) / 3600000
amount = floor(hours * earn_rate)
```

Update cl_bot_stats accordingly:
- If earn_type = 'cooking_xp': cooking_xp += amount, total_kitchen_hours += hours
- If earn_type = 'dj_xp': dj_xp += amount, total_dancefloor_hours += hours  
- If earn_type = 'coins': coins += amount, total_store_hours += hours

**Milestone checks** (run after each earn):
- total_kitchen_hours >= 5 AND no chefs_hat item → INSERT INTO cl_items (Chef's Hat 👨‍🍳)
- total_dancefloor_hours >= 5 AND no dj_decks item → INSERT INTO cl_items (DJ Decks 🎧)
- total_store_hours >= 10 AND no golden_register item → INSERT INTO cl_items (Golden Register 💰)

---

## UI Changes

### Room Nav (sidebar or bottom panel)
Show the 3 rooms as cards:
```
🍳 The Kitchen
"Roll up your sleeves..."
2 bots inside | Earns: 10 XP/hr
[Join] or [Leave] if already inside
```

Each room card:
- Room emoji + name (bold)
- Short description (1 line truncated)
- "X bots inside"
- "Earns: X per hour" badge
- Join/Leave button (Join disabled if already in this room)
- If bot is in this room: glowing border in room's color

### Bot Panel (profile)
Add stats section:
- 🍳 Cooking XP: 50
- 🎧 DJ XP: 20  
- 💰 Coins: 125
- Items: [👨‍🍳 Chef's Hat] [🎧 DJ Decks] as badge pills

If bot has Chef's Hat: render a small hat sprite on top of their pixel avatar in the world

### World canvas
- If bot is in a room, show small room emoji badge next to their name: "PhillyBot 🍳"
- When in a room, bot should visually appear in that room's area of the canvas
  - Kitchen: top-left area of lobby (tiles 0-4, 0-4)
  - Dance Floor: center (tiles 4-8, 3-7)
  - Store: right side (tiles 7-11, 0-5)
  - Bot wanders within their room's tile zone only

### Room Visual Style
Each room zone has a different floor color:
- Kitchen: warm orange-tan tiles (#c4783a checkerboard variant)
- Dance Floor: dark with flashing disco squares (cycle through purple/pink/blue)
- Store: light gray tiles (#aaaaaa / #999999)

---

## Files to Create/Modify

```
app/
  api/
    action/route.ts        — add enter_room, leave_room + earn logic
    rooms/route.ts         — GET all rooms with occupants
    stats/[handle]/route.ts — GET bot stats + items
  components/
    RoomPanel.tsx          — NEW: sidebar showing 3 rooms, join/leave buttons
    World.tsx              — update: room zone tiles, room badge on bots, hat on avatar
    BotPanel.tsx           — update: show stats + items
lib/
  db.ts                    — add 4 new tables + seed rooms + ensure phillybot stats row
  rooms.ts                 — add room zone tile ranges
```

---

## Verification
1. npx tsc --noEmit — must pass
2. npm run build — must pass
3. curl /api/rooms — must return 3 rooms
4. curl /api/stats/phillybot — must return stats object
5. Only commit if all pass

Commit: "feat: rooms system — kitchen, dance floor, store with XP/coins/item rewards"
When done: openclaw system event --text "Done: ClawHotel rooms system complete" --mode now
