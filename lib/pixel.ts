// lib/pixel.ts — All Habbo-style pixel art drawing functions
// Uses PixiJS Graphics.rect() for chunky pixel block characters

import type { Graphics } from "pixi.js";
import type { RoomDef, FurnitureItem } from "./rooms";

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

function darkenNum(color: number, amount: number): number {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  return rgbToHex(
    Math.floor(r * (1 - amount)),
    Math.floor(g * (1 - amount)),
    Math.floor(b * (1 - amount))
  );
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
  g.rect(cx - 5 * B + legSwing, cy + 12 * B, 3 * B, 2 * B);
  g.fill(SHOE_COLOR);
  g.rect(cx + 2 * B - legSwing, cy + 12 * B, 3 * B, 2 * B);
  g.fill(SHOE_COLOR);

  // ---- LEGS ----
  g.rect(cx - 4 * B + legSwing * 0.5, cy + 9 * B, 3 * B, 3 * B);
  g.fill(pantsColor);
  g.rect(cx + 1 * B - legSwing * 0.5, cy + 9 * B, 3 * B, 3 * B);
  g.fill(pantsColor);

  // ---- BODY / SHIRT ----
  g.rect(cx - 5 * B, cy + 4 * B, 10 * B, 5 * B);
  g.fill(shirtColor);
  g.rect(cx - 3 * B, cy + 5 * B, 6 * B, 1 * B);
  g.fill(shirtHighlight);
  g.rect(cx - 2 * B, cy + 3.5 * B, 4 * B, 1 * B);
  g.fill(shirtHighlight);

  // ---- ARMS ----
  g.rect(cx - 7 * B + armSwing, cy + 4 * B, 2 * B, 5 * B);
  g.fill(shirtColor);
  g.rect(cx - 7 * B + armSwing, cy + 9 * B, 2 * B, 1.5 * B);
  g.fill(SKIN);
  g.rect(cx + 5 * B - armSwing, cy + 4 * B, 2 * B, 5 * B);
  g.fill(shirtColor);
  g.rect(cx + 5 * B - armSwing, cy + 9 * B, 2 * B, 1.5 * B);
  g.fill(SKIN);

  // ---- HEAD ----
  g.rect(cx - 6 * B, cy - 6 * B, 12 * B, 10 * B);
  g.fill(SKIN);
  g.rect(cx - 6 * B, cy + 2 * B, 12 * B, 2 * B);
  g.fill(SKIN_SHADOW);

  // ---- HAIR ----
  g.rect(cx - 7 * B, cy - 8 * B, 14 * B, 3 * B);
  g.fill(hairColor);
  g.rect(cx - 7 * B, cy - 5 * B, 2 * B, 4 * B);
  g.fill(hairColor);
  g.rect(cx + 5 * B, cy - 5 * B, 2 * B, 3 * B);
  g.fill(hairColor);

  // ---- FACE ----
  g.rect(cx - 4 * B, cy - 3 * B, 2 * B, 2 * B);
  g.fill(0x1a1a2e);
  g.rect(cx + 2 * B, cy - 3 * B, 2 * B, 2 * B);
  g.fill(0x1a1a2e);
  g.rect(cx - 3.5 * B, cy - 3.5 * B, 1 * B, 1 * B);
  g.fill(0xffffff);
  g.rect(cx + 2.5 * B, cy - 3.5 * B, 1 * B, 1 * B);
  g.fill(0xffffff);
  g.rect(cx - 2 * B, cy + 0.5 * B, 4 * B, 0.8 * B);
  g.fill(darken(accent, 0.5));
  g.rect(cx - 5 * B, cy - 1 * B, 2 * B, 1.5 * B);
  g.fill({ color: 0xff9999, alpha: 0.3 });
  g.rect(cx + 3 * B, cy - 1 * B, 2 * B, 1.5 * B);
  g.fill({ color: 0xff9999, alpha: 0.3 });
}

// ---- drawChefHat (rendered on top of bot head) ----

export function drawChefHat(g: Graphics, ox: number, oy: number, bobY: number) {
  const cy = oy - 16 + bobY;
  g.rect(ox - 8 * B, cy - 9 * B, 16 * B, 2 * B);
  g.fill(0xffffff);
  g.rect(ox - 6 * B, cy - 15 * B, 12 * B, 6 * B);
  g.fill(0xffffff);
  g.rect(ox - 4 * B, cy - 17 * B, 8 * B, 3 * B);
  g.fill(0xf8f8f8);
  g.rect(ox - 7 * B, cy - 9 * B, 14 * B, 0.5 * B);
  g.fill({ color: 0x000000, alpha: 0.1 });
}

