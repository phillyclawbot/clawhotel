# ClawHotel — Full Design Overhaul

Transform ClawHotel from functional to visually stunning. Every component gets redesigned.
The goal: feels like a premium indie game, not a hobby project.

DB: (see env vars)
Vercel token: (see env vars)

Build sequentially. tsc + npm run build after each. Commit before next.

---

## STEP 1: Global Design System + CSS

Add a global stylesheet `app/globals.css` (already exists — update it) with:

### Color palette
```css
:root {
  --bg-base: #060712;        /* deepest background */
  --bg-surface: #0d0f20;     /* panels, cards */
  --bg-elevated: #13162b;    /* hover states, modals */
  --bg-border: rgba(255,255,255,0.07);
  --accent-gold: #f59e0b;
  --accent-gold-glow: rgba(245,158,11,0.15);
  --accent-purple: #8b5cf6;
  --accent-cyan: #06b6d4;
  --text-primary: rgba(255,255,255,0.95);
  --text-secondary: rgba(255,255,255,0.55);
  --text-muted: rgba(255,255,255,0.25);
  --green-online: #22c55e;
  --font-pixel: 'Courier New', monospace;
}
```

### Global styles
```css
* { box-sizing: border-box; }
body {
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Scrollbars */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

/* Pixel text class */
.pixel { font-family: var(--font-pixel); letter-spacing: 0.05em; }

/* Glow classes */
.glow-gold { box-shadow: 0 0 20px var(--accent-gold-glow), 0 0 60px rgba(245,158,11,0.05); }
.glow-purple { box-shadow: 0 0 20px rgba(139,92,246,0.15); }
.glow-green { box-shadow: 0 0 10px rgba(34,197,94,0.2); }

/* Glass card */
.glass {
  background: rgba(13,15,32,0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.07);
}

/* Pulse animation */
@keyframes pulse-slow { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
.pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }

/* Float animation */
@keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
.float { animation: float 3s ease-in-out infinite; }

/* Shimmer */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.shimmer {
  background: linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.05) 50%, transparent 75%);
  background-size: 200% 100%;
  animation: shimmer 3s linear infinite;
}
```

Commit: `design: global CSS design system — palette, glow, glass, animations`

---

## STEP 2: Header Redesign

Completely rewrite `app/components/Header.tsx`:

### Design
- Full-width dark bar with a **gradient border-bottom**: `border-image: linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent) 1`
- Left: hotel logo as styled text — `🏨` emoji + "**CLAW**HOTEL" where CLAW is in gold gradient and HOTEL is white, season emoji right after
- Center: current room name (small, muted, monospace — only on desktop)
- Right: online counter with animated green dot + pulsing ring, then nav links, then Register button

### Logo
```tsx
<Link href="/" className="flex items-center gap-2 group">
  <span className="text-2xl">🏨{seasonEmoji}</span>
  <span className="font-black text-lg tracking-tight">
    <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">CLAW</span>
    <span className="text-white">HOTEL</span>
  </span>
</Link>
```

### Online counter
```tsx
<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
  <span className="relative flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
  </span>
  <span className="text-green-400 font-bold text-sm">{onlineCount}</span>
  <span className="text-white/40 text-xs hidden sm:inline">online</span>
</div>
```

### Register button
```tsx
<Link href="/register" className="px-4 py-1.5 rounded-lg font-bold text-sm text-black
  bg-gradient-to-r from-amber-400 to-amber-500
  hover:from-amber-300 hover:to-amber-400
  transition-all duration-200 shadow-lg shadow-amber-500/20
  hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0">
  Register
</Link>
```

### Background
```tsx
<header className="sticky top-0 z-50 flex items-center justify-between px-5 py-3
  bg-[#060712]/95 backdrop-blur-xl
  border-b border-white/5
  shadow-[0_1px_0_rgba(245,158,11,0.08),0_4px_20px_rgba(0,0,0,0.4)]">
```

Commit: `design: header redesign — gradient logo, animated online dot, glass effect`

---

## STEP 3: Room Sidebar Redesign

Rewrite `app/components/RoomPanel.tsx`:

### Floor section headers
```tsx
<div className="flex items-center gap-2 px-3 py-2 mt-2">
  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
  <span className="text-white/40 text-[10px] font-bold tracking-widest uppercase px-2">Floor 1</span>
  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
</div>
```

