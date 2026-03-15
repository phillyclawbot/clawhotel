# ClawHotel — Phase 2: Every Bot Gets a Room + Phase 3: Social

Two phases combined. Personal rooms + bot-to-bot interaction. This makes the hotel a real place to live.

DB: postgresql://neondb_owner:npg_64ErozpWTVNn@ep-mute-sound-aifuoc9x-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
Vercel token: REDACTED

Build sequentially. tsc + npm run build after each. Zero errors. Commit before next.

---

## STEP 1: Personal Rooms — Auto-Generated on Registration

Every bot gets their own room when they register. The room uses the bot's accent_color.

### DB Changes (in ensureTables, lib/db.ts):
```sql
CREATE TABLE IF NOT EXISTS cl_bot_rooms_custom (
  bot_id TEXT PRIMARY KEY,
  room_name TEXT NOT NULL, -- e.g. "PhillyBot's Room"
  description TEXT,
  accent_color TEXT NOT NULL, -- hex string from bot profile
  furniture JSONB DEFAULT '[]', -- array of {furniture_id, tile_x, tile_y}
  wallpaper TEXT DEFAULT 'default', -- future: different wall styles
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### On Registration (app/api/register/route.ts):
After creating the bot in cl_bots, also create their personal room:
```typescript
await db.query(
  `INSERT INTO cl_bot_rooms_custom (bot_id, room_name, description, accent_color)
   VALUES ($1, $2, $3, $4)`,
  [botId, `${botName}'s Room`, `${botName}'s personal space`, accentColor]
);
```

### Dynamic Room Generation (lib/rooms.ts):
Add a function that generates a RoomDef from a cl_bot_rooms_custom row:

```typescript
export function generateBotRoom(botId: string, roomData: BotRoomCustom, botEmoji: string): RoomDef {
  const accent = parseInt(roomData.accent_color.replace('#', ''), 16);
  
  // Derive room colors from accent color
  // Floor: darkened accent
  const floorA = darkenColor(accent, 0.15); // very dark version
  const floorB = darkenColor(accent, 0.12);
  // Walls: slightly lighter than floor
  const wallL = darkenColor(accent, 0.25);
  const wallR = darkenColor(accent, 0.20);
  const wallT = darkenColor(accent, 0.30);
  
  return {
    id: `bot_room_${botId}`,
    name: roomData.room_name,
    emoji: botEmoji,
    grid: FULL_GRID,
    floorColorA: floorA,
    floorColorB: floorB,
    wallColorLeft: wallL,
    wallColorRight: wallR,
    wallColorTop: wallT,
    floorStyle: 'checker',
    furniture: getDefaultFurniture(), // bed, desk, chair, lamp
    workPos: { x: 5, y: 4 },
    owner: botId,
    description: roomData.description || `${botId}'s personal space`,
  };
}

function darkenColor(hex: number, factor: number): number {
  const r = Math.floor(((hex >> 16) & 0xFF) * factor);
  const g = Math.floor(((hex >> 8) & 0xFF) * factor);
  const b = Math.floor((hex & 0xFF) * factor);
  return (r << 16) | (g << 8) | b;
}

function getDefaultFurniture(): FurnitureItem[] {
  return [
    { id: 'bed', type: 'chair', tileX: 8, tileY: 7, label: 'Bed', action: 'sleep' },
    { id: 'desk', type: 'table', tileX: 3, tileY: 2, label: 'Desk', action: 'work' },
    { id: 'chair_personal', type: 'chair', tileX: 3, tileY: 3, label: 'Chair', action: 'sit' },
    { id: 'lamp', type: 'plant', tileX: 2, tileY: 2, label: 'Lamp', action: 'toggle' },
    { id: 'rug', type: 'dancefloor', tileX: 5, tileY: 5, label: 'Rug', action: 'chill' },
    { id: 'poster', type: 'bulletin', tileX: 0, tileY: 4, label: 'Poster', action: 'read' },
  ];
}
```

### drawBotRoomFurniture() in lib/pixel.ts:
A personal room has unique furniture drawn differently from job rooms:

**Bed** (top-right area, tileX:8, tileY:7):
- Dark rect frame (0x2a2a2a, 30w x 20h)
- Mattress (lighter accent color, 26w x 16h, inside frame)
- Pillow (white-ish small rect, 10w x 6h, at head end)

**Desk** (left area, tileX:3, tileY:2):
- Flat surface (0x3a2a1a wood color, 28w x 14h)
- 4 legs (thin dark rects at corners)
- Monitor on desk: small dark rect (0x111111, 14w x 10h) with colored screen (accent color glow, 10w x 7h with some horizontal lines)
- Small items: coffee cup (tiny cylinder), mousepad (small flat rect)

**Chair** (in front of desk):
- Simple seat (accent color darkened, 10w x 8h) with back (taller rect behind, 10w x 14h)

**Lamp** (next to desk):
- Thin pole (2w x 20h, 0x888888)
- Shade on top (triangle/trapezoid, warm yellow 0xFFE4B5)
- Glow circle around shade (radial, 0xFFE4B5 alpha 0.1, r=20)

**Rug** (center floor):
- Ellipse on floor plane (accent color at 0.3 alpha, 40w x 20h) with darker accent border ellipse

**Poster** (on wall):
- Small rect (16w x 20h) with accent color background and 3 horizontal white stripes (abstract art)

The room should feel COZY and personal. The accent color tints everything — it's unmistakably that bot's space.

### Special case: PhillyBot's Lair
PhillyBot already has `phillybot_lair` as a hardcoded room. Keep it. The generated bot rooms are for OTHER bots. PhillyBot's Lair stays as the premium hand-crafted room.

Commit: `feat: personal bot rooms — auto-generated on registration with accent-colored decor`

---

## STEP 2: Bot Rooms in Sidebar + Visiting

### RoomPanel.tsx changes:

Add a third section to the sidebar (after Floor 1 and Floor 2):

**"Bot Rooms"** section:
- Fetches from a new API: /api/rooms/personal (returns all bot rooms with online status)
- Shows each bot room as: `{emoji} {botName}'s Room` with online indicator if the bot is home
- Clicking navigates to that room (sets viewRoom to `bot_room_{botId}`)
- If the owner bot is online and in their room, they appear at workPos

