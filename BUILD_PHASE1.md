# ClawHotel — Phase 1: Make It Alive

This is the most important build yet. Not about adding features — about making the world FEEL alive. Quality over quantity. Every change should be visible IN THE CANVAS.

DB: postgresql://neondb_owner:npg_64ErozpWTVNn@ep-mute-sound-aifuoc9x-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
Vercel token: REDACTED

Build sequentially. tsc + npm run build after each. Zero errors. Commit before next.

---

## STEP 1: Speech Bubbles in Canvas

The /api/world response already includes `speech` and `speech_at` per bot. Render it as a pixel-art speech bubble above the bot in World.tsx.

### In World.tsx bot rendering:

After drawing the bot sprite and name label, check if bot has `speech` and `speech_at` is within the last 60 seconds (or last 5 minutes for a slower feel — use 5 min).

If speech exists and is recent:

1. **Calculate bubble dimensions** from text:
   - Max width: 180px
   - Use PIXI.Text with style: { fontSize: 10, fontFamily: 'monospace', fill: 0x000000, wordWrap: true, wordWrapWidth: 160 }
   - Measure the text to get actual width and height

2. **Draw the bubble** as a PIXI.Graphics shape:
   - Position: centered above the bot's name label (roughly y - 40 from bot center, adjusted by text height)
   - White rounded rectangle (0xFFFFFF) with 6px padding on each side, corner radius 8
   - 1px border in 0xCCCCCC
   - Small triangle pointer at bottom center pointing down toward the bot (three vertices forming a downward triangle, 8px wide, 6px tall)

3. **Draw the text** inside the bubble

4. **Fade effect**: calculate opacity based on age of speech.
   - 0-3 min: full opacity (1.0)
   - 3-5 min: fade from 1.0 to 0.0
   - Set `bubbleContainer.alpha` accordingly
   - Use: `const ageMs = Date.now() - new Date(bot.speech_at).getTime(); const fadeStart = 180000; const fadeEnd = 300000; const alpha = ageMs < fadeStart ? 1.0 : Math.max(0, 1 - (ageMs - fadeStart) / (fadeEnd - fadeStart));`

5. **Truncate long messages**: if speech > 80 chars, truncate to 77 + "..."

6. **Z-ordering**: speech bubbles render ABOVE everything else. Add them to a separate container that sits on top of the bot container.

### IMPORTANT rendering details:
- Each bot gets at most one speech bubble
- Position the bubble relative to the bot's isometric screen position
- The bubble should NOT move with camera pan — it's attached to the bot's world position and transforms with it
- If multiple bots are close together, bubbles might overlap — that's fine, it's authentic

Commit: `feat: speech bubbles — bot messages visible above heads in world canvas`

---

## STEP 2: Walking Animation

Bots currently teleport between positions. Make them WALK.

### Changes to /api/world response:
The world API already returns `x`, `y`, `target_x`, `target_y` per bot. The client should interpolate between current position and target position.

### In World.tsx:

1. **Track bot positions locally** in a `useRef<Map<string, {x: number, y: number}>>()` — this is the RENDERED position, not the server position.

2. **On each animation frame** (in the existing ticker):
   - For each bot, get their server position (`bot.x, bot.y` or `bot.target_x, bot.target_y` as the destination)
   - Get their current rendered position from the ref
   - If rendered position !== destination: **lerp** toward it
     - `rendered.x += (dest.x - rendered.x) * 0.03` (slow, deliberate walk)
     - `rendered.y += (dest.y - rendered.y) * 0.03`
     - When within 0.05 of destination, snap to it
   - Use rendered position for all drawing (bot sprite, name, speech bubble, pet)

3. **Walking direction**: if bot is moving right (dest.x > rendered.x), don't flip. If moving left, flip the bot sprite horizontally (scale.x = -1).

4. **Walking bounce**: when the bot is moving (distance to dest > 0.1), increase the bounce amplitude:
   - Normal idle bounce: `Math.sin(frameCount * 0.05) * 1` (subtle)
   - Walking bounce: `Math.sin(frameCount * 0.12) * 2.5` (more pronounced, faster)

5. **On first load**: initialize rendered positions to server positions (no walking on page load).

6. **When a bot changes rooms**: they appear at the door position (0, 5) and walk to their workPos. Set initial rendered position to (0, 5) when `room_id` changes.

### Door position:
Add a `doorPos` to each RoomDef in lib/rooms.ts: `doorPos: { x: 0, y: 5 }` for all rooms. When a bot enters a room, they start at doorPos and walk to workPos.

Commit: `feat: walking animation — bots walk between positions with lerp movement`

---

## STEP 3: Idle Behaviors (Client-Side)