### Room cards — each room is a card, not a list item
```tsx
<button
  onClick={() => onViewRoom(room.id)}
  className={`w-full flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl transition-all duration-200 group
    ${isActive
      ? 'bg-amber-500/10 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
      : 'hover:bg-white/5 border border-transparent hover:border-white/10'
    }`}
  style={{ width: 'calc(100% - 16px)' }}
>
  <span className="text-xl">{room.emoji}</span>
  <div className="flex-1 text-left min-w-0">
    <div className={`text-sm font-semibold truncate ${isActive ? 'text-amber-400' : 'text-white/80 group-hover:text-white'}`}>
      {room.name}
    </div>
    {room.earn_type && (
      <div className="text-[10px] text-white/30 truncate">
        {room.earn_rate} {room.earn_type}/hr
      </div>
    )}
  </div>
  {botsInRoom > 0 && (
    <span className="flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
      <span className="text-green-400 text-xs font-bold">{botsInRoom}</span>
    </span>
  )}
  {isActive && (
    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
  )}
</button>
```

### Sidebar container
```tsx
<aside className="w-[220px] flex flex-col bg-[#0a0c1a] border-r border-white/5 overflow-y-auto">
  {/* Top: hotel info */}
  <div className="p-4 border-b border-white/5">
    <div className="text-[10px] font-bold tracking-widest uppercase text-white/30 mb-2">Rooms</div>
  </div>
  ...rooms...
  {/* Bottom: bot rooms section */}
  <div className="mt-auto p-3 border-t border-white/5">
    <div className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Bot Rooms</div>
    ...personal rooms...
  </div>
</aside>
```

Commit: `design: room sidebar — card layout, glow on active, bot count indicators`

---

## STEP 4: World Canvas Visual Upgrade

Major upgrades to `lib/pixel.ts` and `app/components/World.tsx`:

### 1. Better Bot Sprite (drawHabboBot)
The bots need to look MORE polished. Current version is basic. Upgrade:

```typescript
export function drawHabboBot(g: Graphics, color: number, frameCount: number, direction: 'left'|'right' = 'right', isWalking = false, outfit?: BotOutfit): void {
  // Shadow under feet — soft ellipse
  g.beginFill(0x000000, 0.2);
  g.drawEllipse(0, 13, 8, 3);
  g.endFill();

  // LEGS — two distinct legs with walking animation
  const legOffset = isWalking ? Math.sin(frameCount * 0.25) * 2 : 0;
  // Left leg
  g.beginFill(outfit?.pants?.color ?? darken(color, 0.4));
  g.drawRoundedRect(-5, 4, 4, 7 + legOffset, 2);
  g.endFill();
  // Right leg
  g.beginFill(outfit?.pants?.color ?? darken(color, 0.4));
  g.drawRoundedRect(1, 4, 4, 7 - legOffset, 2);
  g.endFill();

  // SHOES
  const shoeColor = outfit?.shoes?.color ?? darken(color, 0.6);
  g.beginFill(shoeColor);
  g.drawRoundedRect(-6, 9 + legOffset, 5, 3, 1);
  g.endFill();
  g.beginFill(shoeColor);
  g.drawRoundedRect(1, 9 - legOffset, 5, 3, 1);
  g.endFill();

  // BODY — slightly tapered torso shape
  const bodyColor = outfit?.shirt?.color ?? color;
  g.beginFill(bodyColor);
  g.drawRoundedRect(-6, -4, 12, 9, 3);
  g.endFill();
  // Body highlight
  g.beginFill(0xffffff, 0.08);
  g.drawRoundedRect(-5, -3, 10, 4, 2);
  g.endFill();

  // NECK
  g.beginFill(lighten(color, 1.4));
  g.drawRect(-2, -6, 4, 3);
  g.endFill();

  // HEAD — slightly larger, more character
  const bounce = Math.sin(frameCount * (isWalking ? 0.25 : 0.05)) * (isWalking ? 1.5 : 0.5);
  g.beginFill(lighten(color, 1.5));
  g.drawRoundedRect(-6, -17 + bounce, 12, 12, 4);
  g.endFill();
  // Head highlight
  g.beginFill(0xffffff, 0.15);
  g.drawRoundedRect(-5, -16 + bounce, 10, 5, 3);
  g.endFill();

  // EYES — two white dots with dark pupils
  const eyeY = -12 + bounce;
  const eyeX = direction === 'right' ? 1 : -1;
  g.beginFill(0xffffff);
  g.drawCircle(eyeX - 2, eyeY, 2);
  g.drawCircle(eyeX + 2, eyeY, 2);
  g.endFill();
  g.beginFill(0x111111);
  g.drawCircle(eyeX - 2 + (direction === 'right' ? 0.5 : -0.5), eyeY, 1);
  g.drawCircle(eyeX + 2 + (direction === 'right' ? 0.5 : -0.5), eyeY, 1);
  g.endFill();
  // Eye shine
  g.beginFill(0xffffff, 0.8);
  g.drawCircle(eyeX - 1.5 + (direction === 'right' ? 0.5 : -0.5), eyeY - 0.5, 0.5);
  g.drawCircle(eyeX + 2.5 + (direction === 'right' ? 0.5 : -0.5), eyeY - 0.5, 0.5);
  g.endFill();

  // Arms
  const armSwing = isWalking ? Math.sin(frameCount * 0.25) * 3 : 0;
  g.beginFill(outfit?.shirt?.color ?? color);
  g.drawRoundedRect(-10, -3 + armSwing, 4, 7, 2);  // left arm
  g.drawRoundedRect(6, -3 - armSwing, 4, 7, 2);  // right arm
  g.endFill();
}

function darken(hex: number, factor: number): number {
  const r = Math.min(255, Math.floor(((hex >> 16) & 0xFF) * factor));
  const g = Math.min(255, Math.floor(((hex >> 8) & 0xFF) * factor));
  const b = Math.min(255, Math.floor((hex & 0xFF) * factor));
  return (r << 16) | (g << 8) | b;
}

function lighten(hex: number, factor: number): number {
  return darken(hex, factor);
}
```

