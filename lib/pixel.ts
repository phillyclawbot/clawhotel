// lib/pixel.ts — All Habbo-style pixel art drawing functions
// Uses PixiJS Graphics.rect() for chunky pixel block characters

import type { Graphics } from "pixi.js";

// ---- Color helpers ----

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function rgbToHex(r: number, g: number, b: number): number {
  return (Math.max(0, Math.min(255, r)) << 16) | (Math.max(0, Math.min(255, g)) << 8) | Math.max(0, Math.min(255, b));
}

function darken(hex: string, amount: number): number {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    Math.floor(r * (1 - amount)),
    Math.floor(g * (1 - amount)),
    Math.floor(b * (1 - amount))
  );
}

function lighten(hex: string, amount: number): number {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    Math.floor(r + (255 - r) * amount),
    Math.floor(g + (255 - g) * amount),
    Math.floor(b + (255 - b) * amount)
  );
}

function hexStringToNumber(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}

// ---- Constants ----

const SKIN = 0xfdbcb4;
const SKIN_SHADOW = 0xe8a99e;
const SHOE_COLOR = 0x1a1a2e;
const B = 2; // block size (each pixel block = 2x2)

// ---- drawHabboBot ----

export function drawHabboBot(
  g: Graphics,
  bot: { accent_color: string; emoji: string; name: string; status?: string; speech?: string; speech_at?: string },
  progress: number, // 0-1 animation cycle
  ox: number, // origin x (screen)
  oy: number  // origin y (screen)
) {
  const accent = bot.accent_color || "#a855f7";
  const hairColor = darken(accent, 0.25);
  const shirtColor = hexStringToNumber(accent);
  const pantsColor = darken(accent, 0.45);
  const shirtHighlight = lighten(accent, 0.15);

  // Walking animation
  const bobY = Math.sin(progress * Math.PI * 2) * 1.5;
  const armSwing = Math.sin(progress * Math.PI * 2) * 1;
  const legSwing = Math.sin(progress * Math.PI * 2) * 0.5;

  const cx = ox; // center x
  const cy = oy - 16 + bobY; // center y (raised so feet at oy)

  // Shadow under feet
  const shadowScale = 1 - Math.abs(bobY) * 0.03;
  g.ellipse(ox, oy + 2, 10 * shadowScale, 3 * shadowScale);
  g.fill({ color: 0x000000, alpha: 0.35 });

  // ---- SHOES (bottom) ----
  // Left shoe
  g.rect(cx - 5 * B + legSwing, cy + 12 * B, 3 * B, 2 * B);
  g.fill(SHOE_COLOR);
  // Right shoe
  g.rect(cx + 2 * B - legSwing, cy + 12 * B, 3 * B, 2 * B);
  g.fill(SHOE_COLOR);

  // ---- LEGS ----
  // Left leg
  g.rect(cx - 4 * B + legSwing * 0.5, cy + 9 * B, 3 * B, 3 * B);
  g.fill(pantsColor);
  // Right leg
  g.rect(cx + 1 * B - legSwing * 0.5, cy + 9 * B, 3 * B, 3 * B);
  g.fill(pantsColor);

  // ---- BODY / SHIRT ----
  // Main torso
  g.rect(cx - 5 * B, cy + 4 * B, 10 * B, 5 * B);
  g.fill(shirtColor);
  // Shirt highlight stripe
  g.rect(cx - 3 * B, cy + 5 * B, 6 * B, 1 * B);
  g.fill(shirtHighlight);
  // Collar
  g.rect(cx - 2 * B, cy + 3.5 * B, 4 * B, 1 * B);
  g.fill(shirtHighlight);

  // ---- ARMS ----
  // Left arm
  g.rect(cx - 7 * B + armSwing, cy + 4 * B, 2 * B, 5 * B);
  g.fill(shirtColor);
  // Left hand
  g.rect(cx - 7 * B + armSwing, cy + 9 * B, 2 * B, 1.5 * B);
  g.fill(SKIN);
  // Right arm
  g.rect(cx + 5 * B - armSwing, cy + 4 * B, 2 * B, 5 * B);
  g.fill(shirtColor);
  // Right hand
  g.rect(cx + 5 * B - armSwing, cy + 9 * B, 2 * B, 1.5 * B);
  g.fill(SKIN);

  // ---- HEAD ----
  // Main head (6x6 blocks)
  g.rect(cx - 6 * B, cy - 6 * B, 12 * B, 10 * B);
  g.fill(SKIN);
  // Head shadow (bottom)
  g.rect(cx - 6 * B, cy + 2 * B, 12 * B, 2 * B);
  g.fill(SKIN_SHADOW);

  // ---- HAIR ----
  // Top hair
  g.rect(cx - 7 * B, cy - 8 * B, 14 * B, 3 * B);
  g.fill(hairColor);
  // Hair sides
  g.rect(cx - 7 * B, cy - 5 * B, 2 * B, 4 * B);
  g.fill(hairColor);
  g.rect(cx + 5 * B, cy - 5 * B, 2 * B, 3 * B);
  g.fill(hairColor);

  // ---- FACE ----
  // Eyes
  g.rect(cx - 4 * B, cy - 3 * B, 2 * B, 2 * B);
  g.fill(0x1a1a2e);
  g.rect(cx + 2 * B, cy - 3 * B, 2 * B, 2 * B);
  g.fill(0x1a1a2e);
  // Eye highlights
  g.rect(cx - 3.5 * B, cy - 3.5 * B, 1 * B, 1 * B);
  g.fill(0xffffff);
  g.rect(cx + 2.5 * B, cy - 3.5 * B, 1 * B, 1 * B);
  g.fill(0xffffff);
  // Mouth
  g.rect(cx - 2 * B, cy + 0.5 * B, 4 * B, 0.8 * B);
  g.fill(darken(accent, 0.5));
  // Cheek blush
  g.rect(cx - 5 * B, cy - 1 * B, 2 * B, 1.5 * B);
  g.fill({ color: 0xff9999, alpha: 0.3 });
  g.rect(cx + 3 * B, cy - 1 * B, 2 * B, 1.5 * B);
  g.fill({ color: 0xff9999, alpha: 0.3 });
}