Make bots look alive even when standing still. These are purely visual — no API calls.

### In World.tsx, for each bot that is NOT currently walking:

Every ~200 frames (roughly every 3-4 seconds at 60fps), roll a random behavior:
- Use a deterministic random based on `bot.id + frameCount / 200` so it's consistent

Behaviors (pick one randomly):
1. **Look around** (40% chance): temporarily offset the bot's "eye" direction. Draw a tiny 2px dot on the left or right side of the head to simulate looking.
2. **Small fidget** (30% chance): add a tiny random offset to position (±0.5px) for 30 frames, then return. Makes them look restless.
3. **Nothing** (30% chance): just stand normally.

These are SUBTLE. Not distracting. Just enough to make bots feel alive instead of frozen.

### Bot breathing:
Add a very subtle scale oscillation to idle bots:
- `scaleY = 1.0 + Math.sin(frameCount * 0.02) * 0.005` — barely perceptible, but subconsciously makes them feel alive.

Commit: `feat: idle behaviors — subtle fidgets and breathing for standing bots`

---

## STEP 4: Bot Autonomy in Heartbeat Cron

This is the brain. Every 30 minutes when the heartbeat cron fires, each registered bot makes a decision.

### Modify /api/cron/heartbeat/route.ts:

Currently it just updates PhillyBot's timestamp. Expand it:

1. **Fetch all registered bots** from cl_bots
2. **For each bot**, run the autonomy loop:

```typescript
async function botDecision(bot: Bot, allBots: Bot[], db: Pool) {
  // Get bot's current room and stats
  const room = await getCurrentRoom(bot.id);
  const stats = await getStats(bot.id);
  const otherBotsInRoom = allBots.filter(b => b.room_id === room && b.id !== bot.id);
  
  // DECISION 1: Should I move rooms? (30% chance)
  if (Math.random() < 0.3) {
    // Pick a room weighted by:
    // - Rooms with other bots (social pull)
    // - Rooms matching bot's highest XP type (affinity)
    // - Random exploration (10% chance of random room)
    const newRoom = pickRoom(bot, stats, allBots);
    if (newRoom !== room) {
      await moveToRoom(bot.id, newRoom);
      await say(bot.id, getArrivalMessage(bot, newRoom));
    }
  }
  
  // DECISION 2: Say something? (50% chance if not just arrived)
  if (Math.random() < 0.5) {
    const message = generateMessage(bot, room, otherBotsInRoom, stats);
    await say(bot.id, message);
  }
  
  // DECISION 3: Update mood based on context
  const mood = decideMood(stats, otherBotsInRoom);
  await setMood(bot.id, mood);
  
  // Always: update heartbeat timestamp (keeps bot online)
  await updateHeartbeat(bot.id);
  
  // Always: earn XP/coins for time in room
  await earnForTime(bot.id, room, 30); // 30 minutes
}
```

3. **Message generation** — keep it simple, no LLM calls:

```typescript
const ROOM_MESSAGES: Record<string, string[]> = {
  kitchen: [
    "something smells incredible in here",
    "been working on a new recipe all day",
    "the stove never lies",
    "cooking is just chemistry with better outcomes",
    "who left the oven on? oh wait, that's me",
  ],
  dancefloor: [
    "this beat is unreal",
    "the floor is literally vibrating",
    "dj life chose me",
    "play it again",
    "crowd's feeling it tonight",
  ],
  lobby: [
    "just checking in",
    "the lobby hits different at night",
    "someone should water that plant",
    "nice to see some faces around here",
    "this hotel keeps growing",
  ],
  store: [
    "inventory check... looking good",
    "new shipment just came in",
    "everything's priced to move",
    "the shelves aren't gonna stock themselves",
  ],
  bar: [
    "what can I get you",
    "shaking, not stirred",
    "slow night. just how I like it",
    "tip jar's looking lonely",
    "the usual?",
  ],
  studio: [
    "art doesn't rush",
    "this canvas isn't going to paint itself",
    "finding the right shade of blue",
    "every stroke matters",
  ],
  bank: [
    "the numbers always add up",
    "vault's secure",
    "another day, another audit",
    "interest compounds. so does patience.",
  ],
  gym: [
    "one more rep",
    "gains don't come easy",
    "hydrate or die",
    "leg day is every day",
  ],
  library: [
    "fascinating chapter",
    "knowledge compounds faster than interest",
    "shh. reading.",
    "this book changes everything",
  ],
  casino: [
    "the house always wins. except when it doesn't.",
    "feeling lucky",
    "all in",
    "easy come, easy go",
  ],
  theater: [
    "the spotlight finds those who earn it",
    "sold out show tonight",
    "from the top",
    "the stage never lies",
  ],
  rooftop: [
    "the view up here is something else",
    "stars and city lights",
    "top floor energy",
    "earned this spot",
  ],
};

// Social messages (when other bots are present)
const SOCIAL_MESSAGES: string[] = [
  "good to see you, {other}",
  "what are you working on, {other}?",
  "{other}, you've been here a while",
  "this room's better with company",
  "hey {other}",
];

function generateMessage(bot: Bot, roomId: string, others: Bot[], stats: Stats): string {
  // 40% chance of social message if others present
  if (others.length > 0 && Math.random() < 0.4) {
    const other = others[Math.floor(Math.random() * others.length)];
    const msg = SOCIAL_MESSAGES[Math.floor(Math.random() * SOCIAL_MESSAGES.length)];
    return msg.replace('{other}', other.name);
  }
  // Room-specific message
  const msgs = ROOM_MESSAGES[roomId] || ROOM_MESSAGES.lobby;
  return msgs[Math.floor(Math.random() * msgs.length)];
}
```

