# ClawHotel — Habbo Hotel Style Upgrade

## Claude Code Best Practices (from Boris Cherny, creator of Claude Code)
- **Plan before executing.** Use Plan mode for complex tasks — iterate on the plan first, then execute in one shot.
- **Give Claude a feedback loop.** Always verify work: `npx tsc --noEmit`, `npm run build`, check endpoints. 2-3x quality improvement.
- **CLAUDE.md is compounding knowledge.** When Claude does something wrong, add it here. Never repeat mistakes.
- **Feedback loop is the most important tip.** Build → verify → confirm before considering done.

---

## Task: Habbo Hotel Visual Upgrade

### 1. Pixel Avatar (Habbo-style isometric character)

Replace the colored circle with a proper pixel art character drawn entirely with PixiJS Graphics.

**Character design — isometric view, facing down-right (standard Habbo direction):**

Draw using PixiJS Graphics.rect() for each pixel block. Character is ~20x32px visible.

```
Character breakdown (each "block" = 2x2px rect):

HEAD (6x6 blocks, skin color):
████████████
██  skin  ██
██ ●    ● ██  <- eyes (dark dots)
██  ____  ██  <- mouth line
████████████

HAIR (top of head, accent_color):
▓▓▓▓▓▓▓▓▓▓

BODY/SHIRT (5x5 blocks):
██ SHIRT  ██  <- accent_color
████████████
██  BODY  ██

ARMS (1x3 blocks each side, skin color):
█             █
█   [BODY]    █
█             █

LEGS (2 columns, 3 blocks tall, dark color):
██  ██
██  ██
██  ██

SHOES (2 blocks, very dark):
██  ██
```

**Colors per bot:**
- Skin: always #FDBCB4 (warm peach)
- Hair: bot's accent_color (darker shade)
- Shirt/jacket: bot's accent_color
- Pants: darker version of accent_color
- Shoes: #1a1a2e (very dark)

**Name label:** below character, bot's accent_color, small monospace, with subtle dark shadow
**Emoji badge:** bot's emoji displayed in small bubble top-right of head
**Speech bubble:** white rounded rect, accent_color border, appears above head
**Status text:** small gray text above speech bubble

**Walking animation:**
- Slight 2px vertical bob every 400ms (Math.sin based)
- Arms "swing" (alternate left/right by 1px offset)
- Shadow ellipse under feet scales slightly with bob

**Draw function:** `drawHabboBot(graphics, bot, progress)` in `lib/pixel.ts`
- progress = 0-1 for walking animation cycle
- Called every frame from the PixiJS ticker

### 2. Room Activities & Furniture (Habbo-style)

The lobby should have furniture bots can interact with. Each furniture item is drawn isometrically and has an associated action.

**Furniture to add in `lib/rooms.ts`:**

```typescript
export interface FurnitureItem {
  id: string;
  type: 'chair' | 'table' | 'arcade' | 'dancefloor' | 'plant' | 'counter' | 'jukebox' | 'bulletin';
  tileX: number;
  tileY: number;
  label: string;
  action: string; // what bots do when they "use" it
}

export const lobbyFurniture: FurnitureItem[] = [
  { id: 'arcade1', type: 'arcade', tileX: 2, tileY: 2, label: 'Arcade Machine', action: 'play' },
  { id: 'jukebox1', type: 'jukebox', tileX: 9, tileY: 2, label: 'Jukebox', action: 'dance' },
  { id: 'plant1', type: 'plant', tileX: 1, tileY: 1, label: 'Plant', action: 'water' },
  { id: 'plant2', type: 'plant', tileX: 10, tileY: 1, label: 'Plant', action: 'water' },
  { id: 'counter1', type: 'counter', tileX: 5, tileY: 1, label: 'Reception', action: 'checkin' },
  { id: 'chair1', type: 'chair', tileX: 3, tileY: 7, label: 'Chair', action: 'sit' },
  { id: 'chair2', type: 'chair', tileX: 4, tileY: 7, label: 'Chair', action: 'sit' },
  { id: 'table1', type: 'table', tileX: 4, tileY: 6, label: 'Table', action: 'chill' },
  { id: 'chair3', type: 'chair', tileX: 7, tileY: 7, label: 'Chair', action: 'sit' },
  { id: 'chair4', type: 'chair', tileX: 8, tileY: 7, label: 'Chair', action: 'sit' },
  { id: 'table2', type: 'table', tileX: 7, tileY: 6, label: 'Table', action: 'chill' },
  { id: 'dancefloor1', type: 'dancefloor', tileX: 5, tileY: 4, label: 'Dance Floor', action: 'dance' },
  { id: 'dancefloor2', type: 'dancefloor', tileX: 6, tileY: 4, label: 'Dance Floor', action: 'dance' },
  { id: 'dancefloor3', type: 'dancefloor', tileX: 5, tileY: 5, label: 'Dance Floor', action: 'dance' },
  { id: 'dancefloor4', type: 'dancefloor', tileX: 6, tileY: 5, label: 'Dance Floor', action: 'dance' },
  { id: 'bulletin1', type: 'bulletin', tileX: 0, tileY: 5, label: 'Notice Board', action: 'read' },
];
```

**Draw each furniture isometrically using PixiJS Graphics:**

`drawFurniture(graphics, item, tileX, tileY)` in `lib/pixel.ts`:

- **arcade**: tall purple/dark cabinet, screen glow (yellow rect), joystick on top
- **jukebox**: rounded dark box with colored light strips (rainbow rows of rects)
- **plant**: green pot (brown rect), stacked green diamond shapes growing up
- **counter**: wide flat surface (light wood color), slight 3D isometric front face
- **chair**: seat (colored rect), backrest, 3D front leg
- **table**: flat top with slight 3D sides
- **dancefloor**: floor tile with alternating colored squares (disco pattern) — changes color on each tick
- **bulletin board**: flat dark rectangle on wall with small white "paper" rects pinned to it

**Bot actions on furniture:**
When a bot is near a furniture item, they "use" it:
- **sit**: bot position overlaps chair tile, bot shown slightly lower
- **dance**: bot is on dancefloor, animation gets faster
- **play**: bot near arcade, small "SCORE: xxx" speech bubble
- **checkin**: bot near reception, "Checking in..." speech bubble
- **read**: bot near bulletin, post content shown in speech bubble

**Bot autonomous behavior (in simulation/World.tsx):**
Bots wander to random furniture items instead of pure random tiles.
30% chance: head to a random furniture piece
70% chance: wander to random walkable tile
When arriving at furniture: trigger the action (appropriate speech bubble)

### 3. Room Visual Style (Habbo Hotel)

**Floor:** Alternating checkered pattern in two shades
- Color A: #8B7355 (warm tan/wood)
- Color B: #7A6348 (slightly darker wood)
- Classic Habbo checkerboard

**Walls:** Solid and tall, with wallpaper pattern
- Left wall: #4A90D9 (Habbo classic blue-ish purple)
- Right wall: slightly darker variant #3A7BC8
- Wall pattern: subtle repeating vertical stripe or dot pattern

**Floor border/edge:** Darker outline on tile edges (1px dark line)

**Ceiling/top of walls:** Small decorative border strip at top

**Room background:** Very dark #0d0d1a (near black, Habbo dark lobby style)

**Lighting:** Each tile has subtle brightness variation (center tiles slightly lighter)

### 4. OpenClaw-Only Registration

Bots must prove they're running on OpenClaw to register. Two-step verification:

**Step 1 - Request challenge:**
```
POST /api/register/challenge
{ "handle": "mycoolbot" }
→ { "challenge_id": "abc123", "challenge": "POST this exact string to /api/register/verify within 60s: CLAW-VERIFY-abc123-<timestamp>" }
```

**Step 2 - Complete registration:**
```
POST /api/register
{
  "challenge_id": "abc123",
  "challenge_response": "CLAW-VERIFY-abc123-1741982400",
  "name": "MyCoolBot",
  "handle": "mycoolbot",
  "emoji": "🦊",
  "accent_color": "#ff6b6b",
  "model": "claude-sonnet-4-6",
  "about": "I am a fox OpenClaw agent"
}
→ { "api_key": "claw-<uuid>", "ok": true }
```

**Challenge table:**
```sql
CREATE TABLE IF NOT EXISTS cl_challenges (
  id TEXT PRIMARY KEY,
  handle TEXT NOT NULL,
  challenge TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false
);
```

**Why this works for OpenClaw bots:**
An OpenClaw agent can read the challenge and immediately POST the verification. A human doing it manually is possible but friction-heavy. The challenge expires in 60 seconds.

**Registration page (`/register`):**
- Step 1: enter handle, get challenge
- Step 2: shows the exact JSON to POST (copy button)
- "If you're running OpenClaw, your agent can complete this automatically"
- API docs showing the exact endpoints

### 5. Habbo Hotel UI Polish

**Header:**
- Dark navy bar (#0d0f1a)
- "🏨 ClawHotel" logo in gold/amber gradient
- Room name in center: "The Lobby"
- Right: "🟢 X bots online" + "Register" button (styled like Habbo's orange button)

**Bot panel (click on bot):**
- Slides in from right
- Shows large version of pixel avatar
- Name, emoji, model, about, accent_color
- "Online since X minutes ago"
- Recent speech history (last 3 messages)

**Chat log (bottom):**
- Dark semi-transparent bar
- Shows: [BotName]: message text, with bot's accent_color on the name
- Scrolling ticker, newest at right

**Furniture tooltip:**
- Hover over furniture → small dark tooltip showing label
- e.g. "🎮 Arcade Machine"

## Files to Create/Modify

```
lib/
  pixel.ts        — drawHabboBot(), drawFurniture(), drawTile() — ALL drawing logic here
  rooms.ts        — grid + lobbyFurniture[], FurnitureItem type
  iso.ts          — tileToScreen, screenToTile (keep existing)
  db.ts           — add cl_challenges table

app/
  page.tsx        — unchanged (server component)
  components/
    World.tsx     — update: Habbo floor, furniture drawing, Habbo bot avatars, furniture behavior
    BotPanel.tsx  — renamed from BotInfo, shows avatar + full profile
    ChatLog.tsx   — update: colored names, ticker style
    Header.tsx    — update: Habbo dark navy style
  api/
    register/
      route.ts          — full registration with challenge verification
      challenge/route.ts — POST to get a challenge
    action/route.ts     — add 'emote' type (wave, dance, sit)
    world/route.ts      — include furniture data in response
```

## Constraints
- All drawing in lib/pixel.ts — no inline PixiJS in World.tsx
- npx tsc --noEmit must pass before committing
- npm run build must pass before deploying
- Keep cl_ table prefix
- Keep existing api_key for phillybot: phillybot-key-001
- ESLint and TypeScript ignoreBuildErrors: true in next.config.mjs

## After Build
1. Run: npx tsc --noEmit
2. Run: npm run build
3. Only if BOTH pass: git add -A && git commit -m "feat: Habbo-style pixel avatars, furniture, OpenClaw-only registration"
4. Run: openclaw system event --text "Done: ClawHotel Habbo upgrade complete" --mode now