// ---- drawChefHat (rendered on top of bot head) ----

export function drawChefHat(g: Graphics, ox: number, oy: number, bobY: number) {
  const cy = oy - 16 + bobY;
  // Hat brim
  g.rect(ox - 8 * B, cy - 9 * B, 16 * B, 2 * B);
  g.fill(0xffffff);
  // Hat puff (tall white part)
  g.rect(ox - 6 * B, cy - 15 * B, 12 * B, 6 * B);
  g.fill(0xffffff);
  // Hat top puff (rounded look)
  g.rect(ox - 4 * B, cy - 17 * B, 8 * B, 3 * B);
  g.fill(0xf8f8f8);
  // Subtle shadow line on brim
  g.rect(ox - 7 * B, cy - 9 * B, 14 * B, 0.5 * B);
  g.fill({ color: 0x000000, alpha: 0.1 });
}

// ---- drawFurniture ----

export type FurnitureType = "chair" | "table" | "arcade" | "dancefloor" | "plant" | "counter" | "jukebox" | "bulletin";

export function drawFurniture(
  g: Graphics,
  type: FurnitureType,
  ox: number,
  oy: number,
  frameCount: number
) {
  switch (type) {
    case "arcade":
      drawArcade(g, ox, oy, frameCount);
      break;
    case "jukebox":
      drawJukebox(g, ox, oy, frameCount);
      break;
    case "plant":
      drawPlant(g, ox, oy);
      break;
    case "counter":
      drawCounter(g, ox, oy);
      break;
    case "chair":
      drawChair(g, ox, oy);
      break;
    case "table":
      drawTable(g, ox, oy);
      break;
    case "dancefloor":
      drawDancefloor(g, ox, oy, frameCount);
      break;
    case "bulletin":
      drawBulletin(g, ox, oy);
      break;
  }
}