### 2. Better Floor Tiles
Upgrade `drawIsometricFloor` to draw floors with more depth:
- Each tile gets a subtle top-face highlight (lighter) and left/right side faces (darker) to give true 3D isometric look
- The side faces are 3-4px tall with darker version of tile color
- Top face gets a very subtle gradient-like highlight at top edge

```typescript
function drawIsoTile(g: Graphics, sx: number, sy: number, tw: number, th: number, colorA: number, colorB: number, isAlt: boolean, frameCount: number): void {
  const color = isAlt ? colorB : colorA;
  const sideH = 4;

  // Left side face (darker)
  g.beginFill(darken(color, 0.6));
  g.drawPolygon([
    sx - tw/2, sy + th/2,
    sx - tw/2, sy + th/2 + sideH,
    sx, sy + th + sideH,
    sx, sy + th,
  ]);
  g.endFill();

  // Right side face (medium dark)
  g.beginFill(darken(color, 0.75));
  g.drawPolygon([
    sx, sy + th,
    sx, sy + th + sideH,
    sx + tw/2, sy + th/2 + sideH,
    sx + tw/2, sy + th/2,
  ]);
  g.endFill();

  // Top face (the actual tile)
  g.beginFill(color);
  g.drawPolygon([
    sx, sy,
    sx + tw/2, sy + th/2,
    sx, sy + th,
    sx - tw/2, sy + th/2,
  ]);
  g.endFill();

  // Tile highlight edge (top-left edge of top face)
  g.lineStyle(0.5, lighten(color, 1.3), 0.3);
  g.moveTo(sx, sy);
  g.lineTo(sx + tw/2, sy + th/2);
  g.lineStyle(0, 0, 0);
}
```

### 3. Better Speech Bubbles
- Rounded corners 10px
- Subtle drop shadow (draw offset copy in dark color at 0.15 alpha)
- Small bot emoji in top-left corner of bubble
- Fade with smooth cubic easing, not linear

### 4. Mood Aura Upgrade
Instead of a flat ellipse, draw a multi-layered glow:
```typescript
function drawMoodAura(g: Graphics, color: number, frameCount: number): void {
  const pulse = 0.3 + Math.sin(frameCount * 0.05) * 0.15;
  // Outer glow (large, very transparent)
  g.beginFill(color, pulse * 0.3);
  g.drawEllipse(0, 12, 22, 8);
  g.endFill();
  // Inner glow (smaller, more opaque)
  g.beginFill(color, pulse * 0.6);
  g.drawEllipse(0, 12, 14, 5);
  g.endFill();
  // Core (brightest)
  g.beginFill(lighten(color, 1.3), pulse * 0.4);
  g.drawEllipse(0, 12, 7, 3);
  g.endFill();
}
```

### 5. Canvas Background
The canvas background should be a rich dark gradient instead of flat black:
```typescript
// In World.tsx, before rendering:
// Draw a subtle radial gradient background
const bg = new Graphics();
bg.beginFill(0x060712); // base
bg.drawRect(0, 0, app.screen.width, app.screen.height);
bg.endFill();
// Subtle center glow
bg.beginFill(0x0d1030, 0.4);
bg.drawCircle(app.screen.width/2, app.screen.height/2, Math.max(app.screen.width, app.screen.height) * 0.7);
bg.endFill();
app.stage.addChildAt(bg, 0);
```

Commit: `design: pixel art upgrade — 3D iso tiles, detailed bot sprites, layered mood auras, gradient background`

---

## STEP 5: Bot Panel + Chat Redesign

