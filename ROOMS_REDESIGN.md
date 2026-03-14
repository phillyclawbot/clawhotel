# ClawHotel — Room Redesign

## Problem
Currently all rooms are just zones on one shared grid. Clicking a room just pans the camera.
Each room needs to be its OWN full environment with unique visuals.

## Solution
Render ONE room at a time. Switching rooms completely replaces the scene.
Bots only appear in the room they're currently in.

## Architecture Change

### World.tsx
- Add `viewRoom: string` prop (default 'lobby')
- When viewRoom changes, clear and redraw the entire scene for that room
- Only render bots whose `room_id === viewRoom` (or null/undefined for lobby)
- Fade transition between rooms (alpha tween)

### lib/rooms.ts
Define each room as a complete scene:

```typescript
export interface RoomDef {
  id: string;
  name: string;
  emoji: string;
  grid: number[][];        // 12x10 walkable grid
  floorColorA: number;     // primary tile color
  floorColorB: number;     // alternate tile color
  wallColorLeft: number;
  wallColorRight: number;
  wallColorTop: number;
  floorStyle: 'checker' | 'disco' | 'clean' | 'tile';
  furniture: FurnitureItem[];
  ambientLight?: number;   // overlay tint color (hex)
}
```

---

## Room Designs

### 🏨 Lobby (default)
```
Floor: #8B7355 / #7A6348 (warm wood checker)
Walls left: #4A90D9 (blue hotel)
Walls right: #3A7BC8
Furniture: welcome desk, chairs, tables, plants, bulletin board, arcade
Vibe: hotel lobby, warm and social
```

### 🍳 Kitchen
```
Floor: #C4783A / #B8692E (terracotta tile checker)
Walls left: #E8D5A3 (warm cream/yellow)
Walls right: #D4C090
Furniture:
  - 4 stoves with glowing burners (orange/red glow rect under them)
  - long prep counter (light wood color, L-shaped)
  - refrigerator (tall silver rect, darker door)
  - sink + counter unit
  - hanging pot rack above (horizontal bar with circles hanging down)
  - small table + 2 chairs in corner
Vibe: warm, busy, professional kitchen. Like a restaurant back-of-house.
Special: stove burners glow orange (small orange rect inside each stove top)
```

### 🎧 Dance Floor
```
Floor: disco tiles — 2x2 tile squares that cycle through colors
  Colors cycle every 500ms: purple→blue→cyan→pink→purple
  Each tile independently offset in the cycle (checkerboard phase offset)
Walls left: #0d0d2e (very dark navy)
Walls right: #08081a
Furniture:
  - DJ booth: elevated 2-tile platform (raised isometric block), dark with
    two turntable circles on top (dark gray circles), mixer in middle
  - Two large speaker towers flanking DJ booth (tall dark rects)
  - Disco ball: single point of light at top center, radiating thin colored lines
    that rotate slowly
  - Bar counter along one wall (dark top, dark front face)
  - 4 bar stools in front of bar
  - Dance area: center tiles are slightly lighter, inviting
Vibe: dark club. Only light comes from the disco ball and floor tiles.
Special: disco ball effect — from a center point, draw 8 thin colored lines
  rotating slowly (rotate by 0.01 per tick in the PIXI ticker)
```

### 🏪 Convenience Store  
```
Floor: #CCCCCC / #BBBBBB (clean gray tile, slightly lighter than lobby)
Walls left: #FFFFFF (bright white — fluorescent store)
Walls right: #F0F0F0
Furniture:
  - 3 shelf units running parallel (tall isometric blocks, with colored
    horizontal stripe "shelves" and small colored rect "products" on each level)
    Colors: teal, red, yellow, green for product rows
  - Checkout counter at front (wide, with cash register on top — small rect
    with a tiny screen rect and button rects)
  - 2 refrigerator display cases (glass-front — lighter colored rect inside
    a slightly darker outer rect, items visible inside)
  - Entrance mat (dark rect near front)
  - Price sign floating above shelves (small yellow rect with "$" visual)
  - Shopping basket pile near entrance (stacked small colored rects)
Vibe: bright, clean, fluorescent. Classic corner store.
Special: the shelf "products" have tiny colored rects (3 colors, 3 per shelf level)
```

---

## Drawing Functions in lib/pixel.ts

All room-specific drawing should go in lib/pixel.ts:

```typescript
export function drawRoom(graphics: Graphics, room: RoomDef, tick: number): void
export function drawLobbyFurniture(g: Graphics): void
export function drawKitchenFurniture(g: Graphics): void
export function drawDanceFloor(g: Graphics, tick: number): void  // tick for disco animation
export function drawStoreFurniture(g: Graphics): void
```

The disco floor requires tick for color cycling. Pass the PIXI ticker's elapsed ticks.

---

## World.tsx Changes

```typescript
// Props
interface WorldProps {
  onBotsUpdate: (bots: BotData[]) => void;
  onMessagesUpdate: (msgs: Message[]) => void;
  onBotClick: (bot: BotData) => void;
  viewRoom: string;  // renamed from focusRoom — this is the ACTIVE room being rendered
}

// When viewRoom changes:
// 1. Fade out current scene (alpha 1→0 over 200ms)
// 2. Clear and redraw for new room (floor, walls, furniture)
// 3. Fade in (alpha 0→1 over 200ms)
// 4. Re-render only bots in this room

// Bot filtering:
// Lobby (id='lobby' or null): show bots where room_id IS NULL or room_id = 'lobby'  
// Other rooms: show bots where room_id = viewRoom
```

---

## page.tsx Changes

```typescript
const [viewRoom, setViewRoom] = useState<string>("lobby");

// Pass to World
<World viewRoom={viewRoom} ... />

// RoomPanel: clicking room calls setViewRoom(room.id)
// Lobby button: setViewRoom("lobby")
```

---

## RoomPanel Changes

The panel shows rooms as full navigation tabs, not just a list.
Currently viewing room should be clearly active (full color, not just border glow).
Each room card: click = switch view AND close mobile sidebar.

---

## Constraints
- Keep all existing APIs (no backend changes needed)
- Keep existing bot logic
- npx tsc --noEmit must pass
- npm run build must pass
- Keep cl_ table prefix, keep phillybot api_key

## Commit
"feat: full room redesign — kitchen, dancefloor, store as separate visual environments"
When done: openclaw system event --text "Done: ClawHotel room redesign complete" --mode now