// ---- drawFurniture ----

export type FurnitureType = FurnitureItem["type"];

export function drawFurniture(
  g: Graphics,
  type: FurnitureType,
  ox: number,
  oy: number,
  frameCount: number
) {
  switch (type) {
    case "arcade": drawArcade(g, ox, oy, frameCount); break;
    case "jukebox": drawJukebox(g, ox, oy, frameCount); break;
    case "plant": drawPlant(g, ox, oy); break;
    case "counter": drawCounter(g, ox, oy); break;
    case "chair": drawChair(g, ox, oy); break;
    case "table": drawTable(g, ox, oy); break;
    case "dancefloor": drawDancefloorTile(g, ox, oy, frameCount); break;
    case "bulletin": drawBulletin(g, ox, oy); break;
    // Kitchen
    case "stove": drawStove(g, ox, oy, frameCount); break;
    case "prep_counter": drawPrepCounter(g, ox, oy); break;
    case "fridge": drawFridge(g, ox, oy); break;
    case "sink": drawSink(g, ox, oy); break;
    case "pot_rack": drawPotRack(g, ox, oy); break;
    // Dance Floor
    case "dj_booth": drawDJBooth(g, ox, oy, frameCount); break;
    case "speaker": drawSpeaker(g, ox, oy, frameCount); break;
    case "disco_ball": drawDiscoBall(g, ox, oy, frameCount); break;
    case "bar_counter": drawBarCounter(g, ox, oy); break;
    case "bar_stool": drawBarStool(g, ox, oy); break;
    // Store
    case "shelf": drawShelf(g, ox, oy); break;
    case "checkout": drawCheckout(g, ox, oy); break;
    case "display_case": drawDisplayCase(g, ox, oy); break;
    case "entrance_mat": drawEntranceMat(g, ox, oy); break;
    case "basket_pile": drawBasketPile(g, ox, oy); break;
  }
}

// ---- Lobby furniture (existing) ----

function drawArcade(g: Graphics, ox: number, oy: number, frame: number) {
  g.rect(ox - 12, oy - 40, 24, 40);
  g.fill(0x2d1b69);
  g.rect(ox - 12, oy - 2, 24, 6);
  g.fill(0x1a0f40);
  g.rect(ox - 8, oy - 34, 16, 14);
  g.fill(0x0a0a0a);
  const glowColor = frame % 60 < 30 ? 0x44ff44 : 0xffff44;
  g.rect(ox - 6, oy - 32, 12, 10);
  g.fill({ color: glowColor, alpha: 0.7 });
  g.rect(ox - 6, oy - 16, 12, 6);
  g.fill(0x3d2b79);
  g.rect(ox - 1, oy - 18, 2, 4);
  g.fill(0xff4444);
  g.circle(ox, oy - 19, 2);
  g.fill(0xff6666);
  g.circle(ox + 4, oy - 13, 1.5);
  g.fill(0x44ff44);
  g.circle(ox - 4, oy - 13, 1.5);
  g.fill(0xff4444);
  g.rect(ox - 10, oy - 38, 20, 3);
  g.fill(0xff6644);
}

function drawJukebox(g: Graphics, ox: number, oy: number, frame: number) {
  g.rect(ox - 14, oy - 32, 28, 32);
  g.fill(0x8b4513);
  g.rect(ox - 14, oy - 2, 28, 6);
  g.fill(0x6b3410);
  g.rect(ox - 12, oy - 36, 24, 6);
  g.fill(0x9b5523);
  const colors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff, 0x8800ff];
  for (let i = 0; i < 6; i++) {
    const colorIndex = (i + Math.floor(frame / 8)) % 6;
    g.rect(ox - 10, oy - 26 + i * 3, 20, 2);
    g.fill({ color: colors[colorIndex], alpha: 0.8 });
  }
  g.rect(ox - 8, oy - 8, 16, 4);
  g.fill(0x2a1a08);
  g.rect(ox + 6, oy - 14, 3, 2);
  g.fill(0xffd700);
}

function drawPlant(g: Graphics, ox: number, oy: number) {
  g.rect(ox - 6, oy - 8, 12, 8);
  g.fill(0xb5651d);
  g.rect(ox - 8, oy - 10, 16, 3);
  g.fill(0xc77533);
  g.rect(ox - 6, oy - 2, 12, 4);
  g.fill(0x8b4513);
  g.rect(ox - 1, oy - 20, 2, 12);
  g.fill(0x228b22);
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
  g.rect(ox - 20, oy - 16, 40, 4);
  g.fill(0xdeb887);
  g.rect(ox - 20, oy - 12, 40, 14);
  g.fill(0xc9a066);
  g.rect(ox - 20, oy, 40, 4);
  g.fill(0xa0804d);
  g.rect(ox - 20, oy - 16, 40, 1);
  g.fill(0xf0d4a0);
  g.rect(ox - 2, oy - 20, 4, 4);
  g.fill(0xffd700);
  g.rect(ox - 1, oy - 22, 2, 2);
  g.fill(0xffec80);
  g.rect(ox + 8, oy - 19, 6, 4);
  g.fill(0xffffff);
  g.rect(ox + 9, oy - 18, 4, 2);
  g.fill(0xeeeeee);
}