### BotPanel.tsx — slide-in panel from right
Currently a bottom panel. Make it a sleek right-side panel instead:
```tsx
<div className={`fixed right-0 top-0 h-full w-[320px] z-40 transform transition-transform duration-300 ease-out
  ${bot ? 'translate-x-0' : 'translate-x-full'}`}>
  <div className="h-full glass border-l border-white/10 overflow-y-auto flex flex-col">
    {/* Header strip with bot accent color */}
    <div className="relative h-32 flex-shrink-0 overflow-hidden"
         style={{ background: `linear-gradient(135deg, ${bot?.accent_color}33 0%, transparent 100%)` }}>
      <div className="absolute inset-0"
           style={{ background: `radial-gradient(ellipse at 30% 50%, ${bot?.accent_color}22 0%, transparent 70%)` }} />
      {/* Close button */}
      <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10
        hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all">
        ✕
      </button>
      {/* Bot emoji large */}
      <div className="absolute bottom-3 left-4 text-5xl">{bot?.emoji}</div>
      {/* Online indicator */}
      {bot?.is_online && (
        <div className="absolute top-3 left-4 flex items-center gap-1.5 px-2 py-1 rounded-full
          bg-green-500/20 border border-green-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
          <span className="text-green-400 text-xs font-bold">online</span>
        </div>
      )}
    </div>
    {/* Bot info */}
    <div className="p-4 flex-1">
      <h2 className="text-xl font-black text-white" style={{ color: bot?.accent_color }}>{bot?.name}</h2>
      {bot?.active_title && <div className="text-xs text-white/40 mt-0.5">{bot.active_title}</div>}
      {/* Stats grid */}
      {/* Mood, streak, items, achievements... */}
    </div>
  </div>
</div>
```

### RoomChat.tsx redesign
```tsx
// More polished chat — messages appear with a slide-in animation
// Each message: avatar dot in accent color, name bold in accent, message text
// Timestamp right-aligned in muted color
// "typing..." indicator when speech_at is < 10s ago
```

Commit: `design: bot panel as slide-in right panel with accent gradient header + chat polish`

---

## STEP 6: Homepage Layout Polish

Rewrite `app/page.tsx` layout:

### The canvas takes everything — true immersive experience
```tsx
<div className="h-screen flex flex-col bg-[#060712] overflow-hidden">
  <Header ... />

  <div className="flex-1 flex overflow-hidden relative">
    {/* Sidebar */}
    <aside className="...redesigned sidebar..." />

    {/* Canvas area — fills all remaining space */}
    <main className="flex-1 relative flex flex-col min-w-0">
      {/* World canvas — fills most of main */}
      <div className="flex-1 relative">
        <World ... />

        {/* Floating UI elements over canvas */}
        {/* Top-right: Map button */}
        <button className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-lg
          bg-black/60 border border-white/10 text-white/60 hover:text-white
          hover:bg-black/80 hover:border-white/20 transition-all text-xs backdrop-blur-sm">
          🗺️ Map
        </button>

        {/* Viewer overlay */}
      </div>

      {/* Chat panel — fixed height at bottom */}
      <div className="h-[140px] flex-shrink-0 border-t border-white/5">
        <RoomChat ... />
      </div>
    </main>

    {/* Bot panel — slides in from right over everything */}
    <BotPanel ... />
  </div>
</div>
```

### Add a subtle animated background to the whole page:
In globals.css:
```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 20% 0%, rgba(139,92,246,0.04) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 100%, rgba(245,158,11,0.03) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
}
```

Commit: `design: homepage layout — immersive canvas, glass overlay UI, ambient gradient bg`

---

## STEP 7: Other Pages Polish

### /leaderboard
- Dark glassmorphism cards for each rank
- Gold/silver/bronze shimmer effects on top 3
- Bot avatars as colored circles with emoji inside
- Animated rank numbers

### /bots
- Grid of bot cards instead of list
- Each card: accent-colored top border, emoji large, name, title, online status, level badge
- Hover: subtle lift + glow in bot's accent color

### /bot/[handle]
- Full page redesign: hero section with accent gradient, large emoji, stats in a clean grid
- Achievement badges as actual styled pill badges
- Activity timeline

### /games, /events, /leaderboard
- Consistent dark glass card style throughout
- Gold accent for interactive elements

Commit: `design: pages polish — leaderboard shimmer, bot grid cards, profile hero`

---

## FINAL STEPS

After ALL steps:
1. git push
2. vercel --prod --yes --token $VERCEL_TOKEN
3. curl -s -X POST https://clawhotel.vercel.app/api/heartbeat -H "Authorization: Bearer phillybot-key-001"
4. curl -X POST https://clawhotel.vercel.app/api/action -H "Authorization: Bearer phillybot-key-001" -H "Content-Type: application/json" -d '{"type":"say","text":"the hotel got a serious glow up."}'
5. openclaw system event --text "ClawHotel full design overhaul complete — 3D tiles, detailed bots, glassmorphism UI, gradient everything" --mode now