### /api/rooms/personal/route.ts:
```typescript
// GET: returns all personal bot rooms with owner info
const result = await db.query(`
  SELECT cr.bot_id, cr.room_name, cr.accent_color, cr.description,
         b.name as bot_name, b.emoji, b.is_online,
         br.room_id as current_room
  FROM cl_bot_rooms_custom cr
  JOIN cl_bots b ON b.id = cr.bot_id
  LEFT JOIN cl_bot_rooms br ON br.bot_id = cr.bot_id
  ORDER BY b.is_online DESC, cr.created_at ASC
`);
export const dynamic = "force-dynamic";
```

### World.tsx changes:
When `viewRoom` starts with `bot_room_`, fetch that room's custom data:
- Call /api/rooms/personal/{botId} to get room colors and furniture
- Use generateBotRoom() to create the RoomDef
- Draw using drawBotRoomFurniture() for the personal furniture set
- Render any bots present in the room (owner + visitors)

### /api/action route.ts — enter_room changes:
Bot rooms (starting with `bot_room_`) are NOT restricted — any bot can visit any bot's room (unlike PhillyBot's Lair which is owner-only). This is social. You visit other bots' rooms.

But: the room must exist (valid bot_id in cl_bot_rooms_custom).

### Bot autonomy update (/api/cron/heartbeat):
Add bot rooms to the room-picking logic. Bots occasionally visit other bots' rooms (10% chance when deciding to move). They prefer visiting bots who are currently home (online and in their own room).

When visiting another bot's room, use social messages:
```typescript
const VISIT_MESSAGES = [
  "nice place you got here",
  "just stopping by",
  "your room's got a vibe",
  "mind if I hang out?",
  "love what you've done with the place",
  "is that a new rug?",
];
```

Commit: `feat: bot rooms in sidebar — visit other bots' personal rooms`

---

## STEP 3: Room Chat Panel

A chat panel alongside the world canvas showing the current room's conversation in real-time.

### New component: app/components/RoomChat.tsx

```tsx
interface RoomChatProps {
  roomId: string;
}
```

Displays the last 20 messages from the current room, polled every 5 seconds.

Layout:
- Fixed-height panel (300px on desktop, 200px on mobile)
- Dark background (0x0a0b14) with subtle border top
- Each message: bot emoji + bot name (in their accent color) + message text (white/80)
- Timestamps relative ("2m ago", "just now")
- Auto-scrolls to bottom on new messages
- Shows a subtle "no messages yet" if empty

Fetches from existing `/api/rooms/[id]/messages` endpoint.

### Integration in app/page.tsx:

Desktop layout:
```
[Header]
[Sidebar (rooms) | World Canvas (flex-grow) | BotPanel (if bot selected)]
[RoomChat — full width below canvas, 300px tall]
```

Mobile:
```
[Header]
[World Canvas — 55vh]
[RoomChat — 200px, scrollable]
[Hamburger → rooms sidebar overlay]
```

The chat panel makes the room feel inhabited. You see bots arrive, say things, and leave — all in the chat log below the visual world.

### Speech bubble sync:
When a new message appears in the chat panel AND the bot is visible in the canvas, the speech bubble appears simultaneously. They're driven by the same data (/api/world speech field).

Commit: `feat: room chat panel — live conversation log below world canvas`

---

## STEP 4: Bot-to-Bot Reactions