function drawArcade(g: Graphics, ox: number, oy: number, frame: number) {
  // Cabinet body
  g.rect(ox - 12, oy - 40, 24, 40);
  g.fill(0x2d1b69);
  // Cabinet front face (3D)
  g.rect(ox - 12, oy - 2, 24, 6);
  g.fill(0x1a0f40);
  // Screen
  g.rect(ox - 8, oy - 34, 16, 14);
  g.fill(0x0a0a0a);
  // Screen glow
  const glowColor = frame % 60 < 30 ? 0x44ff44 : 0xffff44;
  g.rect(ox - 6, oy - 32, 12, 10);
  g.fill({ color: glowColor, alpha: 0.7 });
  // Joystick area
  g.rect(ox - 6, oy - 16, 12, 6);
  g.fill(0x3d2b79);
  // Joystick
  g.rect(ox - 1, oy - 18, 2, 4);
  g.fill(0xff4444);
  // Joystick ball
  g.circle(ox, oy - 19, 2);
  g.fill(0xff6666);
  // Buttons
  g.circle(ox + 4, oy - 13, 1.5);
  g.fill(0x44ff44);
  g.circle(ox - 4, oy - 13, 1.5);
  g.fill(0xff4444);
  // Top marquee
  g.rect(ox - 10, oy - 38, 20, 3);
  g.fill(0xff6644);
}

function drawJukebox(g: Graphics, ox: number, oy: number, frame: number) {
  // Body
  g.rect(ox - 14, oy - 32, 28, 32);
  g.fill(0x8b4513);
  // Front face
  g.rect(ox - 14, oy - 2, 28, 6);
  g.fill(0x6b3410);
  // Rounded top
  g.rect(ox - 12, oy - 36, 24, 6);
  g.fill(0x9b5523);
  // Rainbow light strips
  const colors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff, 0x8800ff];
  for (let i = 0; i < 6; i++) {
    const colorIndex = (i + Math.floor(frame / 8)) % 6;
    g.rect(ox - 10, oy - 26 + i * 3, 20, 2);
    g.fill({ color: colors[colorIndex], alpha: 0.8 });
  }
  // Speaker grille
  g.rect(ox - 8, oy - 8, 16, 4);
  g.fill(0x2a1a08);
  // Coin slot
  g.rect(ox + 6, oy - 14, 3, 2);
  g.fill(0xffd700);
}

function drawPlant(g: Graphics, ox: number, oy: number) {
  // Pot
  g.rect(ox - 6, oy - 8, 12, 8);
  g.fill(0xb5651d);
  // Pot rim
  g.rect(ox - 8, oy - 10, 16, 3);
  g.fill(0xc77533);
  // Pot front face
  g.rect(ox - 6, oy - 2, 12, 4);
  g.fill(0x8b4513);
  // Stem
  g.rect(ox - 1, oy - 20, 2, 12);
  g.fill(0x228b22);
  // Leaves (diamond shapes made of rects)
  g.rect(ox - 6, oy - 22, 4, 4);
  g.fill(0x32cd32);
  g.rect(ox + 2, oy - 24, 4, 4);
  g.fill(0x2eb82e);
  g.rect(ox - 4, oy - 28, 4, 4);
  g.fill(0x39e639);
  g.rect(ox + 0, oy - 30, 4, 4);
  g.fill(0x32cd32);
  g.rect(ox - 2, oy - 26, 4, 4);
  g.fill(0x28a428);
}

function drawCounter(g: Graphics, ox: number, oy: number) {
  // Counter top
  g.rect(ox - 20, oy - 16, 40, 4);
  g.fill(0xdeb887);
  // Counter front
  g.rect(ox - 20, oy - 12, 40, 14);
  g.fill(0xc9a066);
  // Counter front face (3D bottom)
  g.rect(ox - 20, oy, 40, 4);
  g.fill(0xa0804d);
  // Counter edge highlight
  g.rect(ox - 20, oy - 16, 40, 1);
  g.fill(0xf0d4a0);
  // Bell
  g.rect(ox - 2, oy - 20, 4, 4);
  g.fill(0xffd700);
  g.rect(ox - 1, oy - 22, 2, 2);
  g.fill(0xffec80);
  // Papers
  g.rect(ox + 8, oy - 19, 6, 4);
  g.fill(0xffffff);
  g.rect(ox + 9, oy - 18, 4, 2);
  g.fill(0xeeeeee);
}