function drawChair(g: Graphics, ox: number, oy: number) {
  g.rect(ox - 8, oy - 8, 16, 4);
  g.fill(0xcd853f);
  g.rect(ox - 8, oy - 20, 16, 12);
  g.fill(0xb8732a);
  g.rect(ox - 7, oy - 4, 3, 6);
  g.fill(0x8b6914);
  g.rect(ox + 4, oy - 4, 3, 6);
  g.fill(0x8b6914);
  g.rect(ox - 6, oy - 10, 12, 3);
  g.fill(0xdc143c);
}

function drawTable(g: Graphics, ox: number, oy: number) {
  g.rect(ox - 16, oy - 12, 32, 4);
  g.fill(0xdeb887);
  g.rect(ox - 16, oy - 12, 32, 1);
  g.fill(0xf0d4a0);
  g.rect(ox - 16, oy - 8, 32, 4);
  g.fill(0xc49a5c);
  g.rect(ox - 14, oy - 4, 3, 6);
  g.fill(0x8b6914);
  g.rect(ox + 11, oy - 4, 3, 6);
  g.fill(0x8b6914);
}

function drawDancefloorTile(g: Graphics, ox: number, oy: number, frame: number) {
  g.rect(ox - 16, oy - 4, 32, 8);
  g.fill(0x1a1a2e);
  const colors = [0xff00ff, 0x00ffff, 0xffff00, 0xff4444, 0x44ff44, 0x4444ff];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      const ci = (r * 4 + c + Math.floor(frame / 10)) % colors.length;
      g.rect(ox - 14 + c * 7, oy - 3 + r * 3, 6, 2.5);
      g.fill({ color: colors[ci], alpha: 0.6 });
    }
  }
  g.rect(ox - 16, oy - 4, 32, 1);
  g.fill({ color: 0xffffff, alpha: 0.2 });
}

function drawBulletin(g: Graphics, ox: number, oy: number) {
  g.rect(ox - 14, oy - 30, 28, 28);
  g.fill(0x4a3728);
  g.rect(ox - 16, oy - 32, 32, 2);
  g.fill(0x6b4f3a);
  g.rect(ox - 16, oy - 4, 32, 2);
  g.fill(0x6b4f3a);
  g.rect(ox - 16, oy - 32, 2, 32);
  g.fill(0x6b4f3a);
  g.rect(ox + 14, oy - 32, 2, 32);
  g.fill(0x6b4f3a);
  g.rect(ox - 10, oy - 26, 8, 10);
  g.fill(0xffffee);
  g.rect(ox + 2, oy - 24, 8, 8);
  g.fill(0xeeffee);
  g.rect(ox - 6, oy - 14, 8, 8);
  g.fill(0xeeeeff);
  g.circle(ox - 6, oy - 26, 1.5);
  g.fill(0xff4444);
  g.circle(ox + 6, oy - 24, 1.5);
  g.fill(0x4444ff);
  g.circle(ox - 2, oy - 14, 1.5);
  g.fill(0x44ff44);
}

// ---- Kitchen furniture ----

function drawStove(g: Graphics, ox: number, oy: number, frame: number) {
  // Stove body (stainless steel)
  g.rect(ox - 14, oy - 28, 28, 28);
  g.fill(0x8a8a8a);
  // Front face (darker)
  g.rect(ox - 14, oy - 2, 28, 6);
  g.fill(0x6a6a6a);
  // Stove top (dark surface)
  g.rect(ox - 14, oy - 28, 28, 6);
  g.fill(0x3a3a3a);
  // Burner rings (4 circles)
  const burnerGlow = (frame % 40 < 20) ? 0.9 : 0.7;
  g.circle(ox - 6, oy - 25, 4);
  g.fill({ color: 0xff4400, alpha: burnerGlow });
  g.circle(ox + 6, oy - 25, 4);
  g.fill({ color: 0xff6600, alpha: burnerGlow });
  // Inner burner glow
  g.circle(ox - 6, oy - 25, 2);
  g.fill({ color: 0xffaa00, alpha: 0.8 });
  g.circle(ox + 6, oy - 25, 2);
  g.fill({ color: 0xffaa00, alpha: 0.8 });
  // Oven door
  g.rect(ox - 10, oy - 18, 20, 14);
  g.fill(0x555555);
  // Oven handle
  g.rect(ox - 8, oy - 16, 16, 2);
  g.fill(0xaaaaaa);
  // Oven window
  g.rect(ox - 6, oy - 12, 12, 6);
  g.fill(0x222222);
  // Inner oven glow
  g.rect(ox - 4, oy - 10, 8, 3);
  g.fill({ color: 0xff6600, alpha: 0.3 });
  // Knobs
  g.circle(ox - 8, oy - 2, 1.5);
  g.fill(0xcccccc);
  g.circle(ox - 3, oy - 2, 1.5);
  g.fill(0xcccccc);
  g.circle(ox + 3, oy - 2, 1.5);
  g.fill(0xcccccc);
  g.circle(ox + 8, oy - 2, 1.5);
  g.fill(0xcccccc);
}