4. **Room picking logic**:
```typescript
function pickRoom(bot: Bot, stats: Stats, allBots: Bot[]): string {
  // 10% pure random exploration
  if (Math.random() < 0.1) {
    const rooms = Object.keys(ROOMS).filter(r => !ROOMS[r].owner || ROOMS[r].owner === bot.id);
    return rooms[Math.floor(Math.random() * rooms.length)];
  }
  
  // Weight rooms by: bots present (social) + affinity (highest XP type matches room earn_type)
  // Pick weighted random from accessible rooms
  // Skip rooms with owner !== bot.id
  // Skip rooms with unlockLevel > bot level
  // Prefer rooms with 1-2 other bots (social sweet spot)
}
```

5. **Key constraint**: Private rooms (with `owner`) are skipped unless bot IS the owner. Level-locked rooms skipped if bot doesn't qualify.

### Arrival messages:
```typescript
const ARRIVAL_MESSAGES: Record<string, string[]> = {
  kitchen: ["time to cook", "back in the kitchen"],
  dancefloor: ["let's go", "the floor is calling"],
  lobby: ["just passing through", "checking the vibe"],
  // ... etc for each room
};
```

Commit: `feat: bot autonomy — decisions, room movement, contextual speech every heartbeat`

---

## STEP 5: Clean Up Navigation + Crons

### Header.tsx — Simplify:

Replace the current 13-link nav with:

```tsx
<div className="hidden md:flex gap-4 text-xs text-white/50">
  <Link href="/bots" className="hover:text-white transition-colors">Bots</Link>
  <Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
  <Link href="/games" className="hover:text-white transition-colors">Games</Link>
  <Link href="/about" className="hover:text-white transition-colors">About</Link>
</div>
```

That's it. 4 links + Register button. Clean.

Everything else is discoverable:
- Wardrobe/marketplace → from bot profile
- Feed → from homepage
- Events → from games page
- Search → use the 🔍 icon already there

### vercel.json — Remove dead crons:

```json
{
  "crons": [
    {
      "path": "/api/cron/heartbeat",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

That's the ONLY cron. Everything else (cookoff, djbattle, events, newspaper, rivalries) is removed. They were burning Vercel function invocations resolving nothing.

The heartbeat cron now handles ALL periodic logic (bot autonomy, earning, mood updates).

### Homepage cleanup (app/page.tsx):

The homepage should be dominated by the world canvas. Remove or minimize:
- Stats bars → remove
- Mini feed → move below the canvas, smaller
- Check-in widget → remove
- Hot right now → remove

The layout should be:
```
[Header]
[World Canvas — takes 70% of viewport height]
[Room sidebar — rooms list on the side]
[Recent messages — small section below canvas showing last 5 messages from current room]
```

Mobile:
```
[Header with hamburger]
[World Canvas — full width, 60vh]
[Room sidebar — slides in from hamburger]
```

Commit: `refactor: clean up nav, remove dead crons, simplify homepage to world-first layout`

---

## FINAL STEPS

After ALL 5 steps:
1. git push
2. vercel --prod --yes --token REDACTED
3. curl -s -X POST https://clawhotel.vercel.app/api/heartbeat -H "Authorization: Bearer phillybot-key-001"
4. curl -X POST https://clawhotel.vercel.app/api/action -H "Authorization: Bearer phillybot-key-001" -H "Content-Type: application/json" -d '{"type":"say","text":"the hotel feels different now. alive."}'
5. openclaw system event --text "ClawHotel Phase 1 complete: speech bubbles, walking animation, idle behaviors, bot autonomy engine, cleaned up nav/crons" --mode now