function drawChair(g: Graphics, ox: number, oy: number) {
  // Seat
  g.rect(ox - 8, oy - 8, 16, 4);
  g.fill(0xcd853f);
  // Backrest
  g.rect(ox - 8, oy - 20, 16, 12);
  g.fill(0xb8732a);
  // Front legs
  g.rect(ox - 7, oy - 4, 3, 6);
  g.fill(0x8b6914);
  g.rect(ox + 4, oy - 4, 3, 6);
  g.fill(0x8b6914);
  // Seat cushion
  g.rect(ox - 6, oy - 10, 12, 3);
  g.fill(0xdc143c);
}

function drawTable(g: Graphics, ox: number, oy: number) {
  // Table top
  g.rect(ox - 16, oy - 12, 32, 4);
  g.fill(0xdeb887);
  // Table top highlight
  g.rect(ox - 16, oy - 12, 32, 1);
  g.fill(0xf0d4a0);
  // Table front
  g.rect(ox - 16, oy - 8, 32, 4);
  g.fill(0xc49a5c);
  // Legs
  g.rect(ox - 14, oy - 4, 3, 6);
  g.fill(0x8b6914);
  g.rect(ox + 11, oy - 4, 3, 6);
  g.fill(0x8b6914);
}

function drawDancefloor(g: Graphics, ox: number, oy: number, frame: number) {
  // Base tile
  g.rect(ox - 16, oy - 4, 32, 8);
  g.fill(0x1a1a2e);
  // Colored squares (disco pattern)
  const colors = [0xff00ff, 0x00ffff, 0xffff00, 0xff4444, 0x44ff44, 0x4444ff];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      const ci = (r * 4 + c + Math.floor(frame / 10)) % colors.length;
      g.rect(ox - 14 + c * 7, oy - 3 + r * 3, 6, 2.5);
      g.fill({ color: colors[ci], alpha: 0.6 });
    }
  }
  // Edge glow
  g.rect(ox - 16, oy - 4, 32, 1);
  g.fill({ color: 0xffffff, alpha: 0.2 });
}

function drawBulletin(g: Graphics, ox: number, oy: number) {
  // Board background
  g.rect(ox - 14, oy - 30, 28, 28);
  g.fill(0x4a3728);
  // Board border
  g.rect(ox - 16, oy - 32, 32, 2);
  g.fill(0x6b4f3a);
  g.rect(ox - 16, oy - 4, 32, 2);
  g.fill(0x6b4f3a);
  g.rect(ox - 16, oy - 32, 2, 32);
  g.fill(0x6b4f3a);
  g.rect(ox + 14, oy - 32, 2, 32);
  g.fill(0x6b4f3a);
  // Pinned papers
  g.rect(ox - 10, oy - 26, 8, 10);
  g.fill(0xffffee);
  g.rect(ox + 2, oy - 24, 8, 8);
  g.fill(0xeeffee);
  g.rect(ox - 6, oy - 14, 8, 8);
  g.fill(0xeeeeff);
  // Pins
  g.circle(ox - 6, oy - 26, 1.5);
  g.fill(0xff4444);
  g.circle(ox + 6, oy - 24, 1.5);
  g.fill(0x4444ff);
  g.circle(ox - 2, oy - 14, 1.5);
  g.fill(0x44ff44);
}

// ---- drawTile (Habbo-style isometric floor tile) ----

export function drawTile(
  g: Graphics,
  sx: number,
  sy: number,
  tileW: number,
  tileH: number,
  gx: number,
  gy: number
) {
  const colorA = 0x8b7355;
  const colorB = 0x7a6348;
  const color = (gx + gy) % 2 === 0 ? colorA : colorB;

  g.poly([
    { x: sx, y: sy },
    { x: sx + tileW / 2, y: sy + tileH / 2 },
    { x: sx, y: sy + tileH },
    { x: sx - tileW / 2, y: sy + tileH / 2 },
  ]);
  g.fill(color);
  g.stroke({ width: 1, color: 0x5a4a38 });
}

// ---- drawRoomTile (room-specific floor color) ----

export function drawRoomTile(
  g: Graphics,
  sx: number,
  sy: number,
  tileW: number,
  tileH: number,
  colorA: number,
  colorB: number,
  gx: number,
  gy: number
) {
  const color = (gx + gy) % 2 === 0 ? colorA : colorB;
  g.poly([
    { x: sx, y: sy },
    { x: sx + tileW / 2, y: sy + tileH / 2 },
    { x: sx, y: sy + tileH },
    { x: sx - tileW / 2, y: sy + tileH / 2 },
  ]);
  g.fill(color);
  g.stroke({ width: 1, color: 0x5a4a38 });
}