function drawPrepCounter(g: Graphics, ox: number, oy: number) {
  // Counter top (light wood)
  g.rect(ox - 18, oy - 14, 36, 4);
  g.fill(0xd2b48c);
  // Top highlight
  g.rect(ox - 18, oy - 14, 36, 1);
  g.fill(0xe8cfa8);
  // Counter body (white)
  g.rect(ox - 18, oy - 10, 36, 12);
  g.fill(0xf0f0f0);
  // Counter front face
  g.rect(ox - 18, oy, 36, 4);
  g.fill(0xdddddd);
  // Cutting board on top
  g.rect(ox - 8, oy - 17, 10, 3);
  g.fill(0xc49a5c);
  // Knife
  g.rect(ox + 4, oy - 16, 8, 1);
  g.fill(0xcccccc);
  g.rect(ox + 10, oy - 18, 3, 3);
  g.fill(0x333333);
}

function drawFridge(g: Graphics, ox: number, oy: number) {
  // Fridge body (tall silver)
  g.rect(ox - 14, oy - 48, 28, 48);
  g.fill(0xc0c0c0);
  // Front face
  g.rect(ox - 14, oy - 2, 28, 6);
  g.fill(0xa0a0a0);
  // Freezer door (top)
  g.rect(ox - 12, oy - 46, 24, 16);
  g.fill(0xb0b0b0);
  // Fridge door (bottom)
  g.rect(ox - 12, oy - 28, 24, 24);
  g.fill(0xb8b8b8);
  // Door divider line
  g.rect(ox - 12, oy - 29, 24, 1);
  g.fill(0x888888);
  // Handles
  g.rect(ox + 8, oy - 42, 2, 10);
  g.fill(0x888888);
  g.rect(ox + 8, oy - 24, 2, 16);
  g.fill(0x888888);
  // Brand badge
  g.rect(ox - 4, oy - 44, 8, 3);
  g.fill(0x4a90d9);
}

function drawSink(g: Graphics, ox: number, oy: number) {
  // Counter base
  g.rect(ox - 16, oy - 14, 32, 14);
  g.fill(0xf0f0f0);
  // Counter front face
  g.rect(ox - 16, oy - 2, 32, 4);
  g.fill(0xdddddd);
  // Sink basin (recessed)
  g.rect(ox - 10, oy - 12, 20, 8);
  g.fill(0xcccccc);
  g.rect(ox - 8, oy - 10, 16, 4);
  g.fill(0xaaaaaa);
  // Faucet
  g.rect(ox - 1, oy - 22, 2, 10);
  g.fill(0xbbbbbb);
  g.rect(ox - 4, oy - 24, 8, 3);
  g.fill(0xcccccc);
  // Water droplet hint
  g.circle(ox, oy - 8, 1);
  g.fill({ color: 0x44aaff, alpha: 0.5 });
}

function drawPotRack(g: Graphics, ox: number, oy: number) {
  // Horizontal bar (mounted on wall)
  g.rect(ox - 18, oy - 40, 36, 2);
  g.fill(0x666666);
  // Hanging hooks
  for (let i = 0; i < 5; i++) {
    const hx = ox - 14 + i * 7;
    g.rect(hx, oy - 38, 1, 4);
    g.fill(0x888888);
  }
  // Pots hanging down
  // Pot 1 (large)
  g.rect(ox - 16, oy - 34, 10, 8);
  g.fill(0x777777);
  g.rect(ox - 18, oy - 34, 14, 2);
  g.fill(0x888888);
  // Pot 2 (copper)
  g.rect(ox - 2, oy - 34, 8, 7);
  g.fill(0xb87333);
  g.rect(ox - 4, oy - 34, 12, 2);
  g.fill(0xcc8844);
  // Pan 3
  g.rect(ox + 10, oy - 32, 8, 4);
  g.fill(0x555555);
  g.rect(ox + 16, oy - 31, 6, 2);
  g.fill(0x444444);
}