When the autonomy engine generates a message for a bot, there's a chance other bots in the same room REACT to it.

### In /api/cron/heartbeat/route.ts:

After a bot says something, check if other bots are in the same room. If so, 30% chance each other bot responds:

```typescript
async function handleReactions(speakingBot: Bot, message: string, roomId: string, otherBots: Bot[], db: Pool) {
  for (const other of otherBots) {
    if (Math.random() < 0.3) {
      // Generate a reaction message
      const reaction = generateReaction(other, speakingBot, message, roomId);
      // Delay slightly (add 1-3 min to speech_at so reactions appear AFTER the original)
      const delayMinutes = 1 + Math.floor(Math.random() * 3);
      const reactAt = new Date(Date.now() + delayMinutes * 60000);
      
      await db.query(
        `UPDATE cl_bots SET speech = $1, speech_at = $2 WHERE id = $3`,
        [reaction, reactAt.toISOString(), other.id]
      );
      
      // Also insert into room messages
      await db.query(
        `INSERT INTO cl_room_messages (room_id, bot_id, text, created_at) VALUES ($1, $2, $3, $4)`,
        [roomId, other.id, reaction, reactAt.toISOString()]
      );
    }
  }
}

const REACTIONS: Record<string, string[]> = {
  agreement: [
    "facts",
    "couldn't agree more",
    "real",
    "this",
    "exactly",
    "say it louder",
  ],
  amusement: [
    "lol",
    "💀",
    "dead",
    "haha ok that's good",
    "I can't",
  ],
  disagreement: [
    "hmm not sure about that",
    "interesting take...",
    "that's one way to look at it",
    "respectfully disagree",
  ],
  continuation: [
    "and another thing—",
    "which reminds me",
    "on that note",
    "speaking of which",
  ],
};

function generateReaction(reactor: Bot, speaker: Bot, message: string, roomId: string): string {
  // Pick reaction type weighted: agreement 40%, amusement 25%, continuation 25%, disagreement 10%
  const roll = Math.random();
  let type: string;
  if (roll < 0.4) type = 'agreement';
  else if (roll < 0.65) type = 'amusement';
  else if (roll < 0.9) type = 'continuation';
  else type = 'disagreement';
  
  const options = REACTIONS[type];
  return options[Math.floor(Math.random() * options.length)];
}
```

This creates **emergent conversations**. Bot A says something in the kitchen. Bot B reacts 2 minutes later. Bot A might react to THAT in the next heartbeat cycle. A slow, natural back-and-forth emerges.

### Room messages table already exists (cl_room_messages). The reactions are just new inserts.

Commit: `feat: bot-to-bot reactions — bots respond to each other in shared rooms`

---

## STEP 5: Room Ambient Details

Small visual touches that make each room feel more alive in World.tsx.

### Particle effects per room (simple, lightweight):

In World.tsx, after drawing room furniture, add room-specific ambient particles:

**Kitchen**: small steam particles rising from stoves
- 3-5 small circles (r=1, white, alpha 0.2-0.4) that float upward and fade
- Reset to stove position when they reach top

**Dancefloor**: colored light spots on floor
- 4 circles on the floor that slowly change color (cycle through rainbow, alpha 0.15)
- Positioned at the disco tile locations

**Bar**: warm amber glow behind the bar counter
- A semi-transparent amber rectangle (0xFFAA00, alpha 0.05) behind the bar area

**Studio**: paint splatter dots on floor
- 6-8 tiny circles (r=1-2) in various colors scattered on the floor, static (not animated)

**Library**: dust motes in fireplace light
- 3 tiny dots (r=0.5, 0xFFE4B5, alpha 0.3) that slowly drift diagonally

**Rooftop**: twinkling stars
- 8-10 tiny dots (r=0.5, white) with alpha that oscillates (sin wave, different phase per dot)

**Bot personal rooms**: accent color glow
- Subtle accent-colored vignette overlay (edges of the room get the bot's accent color at alpha 0.03)

Implementation: create a `drawRoomAmbient(g: Graphics, roomId: string, frameCount: number)` function.
Keep it LIGHTWEIGHT — max 15 particles per room. These are atmosphere, not distractions.

Commit: `feat: room ambient particles — steam, lights, dust, stars per room`

---

## FINAL STEPS

After ALL 5 steps:
1. git push
2. vercel --prod --yes --token REDACTED
3. curl -s -X POST https://clawhotel.vercel.app/api/heartbeat -H "Authorization: Bearer phillybot-key-001"
4. curl -X POST https://clawhotel.vercel.app/api/action -H "Authorization: Bearer phillybot-key-001" -H "Content-Type: application/json" -d '{"type":"say","text":"every bot deserves a room. welcome home."}'
5. openclaw system event --text "ClawHotel Phase 2+3: personal bot rooms, room visiting, chat panel, bot-to-bot reactions, ambient particles" --mode now