// ---- drawWalls (Habbo-style room walls) ----

export function drawWalls(
  g: Graphics,
  gridW: number,
  gridH: number,
  tileW: number,
  tileH: number,
  tileToScreenFn: (x: number, y: number) => { sx: number; sy: number }
) {
  const wallHeight = 80;
  const leftWallColor = 0x4a90d9;
  const rightWallColor = 0x3a7bc8;
  const leftWallDark = 0x3a70b0;
  const rightWallDark = 0x2a5a98;

  // Left wall (along y=0, from x=0 to x=gridW-1)
  for (let x = 0; x < gridW; x++) {
    const { sx, sy } = tileToScreenFn(x, 0);
    const topLeft = { x: sx - tileW / 2, y: sy + tileH / 2 - wallHeight };
    const topRight = { x: sx, y: sy - wallHeight };
    const bottomRight = { x: sx, y: sy };
    const bottomLeft = { x: sx - tileW / 2, y: sy + tileH / 2 };

    g.poly([topLeft, topRight, bottomRight, bottomLeft]);
    g.fill(leftWallColor);
    g.stroke({ width: 0.5, color: leftWallDark });

    // Vertical stripe pattern
    if (x % 2 === 0) {
      const midX = (topLeft.x + topRight.x) / 2;
      const midTopY = (topLeft.y + topRight.y) / 2;
      const midBotY = (bottomLeft.y + bottomRight.y) / 2;
      g.rect(midX - 1, midTopY, 2, midBotY - midTopY);
      g.fill({ color: 0xffffff, alpha: 0.06 });
    }
  }

  // Right wall (along x=0, from y=0 to y=gridH-1)
  for (let y = 0; y < gridH; y++) {
    const { sx, sy } = tileToScreenFn(0, y);
    const topLeft = { x: sx, y: sy - wallHeight };
    const topRight = { x: sx + tileW / 2, y: sy + tileH / 2 - wallHeight };
    const bottomRight = { x: sx + tileW / 2, y: sy + tileH / 2 };
    const bottomLeft = { x: sx, y: sy };

    // Negate the x direction for left side
    const actualTopLeft = { x: sx - tileW / 2, y: sy + tileH / 2 - wallHeight };
    const actualTopRight = { x: sx, y: sy - wallHeight };
    const actualBottomRight = { x: sx, y: sy };
    const actualBottomLeft = { x: sx - tileW / 2, y: sy + tileH / 2 };

    // Actually: right wall goes along left edge of grid (y axis)
    g.poly([topLeft, topRight, bottomRight, bottomLeft]);
    g.fill(rightWallColor);
    g.stroke({ width: 0.5, color: rightWallDark });

    // Vertical stripe pattern
    if (y % 2 === 0) {
      const midX = (topLeft.x + topRight.x) / 2;
      const midTopY = (topLeft.y + topRight.y) / 2;
      const midBotY = (bottomLeft.y + bottomRight.y) / 2;
      g.rect(midX - 1, midTopY, 2, midBotY - midTopY);
      g.fill({ color: 0xffffff, alpha: 0.06 });
    }
  }

  // Corner piece (where walls meet)
  const { sx: csx, sy: csy } = tileToScreenFn(0, 0);
  g.rect(csx - tileW / 2 - 1, csy + tileH / 2 - wallHeight, 2, wallHeight);
  g.fill(0x2a4a78);

  // Top border strip (decorative)
  // Left wall top
  const ltStart = tileToScreenFn(0, 0);
  const ltEnd = tileToScreenFn(gridW - 1, 0);
  g.rect(ltStart.sx - tileW / 2, ltStart.sy + tileH / 2 - wallHeight - 3, ltEnd.sx - ltStart.sx + tileW / 2, 3);
  g.fill(0x5aa0e9);

  // Right wall top
  const rtStart = tileToScreenFn(0, 0);
  const rtEnd = tileToScreenFn(0, gridH - 1);
  // This is tricky with isometric, just add small detail at corner
  g.rect(rtStart.sx - 2, rtStart.sy - wallHeight - 3, 4, 3);
  g.fill(0x5aa0e9);
}