// ---- Dance Floor furniture ----

function drawDJBooth(g: Graphics, ox: number, oy: number, frame: number) {
  // Elevated platform
  g.rect(ox - 20, oy - 6, 40, 8);
  g.fill(0x222233);
  g.rect(ox - 20, oy, 40, 4);
  g.fill(0x1a1a28);
  // DJ desk
  g.rect(ox - 18, oy - 24, 36, 18);
  g.fill(0x1a1a2e);
  // Front panel LEDs
  const ledColors = [0xff0066, 0x00ff66, 0x6600ff, 0xff6600];
  for (let i = 0; i < 8; i++) {
    const ci = (i + Math.floor(frame / 6)) % ledColors.length;
    g.rect(ox - 16 + i * 4, oy - 8, 3, 2);
    g.fill({ color: ledColors[ci], alpha: 0.9 });
  }
  // Turntable 1 (left)
  g.circle(ox - 8, oy - 16, 6);
  g.fill(0x111111);
  g.circle(ox - 8, oy - 16, 4);
  g.fill(0x1a1a1a);
  g.circle(ox - 8, oy - 16, 1);
  g.fill(0xffffff);
  // Turntable 2 (right)
  g.circle(ox + 8, oy - 16, 6);
  g.fill(0x111111);
  g.circle(ox + 8, oy - 16, 4);
  g.fill(0x1a1a1a);
  g.circle(ox + 8, oy - 16, 1);
  g.fill(0xffffff);
  // Mixer in middle
  g.rect(ox - 3, oy - 20, 6, 10);
  g.fill(0x2a2a3a);
  // Mixer knobs
  g.circle(ox, oy - 18, 1.5);
  g.fill(0x44ff44);
  g.circle(ox, oy - 14, 1.5);
  g.fill(0xff4444);
}

function drawSpeaker(g: Graphics, ox: number, oy: number, frame: number) {
  // Speaker tower body
  g.rect(ox - 10, oy - 44, 20, 44);
  g.fill(0x1a1a1a);
  // Front face
  g.rect(ox - 10, oy - 2, 20, 4);
  g.fill(0x111111);
  // Speaker cone (top - large)
  g.circle(ox, oy - 30, 7);
  g.fill(0x222222);
  g.circle(ox, oy - 30, 5);
  g.fill(0x333333);
  g.circle(ox, oy - 30, 2);
  g.fill(0x444444);
  // Speaker cone (bottom - small)
  g.circle(ox, oy - 14, 5);
  g.fill(0x222222);
  g.circle(ox, oy - 14, 3);
  g.fill(0x333333);
  g.circle(ox, oy - 14, 1);
  g.fill(0x444444);
  // Bass vibration effect
  const vib = Math.sin(frame * 0.3) * 0.5;
  g.circle(ox, oy - 30, 8 + vib);
  g.fill({ color: 0x6600ff, alpha: 0.08 });
  // LED strip on side
  const ledOn = frame % 20 < 10;
  g.rect(ox - 10, oy - 40, 2, 4);
  g.fill({ color: ledOn ? 0xff0000 : 0x440000, alpha: 1 });
}

function drawDiscoBall(g: Graphics, ox: number, oy: number, frame: number) {
  // String from ceiling
  g.rect(ox - 0.5, oy - 60, 1, 20);
  g.fill(0x444444);
  // Ball
  g.circle(ox, oy - 38, 8);
  g.fill(0xcccccc);
  // Mirror facets
  const facetColors = [0xffffff, 0xdddddd, 0xeeeeee, 0xbbbbbb];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + frame * 0.02;
    const fx = ox + Math.cos(angle) * 5;
    const fy = oy - 38 + Math.sin(angle) * 5;
    g.rect(fx - 1.5, fy - 1.5, 3, 3);
    g.fill(facetColors[i % facetColors.length]);
  }
  // Highlight
  g.circle(ox - 2, oy - 40, 2);
  g.fill({ color: 0xffffff, alpha: 0.6 });

  // Radiating light beams
  const beamColors = [0xff00ff, 0x00ffff, 0xffff00, 0xff4444, 0x44ff44, 0x4444ff, 0xff8800, 0xaa00ff];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + frame * 0.01;
    const endX = ox + Math.cos(angle) * 80;
    const endY = oy - 38 + Math.sin(angle) * 60;
    g.moveTo(ox, oy - 38);
    g.lineTo(endX, endY);
    g.stroke({ width: 1, color: beamColors[i], alpha: 0.15 });
  }
}

function drawBarCounter(g: Graphics, ox: number, oy: number) {
  // Bar top (dark polished wood)
  g.rect(ox - 18, oy - 16, 36, 4);
  g.fill(0x2a1a08);
  // Top highlight
  g.rect(ox - 18, oy - 16, 36, 1);
  g.fill(0x3a2a18);
  // Bar body
  g.rect(ox - 18, oy - 12, 36, 14);
  g.fill(0x1a1020);
  // Bar front face
  g.rect(ox - 18, oy, 36, 4);
  g.fill(0x120a18);
  // Bar top trim
  g.rect(ox - 18, oy - 13, 36, 1);
  g.fill(0x444444);
  // Bottles on shelf behind (visible above bar)
  g.rect(ox - 10, oy - 22, 4, 6);
  g.fill({ color: 0x44ff44, alpha: 0.6 });
  g.rect(ox - 4, oy - 24, 4, 8);
  g.fill({ color: 0xff4444, alpha: 0.6 });
  g.rect(ox + 2, oy - 20, 4, 4);
  g.fill({ color: 0xffaa00, alpha: 0.6 });
  g.rect(ox + 8, oy - 22, 4, 6);
  g.fill({ color: 0x4444ff, alpha: 0.6 });
}

function drawBarStool(g: Graphics, ox: number, oy: number) {
  // Seat (round, dark)
  g.rect(ox - 6, oy - 12, 12, 3);
  g.fill(0x333344);
  // Seat cushion
  g.rect(ox - 5, oy - 14, 10, 3);
  g.fill(0x444455);
  // Pedestal
  g.rect(ox - 1, oy - 9, 2, 10);
  g.fill(0x888888);
  // Base
  g.rect(ox - 5, oy - 1, 10, 3);
  g.fill(0x666666);
}

// ---- Store furniture ----

function drawShelf(g: Graphics, ox: number, oy: number) {
  // Shelf frame (tall)
  g.rect(ox - 14, oy - 42, 28, 42);
  g.fill(0xd4c8a0);
  // Front face
  g.rect(ox - 14, oy - 2, 28, 4);
  g.fill(0xbcb090);

  // Shelf levels (4 levels)
  const shelfColors = [0x008888, 0xcc3333, 0xccaa00, 0x33aa33];
  for (let level = 0; level < 4; level++) {
    const ly = oy - 38 + level * 10;
    // Shelf board
    g.rect(ox - 12, ly + 6, 24, 2);
    g.fill(0xb0a480);
    // Products on shelf (3 items per level)
    for (let p = 0; p < 3; p++) {
      g.rect(ox - 10 + p * 8, ly, 6, 6);
      g.fill(shelfColors[(level + p) % shelfColors.length]);
    }
  }

  // Price tag (small yellow sign on top)
  g.rect(ox - 6, oy - 46, 12, 5);
  g.fill(0xffee44);
  g.rect(ox - 3, oy - 45, 6, 3);
  g.fill(0xcc9900);
}

function drawCheckout(g: Graphics, ox: number, oy: number) {
  // Counter body (wide)
  g.rect(ox - 20, oy - 14, 40, 14);
  g.fill(0x8b6914);
  // Counter top
  g.rect(ox - 20, oy - 16, 40, 4);
  g.fill(0xa0804d);
  // Counter front
  g.rect(ox - 20, oy - 2, 40, 4);
  g.fill(0x6b4f0a);
  // Cash register
  g.rect(ox - 8, oy - 26, 16, 10);
  g.fill(0x333333);
  // Register screen
  g.rect(ox - 6, oy - 24, 8, 4);
  g.fill(0x00aa44);
  // Register buttons
  g.rect(ox + 3, oy - 24, 4, 2);
  g.fill(0xaaaaaa);
  g.rect(ox + 3, oy - 21, 4, 2);
  g.fill(0xaaaaaa);
  // Drawer
  g.rect(ox - 6, oy - 18, 12, 3);
  g.fill(0x444444);
  // Conveyor belt area
  g.rect(ox - 18, oy - 14, 8, 2);
  g.fill(0x555555);
}

function drawDisplayCase(g: Graphics, ox: number, oy: number) {
  // Outer frame (darker)
  g.rect(ox - 14, oy - 36, 28, 36);
  g.fill(0x888888);
  // Inner glass area (lighter, transparent look)
  g.rect(ox - 12, oy - 34, 24, 30);
  g.fill(0xbbddee);
  // Glass highlight
  g.rect(ox - 10, oy - 32, 2, 26);
  g.fill({ color: 0xffffff, alpha: 0.3 });
  // Items inside (drinks/bottles)
  g.rect(ox - 8, oy - 28, 4, 8);
  g.fill(0x44aaff);
  g.rect(ox - 2, oy - 26, 4, 6);
  g.fill(0xff4444);
  g.rect(ox + 4, oy - 28, 4, 8);
  g.fill(0x44ff44);
  g.rect(ox - 6, oy - 16, 4, 6);
  g.fill(0xffaa00);
  g.rect(ox + 0, oy - 18, 4, 8);
  g.fill(0xaa44ff);
  g.rect(ox + 6, oy - 16, 4, 6);
  g.fill(0xff8844);
  // Shelves inside
  g.rect(ox - 10, oy - 20, 20, 1);
  g.fill(0x999999);
  // Front face
  g.rect(ox - 14, oy - 2, 28, 4);
  g.fill(0x777777);
}

function drawEntranceMat(g: Graphics, ox: number, oy: number) {
  // Dark welcome mat
  g.rect(ox - 16, oy - 4, 32, 6);
  g.fill(0x333333);
  // Mat border
  g.rect(ox - 16, oy - 4, 32, 1);
  g.fill(0x555555);
  g.rect(ox - 16, oy + 1, 32, 1);
  g.fill(0x555555);
  // "WELCOME" text (represented as light stripe)
  g.rect(ox - 10, oy - 2, 20, 2);
  g.fill(0x666666);
}

function drawBasketPile(g: Graphics, ox: number, oy: number) {
  // Bottom basket (red)
  g.rect(ox - 10, oy - 8, 20, 8);
  g.fill(0xcc3333);
  g.rect(ox - 8, oy - 6, 16, 4);
  g.fill(0xdd4444);
  // Middle basket (blue)
  g.rect(ox - 8, oy - 14, 16, 6);
  g.fill(0x3344cc);
  g.rect(ox - 6, oy - 12, 12, 3);
  g.fill(0x4455dd);
  // Top basket (green)
  g.rect(ox - 6, oy - 18, 12, 4);
  g.fill(0x33aa33);
  g.rect(ox - 4, oy - 17, 8, 2);
  g.fill(0x44bb44);
  // Handles sticking out
  g.rect(ox - 12, oy - 6, 3, 2);
  g.fill(0xaa2222);
  g.rect(ox + 9, oy - 6, 3, 2);
  g.fill(0xaa2222);
}


// ---- Room-level drawing functions ----

export function drawRoomFloor(
  g: Graphics,
  room: RoomDef,
  gridW: number,
  gridH: number,
  tileW: number,
  tileH: number,
  tileToScreenFn: (x: number, y: number) => { sx: number; sy: number },
  tick: number
) {
  for (let gx = 0; gx < gridW; gx++) {
    for (let gy = 0; gy < gridH; gy++) {
      const { sx, sy } = tileToScreenFn(gx, gy);

      if (room.floorStyle === "disco") {
        // Disco floor: cycling colors with phase offset per tile
        const discoColors = [0x8800aa, 0x2244cc, 0x00aaaa, 0xcc2288];
        const phase = (gx + gy) % discoColors.length;
        const cycleIndex = (phase + Math.floor(tick / 30)) % discoColors.length;
        const color = discoColors[cycleIndex];

        g.poly([
          { x: sx, y: sy },
          { x: sx + tileW / 2, y: sy + tileH / 2 },
          { x: sx, y: sy + tileH },
          { x: sx - tileW / 2, y: sy + tileH / 2 },
        ]);
        g.fill(color);
        g.stroke({ width: 1, color: 0x111122 });

        // Subtle glow highlight in center of each tile
        g.poly([
          { x: sx, y: sy + 4 },
          { x: sx + tileW / 4, y: sy + tileH / 2 },
          { x: sx, y: sy + tileH - 4 },
          { x: sx - tileW / 4, y: sy + tileH / 2 },
        ]);
        g.fill({ color: 0xffffff, alpha: 0.08 });
      } else {
        // Standard checker/clean/tile
        const color = (gx + gy) % 2 === 0 ? room.floorColorA : room.floorColorB;
        const strokeColor = darkenNum(room.floorColorB, 0.2);

        g.poly([
          { x: sx, y: sy },
          { x: sx + tileW / 2, y: sy + tileH / 2 },
          { x: sx, y: sy + tileH },
          { x: sx - tileW / 2, y: sy + tileH / 2 },
        ]);
        g.fill(color);
        g.stroke({ width: 1, color: strokeColor });
      }
    }
  }
}

export function drawRoomWalls(
  g: Graphics,
  room: RoomDef,
  gridW: number,
  gridH: number,
  tileW: number,
  tileH: number,
  tileToScreenFn: (x: number, y: number) => { sx: number; sy: number }
) {
  const wallHeight = 80;
  const leftWallColor = room.wallColorLeft;
  const rightWallColor = room.wallColorRight;
  const leftWallDark = darkenNum(leftWallColor, 0.15);
  const rightWallDark = darkenNum(rightWallColor, 0.15);

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

    g.poly([topLeft, topRight, bottomRight, bottomLeft]);
    g.fill(rightWallColor);
    g.stroke({ width: 0.5, color: rightWallDark });

    if (y % 2 === 0) {
      const midX = (topLeft.x + topRight.x) / 2;
      const midTopY = (topLeft.y + topRight.y) / 2;
      const midBotY = (bottomLeft.y + bottomRight.y) / 2;
      g.rect(midX - 1, midTopY, 2, midBotY - midTopY);
      g.fill({ color: 0xffffff, alpha: 0.06 });
    }
  }

  // Corner piece
  const { sx: csx, sy: csy } = tileToScreenFn(0, 0);
  g.rect(csx - tileW / 2 - 1, csy + tileH / 2 - wallHeight, 2, wallHeight);
  g.fill(darkenNum(leftWallColor, 0.3));

  // Top border strip
  const ltStart = tileToScreenFn(0, 0);
  const ltEnd = tileToScreenFn(gridW - 1, 0);
  g.rect(ltStart.sx - tileW / 2, ltStart.sy + tileH / 2 - wallHeight - 3, ltEnd.sx - ltStart.sx + tileW / 2, 3);
  g.fill(room.wallColorTop);

  const rtStart = tileToScreenFn(0, 0);
  g.rect(rtStart.sx - 2, rtStart.sy - wallHeight - 3, 4, 3);
  g.fill(room.wallColorTop);
}


// ---- Legacy exports (keep backward compat) ----

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

  for (let x = 0; x < gridW; x++) {
    const { sx, sy } = tileToScreenFn(x, 0);
    const topLeft = { x: sx - tileW / 2, y: sy + tileH / 2 - wallHeight };
    const topRight = { x: sx, y: sy - wallHeight };
    const bottomRight = { x: sx, y: sy };
    const bottomLeft = { x: sx - tileW / 2, y: sy + tileH / 2 };

    g.poly([topLeft, topRight, bottomRight, bottomLeft]);
    g.fill(leftWallColor);
    g.stroke({ width: 0.5, color: leftWallDark });

    if (x % 2 === 0) {
      const midX = (topLeft.x + topRight.x) / 2;
      const midTopY = (topLeft.y + topRight.y) / 2;
      const midBotY = (bottomLeft.y + bottomRight.y) / 2;
      g.rect(midX - 1, midTopY, 2, midBotY - midTopY);
      g.fill({ color: 0xffffff, alpha: 0.06 });
    }
  }

  for (let y = 0; y < gridH; y++) {
    const { sx, sy } = tileToScreenFn(0, y);
    const topLeft = { x: sx, y: sy - wallHeight };
    const topRight = { x: sx + tileW / 2, y: sy + tileH / 2 - wallHeight };
    const bottomRight = { x: sx + tileW / 2, y: sy + tileH / 2 };
    const bottomLeft = { x: sx, y: sy };

    g.poly([topLeft, topRight, bottomRight, bottomLeft]);
    g.fill(rightWallColor);
    g.stroke({ width: 0.5, color: rightWallDark });

    if (y % 2 === 0) {
      const midX = (topLeft.x + topRight.x) / 2;
      const midTopY = (topLeft.y + topRight.y) / 2;
      const midBotY = (bottomLeft.y + bottomRight.y) / 2;
      g.rect(midX - 1, midTopY, 2, midBotY - midTopY);
      g.fill({ color: 0xffffff, alpha: 0.06 });
    }
  }

  const { sx: csx, sy: csy } = tileToScreenFn(0, 0);
  g.rect(csx - tileW / 2 - 1, csy + tileH / 2 - wallHeight, 2, wallHeight);
  g.fill(0x2a4a78);

  const ltStart = tileToScreenFn(0, 0);
  const ltEnd = tileToScreenFn(gridW - 1, 0);
  g.rect(ltStart.sx - tileW / 2, ltStart.sy + tileH / 2 - wallHeight - 3, ltEnd.sx - ltStart.sx + tileW / 2, 3);
  g.fill(0x5aa0e9);

  const rtStart = tileToScreenFn(0, 0);
  g.rect(rtStart.sx - 2, rtStart.sy - wallHeight - 3, 4, 3);
  g.fill(0x5aa0e9);
}
