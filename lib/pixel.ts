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
  oy: number, // origin y (screen)
  scale: number = 1.0
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
    // Bar
    case "long_bar": drawLongBar(g, ox, oy); break;
    case "bottle_shelf": drawBottleShelf(g, ox, oy); break;
    case "tip_jar": drawTipJar(g, ox, oy); break;
    case "chalkboard": drawChalkboard(g, ox, oy); break;
    case "cash_register": drawCashRegister(g, ox, oy); break;
    // Studio
    case "easel": drawEasel(g, ox, oy, frameCount); break;
    case "palette": drawPalette(g, ox, oy); break;
    case "sculpture": drawSculpture(g, ox, oy); break;
    case "paint_table": drawPaintTable(g, ox, oy); break;
    case "portfolio": drawPortfolio(g, ox, oy); break;
    // Bank
    case "teller": drawTeller(g, ox, oy); break;
    case "vault": drawVault(g, ox, oy, frameCount); break;
    case "security_desk": drawSecurityDesk(g, ox, oy); break;
    case "coin_stack": drawCoinStack(g, ox, oy); break;
    case "rope_barrier": drawRopeBarrier(g, ox, oy); break;
    case "safe_boxes": drawSafeBoxes(g, ox, oy); break;
    // Gym
    case "dumbbell_rack": drawDumbbellRack(g, ox, oy); break;
    case "pullup_bar": drawPullupBar(g, ox, oy); break;
    case "bench_press": drawBenchPress(g, ox, oy); break;
    case "mirror_wall": drawMirrorWall(g, ox, oy); break;
    case "water_cooler": drawWaterCooler(g, ox, oy); break;
    case "poster": drawPoster(g, ox, oy); break;
    // Library
    case "bookshelf": drawBookshelf(g, ox, oy); break;
    case "reading_desk": drawReadingDesk(g, ox, oy); break;
    case "armchair": drawArmchair(g, ox, oy); break;
    case "globe": drawGlobe(g, ox, oy, frameCount); break;
    case "fireplace": drawFireplace(g, ox, oy, frameCount); break;
    // Casino
    case "roulette_table": drawRouletteTable(g, ox, oy, frameCount); break;
    case "slot_machine": drawSlotMachine(g, ox, oy, frameCount); break;
    case "blackjack_table": drawBlackjackTable(g, ox, oy); break;
    case "chip_stack": drawChipStack(g, ox, oy); break;
    case "neon_sign": drawNeonSign(g, ox, oy, frameCount); break;
    // Theater
    case "stage_platform": drawStagePlatform(g, ox, oy); break;
    case "footlights": drawFootlights(g, ox, oy, frameCount); break;
    case "curtain": drawCurtain(g, ox, oy); break;
    case "spotlight": drawSpotlight(g, ox, oy, frameCount); break;
    case "audience_seat": drawAudienceSeat(g, ox, oy); break;
    case "microphone": drawMicrophone(g, ox, oy); break;
    // Rooftop
    case "lounge_chair": drawLoungeChair(g, ox, oy); break;
    case "string_lights": drawStringLights(g, ox, oy, frameCount); break;
    case "bar_cart": drawBarCart(g, ox, oy); break;
    case "cactus_pot": drawCactusPot(g, ox, oy); break;
    case "city_skyline": drawCitySkyline(g, ox, oy); break;
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


// ---- Bar furniture ----

function drawLongBar(g: Graphics, ox: number, oy: number) {
  // Bar top (dark polished mahogany)
  g.rect(ox - 20, oy - 16, 40, 4);
  g.fill(0x3d1c02);
  g.rect(ox - 20, oy - 16, 40, 1);
  g.fill(0x5a2e0a);
  // Bar body
  g.rect(ox - 20, oy - 12, 40, 14);
  g.fill(0x2e1502);
  // Front face
  g.rect(ox - 20, oy, 40, 4);
  g.fill(0x1e0d01);
  // Brass rail
  g.rect(ox - 18, oy - 1, 36, 1);
  g.fill(0xcc9933);
  // Napkin holder
  g.rect(ox + 8, oy - 19, 6, 3);
  g.fill(0xeeeeee);
}

function drawBottleShelf(g: Graphics, ox: number, oy: number) {
  // Shelf back
  g.rect(ox - 14, oy - 46, 28, 46);
  g.fill(0x2e1502);
  // Shelves
  for (let i = 0; i < 3; i++) {
    const sy = oy - 42 + i * 14;
    g.rect(ox - 12, sy + 10, 24, 2);
    g.fill(0x3d1c02);
    // Bottles
    const colors = [0x44ff44, 0xff4444, 0xffaa00, 0x4444ff, 0xaa44ff];
    for (let j = 0; j < 4; j++) {
      g.rect(ox - 10 + j * 6, sy, 4, 10);
      g.fill({ color: colors[(i * 4 + j) % colors.length], alpha: 0.7 });
      g.rect(ox - 9 + j * 6, sy - 2, 2, 3);
      g.fill({ color: colors[(i * 4 + j) % colors.length], alpha: 0.5 });
    }
  }
}

function drawTipJar(g: Graphics, ox: number, oy: number) {
  // Jar body (glass)
  g.rect(ox - 5, oy - 16, 10, 14);
  g.fill({ color: 0xbbddee, alpha: 0.6 });
  // Jar rim
  g.rect(ox - 6, oy - 17, 12, 2);
  g.fill(0xcccccc);
  // Coins inside
  g.rect(ox - 3, oy - 6, 6, 4);
  g.fill(0xffd700);
  g.rect(ox - 2, oy - 10, 4, 3);
  g.fill(0xffec80);
  // Dollar bill sticking out
  g.rect(ox - 1, oy - 20, 3, 5);
  g.fill(0x22aa44);
  // Label
  g.rect(ox - 4, oy - 12, 8, 3);
  g.fill(0xffffee);
}

function drawChalkboard(g: Graphics, ox: number, oy: number) {
  // Frame
  g.rect(ox - 16, oy - 40, 32, 38);
  g.fill(0x4a3728);
  // Board surface
  g.rect(ox - 14, oy - 38, 28, 34);
  g.fill(0x2a4a2a);
  // Chalk text lines
  g.rect(ox - 10, oy - 34, 16, 1);
  g.fill({ color: 0xffffff, alpha: 0.8 });
  g.rect(ox - 10, oy - 30, 20, 1);
  g.fill({ color: 0xffffff, alpha: 0.7 });
  g.rect(ox - 10, oy - 26, 12, 1);
  g.fill({ color: 0xffff88, alpha: 0.7 });
  g.rect(ox - 10, oy - 22, 18, 1);
  g.fill({ color: 0xffffff, alpha: 0.6 });
  g.rect(ox - 10, oy - 18, 14, 1);
  g.fill({ color: 0x88ffff, alpha: 0.7 });
  // Chalk tray
  g.rect(ox - 14, oy - 4, 28, 3);
  g.fill(0x5a4738);
  // Chalk pieces
  g.rect(ox - 10, oy - 5, 3, 2);
  g.fill(0xffffff);
  g.rect(ox - 5, oy - 5, 3, 2);
  g.fill(0xffff88);
}

function drawCashRegister(g: Graphics, ox: number, oy: number) {
  // Register body
  g.rect(ox - 10, oy - 24, 20, 20);
  g.fill(0xcc9933);
  // Screen
  g.rect(ox - 7, oy - 22, 10, 6);
  g.fill(0x003300);
  g.rect(ox - 6, oy - 21, 8, 4);
  g.fill(0x00aa44);
  // Keys
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      g.rect(ox - 6 + c * 4, oy - 14 + r * 4, 3, 3);
      g.fill(0xdddddd);
    }
  }
  // Drawer
  g.rect(ox - 8, oy - 6, 16, 3);
  g.fill(0xbb8822);
  // Front
  g.rect(ox - 10, oy - 2, 20, 4);
  g.fill(0xaa7722);
}

// ---- Studio furniture ----

function drawEasel(g: Graphics, ox: number, oy: number, frame: number) {
  // A-frame legs
  g.rect(ox - 10, oy - 6, 3, 24);
  g.fill(0x8b6914);
  g.rect(ox + 7, oy - 6, 3, 24);
  g.fill(0x8b6914);
  // Back support leg
  g.rect(ox - 1, oy + 2, 2, 16);
  g.fill(0x7a5a10);
  // Canvas
  const canvasColors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181];
  const color = canvasColors[Math.floor(frame / 120) % canvasColors.length];
  g.rect(ox - 8, oy - 34, 16, 28);
  g.fill(0xfff8f0);
  // Painting on canvas
  g.rect(ox - 6, oy - 32, 12, 24);
  g.fill(color);
  // Paint splotches
  g.circle(ox - 2, oy - 24, 3);
  g.fill({ color: 0xffffff, alpha: 0.5 });
  g.circle(ox + 3, oy - 18, 4);
  g.fill({ color: darkenNum(color, 0.3), alpha: 0.6 });
  // Ledge
  g.rect(ox - 9, oy - 8, 18, 2);
  g.fill(0x8b6914);
}

function drawPalette(g: Graphics, ox: number, oy: number) {
  // Oval palette shape (simplified as rect)
  g.rect(ox - 12, oy - 8, 24, 10);
  g.fill(0xd2b48c);
  g.rect(ox - 10, oy - 6, 20, 6);
  g.fill(0xc9a066);
  // Paint dots
  const colors = [0xff0000, 0x0000ff, 0xffff00, 0x00ff00, 0xff8800, 0xffffff];
  for (let i = 0; i < 6; i++) {
    g.circle(ox - 8 + i * 3.5, oy - 3, 2);
    g.fill(colors[i]);
  }
  // Thumb hole
  g.circle(ox + 6, oy - 2, 2.5);
  g.fill(0xb8a060);
}

function drawSculpture(g: Graphics, ox: number, oy: number) {
  // Pedestal
  g.rect(ox - 10, oy - 10, 20, 10);
  g.fill(0xcccccc);
  g.rect(ox - 12, oy - 12, 24, 3);
  g.fill(0xdddddd);
  g.rect(ox - 10, oy - 2, 20, 4);
  g.fill(0xbbbbbb);
  // Abstract sculpture (stacked geometric shapes)
  g.rect(ox - 6, oy - 28, 12, 16);
  g.fill(0xe0e0e0);
  g.circle(ox, oy - 32, 6);
  g.fill(0xd0d0d0);
  // Highlight
  g.rect(ox - 4, oy - 26, 2, 10);
  g.fill({ color: 0xffffff, alpha: 0.3 });
}

function drawPaintTable(g: Graphics, ox: number, oy: number) {
  // Table
  g.rect(ox - 16, oy - 12, 32, 4);
  g.fill(0xd2b48c);
  g.rect(ox - 16, oy - 8, 32, 10);
  g.fill(0xc9a066);
  // Paint tubes
  g.rect(ox - 10, oy - 16, 4, 4);
  g.fill(0xff4444);
  g.rect(ox - 4, oy - 16, 4, 4);
  g.fill(0x4444ff);
  g.rect(ox + 2, oy - 16, 4, 4);
  g.fill(0xffff00);
  g.rect(ox + 8, oy - 15, 4, 3);
  g.fill(0x00aa00);
  // Brush in water cup
  g.rect(ox - 12, oy - 20, 4, 8);
  g.fill({ color: 0x88bbdd, alpha: 0.6 });
  g.rect(ox - 11, oy - 24, 1, 6);
  g.fill(0x8b6914);
}

function drawPortfolio(g: Graphics, ox: number, oy: number) {
  // Stack of canvases/papers
  for (let i = 0; i < 4; i++) {
    g.rect(ox - 10 + i, oy - 6 - i * 3, 18, 3);
    g.fill(i % 2 === 0 ? 0xfff8f0 : 0xf0e8d0);
  }
  // Top canvas with art
  g.rect(ox - 8, oy - 18, 14, 10);
  g.fill(0xfff8f0);
  g.rect(ox - 6, oy - 16, 10, 6);
  g.fill(0x4ecdc4);
  // Label
  g.rect(ox - 4, oy - 4, 8, 2);
  g.fill(0xaaaaaa);
}

// ---- Bank furniture ----

function drawTeller(g: Graphics, ox: number, oy: number) {
  // Counter base
  g.rect(ox - 18, oy - 14, 36, 14);
  g.fill(0x8b6914);
  g.rect(ox - 18, oy - 16, 36, 4);
  g.fill(0xa0804d);
  g.rect(ox - 18, oy - 2, 36, 4);
  g.fill(0x6b4f0a);
  // Glass partition
  g.rect(ox - 14, oy - 40, 28, 24);
  g.fill({ color: 0xbbddee, alpha: 0.4 });
  // Glass frame
  g.rect(ox - 14, oy - 40, 28, 2);
  g.fill(0x888888);
  g.rect(ox - 14, oy - 18, 28, 2);
  g.fill(0x888888);
  g.rect(ox - 14, oy - 40, 2, 24);
  g.fill(0x888888);
  g.rect(ox + 12, oy - 40, 2, 24);
  g.fill(0x888888);
  // Speaking hole
  g.circle(ox, oy - 28, 4);
  g.fill({ color: 0x888888, alpha: 0.5 });
  // Number display
  g.rect(ox - 6, oy - 44, 12, 4);
  g.fill(0x111111);
  g.rect(ox - 4, oy - 43, 8, 2);
  g.fill(0x00ff00);
}

function drawVault(g: Graphics, ox: number, oy: number, frame: number) {
  // Vault door frame
  g.rect(ox - 18, oy - 44, 36, 44);
  g.fill(0x555555);
  // Door
  g.rect(ox - 14, oy - 40, 28, 36);
  g.fill(0x888888);
  // Circular hatch detail
  g.circle(ox, oy - 22, 12);
  g.fill(0x999999);
  g.circle(ox, oy - 22, 10);
  g.fill(0x777777);
  // Spokes
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI + frame * 0.005;
    const x1 = ox + Math.cos(angle) * 8;
    const y1 = oy - 22 + Math.sin(angle) * 8;
    const x2 = ox - Math.cos(angle) * 8;
    const y2 = oy - 22 - Math.sin(angle) * 8;
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.stroke({ width: 2, color: 0xaaaaaa });
  }
  // Center bolt
  g.circle(ox, oy - 22, 3);
  g.fill(0xcccccc);
  // Handle
  g.rect(ox + 10, oy - 26, 4, 8);
  g.fill(0xbbbbbb);
  // Lock indicator
  g.circle(ox - 10, oy - 34, 2);
  g.fill(frame % 120 < 60 ? 0xff0000 : 0x00ff00);
}

function drawSecurityDesk(g: Graphics, ox: number, oy: number) {
  // Desk
  g.rect(ox - 16, oy - 14, 32, 14);
  g.fill(0x333333);
  g.rect(ox - 16, oy - 16, 32, 4);
  g.fill(0x444444);
  // Monitors
  g.rect(ox - 10, oy - 28, 8, 10);
  g.fill(0x111111);
  g.rect(ox - 8, oy - 26, 4, 6);
  g.fill(0x334455);
  g.rect(ox + 2, oy - 28, 8, 10);
  g.fill(0x111111);
  g.rect(ox + 4, oy - 26, 4, 6);
  g.fill(0x334455);
  // Keyboard
  g.rect(ox - 6, oy - 16, 12, 2);
  g.fill(0x222222);
}

function drawCoinStack(g: Graphics, ox: number, oy: number) {
  // Stacks of coins
  for (let s = 0; s < 3; s++) {
    const sx = ox - 8 + s * 7;
    const height = 4 + s * 2;
    for (let c = 0; c < height; c++) {
      g.circle(sx, oy - 2 - c * 2.5, 4);
      g.fill(c % 2 === 0 ? 0xffd700 : 0xffec80);
    }
    g.circle(sx, oy - 2 - height * 2.5, 4);
    g.fill(0xffd700);
    // Coin edge highlight
    g.circle(sx - 1, oy - 2 - height * 2.5, 1);
    g.fill({ color: 0xffffff, alpha: 0.4 });
  }
}

function drawRopeBarrier(g: Graphics, ox: number, oy: number) {
  // Posts
  g.rect(ox - 12, oy - 24, 3, 24);
  g.fill(0xccaa33);
  g.rect(ox + 9, oy - 24, 3, 24);
  g.fill(0xccaa33);
  // Post tops
  g.circle(ox - 10.5, oy - 25, 3);
  g.fill(0xddbb44);
  g.circle(ox + 10.5, oy - 25, 3);
  g.fill(0xddbb44);
  // Rope (velvet)
  g.rect(ox - 10, oy - 16, 20, 2);
  g.fill(0xcc2222);
  // Rope sag
  g.rect(ox - 6, oy - 14, 12, 1);
  g.fill(0xcc2222);
}

function drawSafeBoxes(g: Graphics, ox: number, oy: number) {
  // Wall of boxes
  g.rect(ox - 14, oy - 44, 28, 44);
  g.fill(0x666666);
  // Grid of small boxes
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 3; c++) {
      g.rect(ox - 12 + c * 8, oy - 42 + r * 8, 7, 7);
      g.fill(0x888888);
      // Keyhole
      g.circle(ox - 8 + c * 8, oy - 38 + r * 8, 1);
      g.fill(0x444444);
    }
  }
  // Front face
  g.rect(ox - 14, oy - 2, 28, 4);
  g.fill(0x555555);
}

// ---- Gym furniture ----

function drawDumbbellRack(g: Graphics, ox: number, oy: number) {
  // Rack frame
  g.rect(ox - 16, oy - 30, 32, 30);
  g.fill(0x333333);
  g.rect(ox - 16, oy - 2, 32, 4);
  g.fill(0x222222);
  // Shelves
  for (let i = 0; i < 3; i++) {
    const sy = oy - 28 + i * 10;
    g.rect(ox - 14, sy + 6, 28, 2);
    g.fill(0x444444);
    // Dumbbells
    for (let d = 0; d < 3; d++) {
      const dx = ox - 10 + d * 9;
      // Bar
      g.rect(dx - 1, sy + 2, 8, 2);
      g.fill(0x888888);
      // Weights
      g.rect(dx - 2, sy, 3, 6);
      g.fill(i === 0 ? 0x222222 : i === 1 ? 0x444488 : 0x884444);
      g.rect(dx + 5, sy, 3, 6);
      g.fill(i === 0 ? 0x222222 : i === 1 ? 0x444488 : 0x884444);
    }
  }
}

function drawPullupBar(g: Graphics, ox: number, oy: number) {
  // Vertical posts
  g.rect(ox - 14, oy - 44, 3, 44);
  g.fill(0x555555);
  g.rect(ox + 11, oy - 44, 3, 44);
  g.fill(0x555555);
  // Horizontal bar
  g.rect(ox - 14, oy - 46, 28, 3);
  g.fill(0x888888);
  // Grip wraps
  g.rect(ox - 10, oy - 46, 4, 3);
  g.fill(0x333333);
  g.rect(ox + 6, oy - 46, 4, 3);
  g.fill(0x333333);
  // Base
  g.rect(ox - 16, oy - 2, 32, 4);
  g.fill(0x444444);
}

function drawBenchPress(g: Graphics, ox: number, oy: number) {
  // Bench
  g.rect(ox - 14, oy - 8, 28, 4);
  g.fill(0x333333);
  g.rect(ox - 12, oy - 10, 24, 3);
  g.fill(0x222222);
  // Bench legs
  g.rect(ox - 12, oy - 4, 3, 6);
  g.fill(0x444444);
  g.rect(ox + 9, oy - 4, 3, 6);
  g.fill(0x444444);
  // Barbell rack posts
  g.rect(ox - 16, oy - 30, 3, 22);
  g.fill(0x555555);
  g.rect(ox + 13, oy - 30, 3, 22);
  g.fill(0x555555);
  // Barbell
  g.rect(ox - 14, oy - 28, 28, 2);
  g.fill(0x888888);
  // Weight plates
  g.rect(ox - 18, oy - 32, 4, 10);
  g.fill(0x222222);
  g.rect(ox + 14, oy - 32, 4, 10);
  g.fill(0x222222);
  // Pad
  g.rect(ox - 8, oy - 11, 16, 3);
  g.fill(0x882222);
}

function drawMirrorWall(g: Graphics, ox: number, oy: number) {
  // Wall section
  g.rect(ox - 16, oy - 44, 32, 44);
  g.fill(0x505050);
  // Mirror (reflective)
  g.rect(ox - 14, oy - 42, 28, 38);
  g.fill(0xaabbcc);
  // Reflection highlight
  g.rect(ox - 12, oy - 40, 4, 34);
  g.fill({ color: 0xffffff, alpha: 0.2 });
  g.rect(ox + 4, oy - 40, 2, 34);
  g.fill({ color: 0xffffff, alpha: 0.1 });
  // Frame
  g.rect(ox - 14, oy - 42, 28, 1);
  g.fill(0x888888);
  g.rect(ox - 14, oy - 5, 28, 1);
  g.fill(0x888888);
}

function drawWaterCooler(g: Graphics, ox: number, oy: number) {
  // Base
  g.rect(ox - 6, oy - 8, 12, 8);
  g.fill(0x888888);
  // Bottle (blue water)
  g.rect(ox - 5, oy - 30, 10, 22);
  g.fill({ color: 0x4488ff, alpha: 0.5 });
  // Bottle top
  g.rect(ox - 3, oy - 34, 6, 5);
  g.fill({ color: 0x4488ff, alpha: 0.4 });
  // Spout
  g.rect(ox + 4, oy - 10, 4, 3);
  g.fill(0xcccccc);
  // Cup holder
  g.rect(ox + 6, oy - 8, 4, 4);
  g.fill(0xdddddd);
  // Front face
  g.rect(ox - 6, oy - 2, 12, 4);
  g.fill(0x777777);
}

function drawPoster(g: Graphics, ox: number, oy: number) {
  // Poster background
  g.rect(ox - 12, oy - 36, 24, 32);
  g.fill(0x222222);
  // Poster content
  g.rect(ox - 10, oy - 34, 20, 28);
  g.fill(0xff4444);
  // Text lines
  g.rect(ox - 6, oy - 30, 12, 2);
  g.fill(0xffffff);
  g.rect(ox - 8, oy - 26, 16, 1);
  g.fill(0xffffff);
  g.rect(ox - 4, oy - 22, 8, 1);
  g.fill(0xffff00);
  // Dumbbell icon
  g.rect(ox - 6, oy - 18, 12, 2);
  g.fill(0xffffff);
  g.rect(ox - 8, oy - 20, 3, 6);
  g.fill(0xffffff);
  g.rect(ox + 5, oy - 20, 3, 6);
  g.fill(0xffffff);
  // Thumbtack
  g.circle(ox, oy - 36, 2);
  g.fill(0xff4444);
}

// ---- Library furniture ----

function drawBookshelf(g: Graphics, ox: number, oy: number) {
  // Tall wooden shelf
  g.rect(ox - 14, oy - 50, 28, 50);
  g.fill(0x5c3317);
  g.rect(ox - 14, oy - 2, 28, 4);
  g.fill(0x3d2010);
  // Shelves
  for (let i = 0; i < 4; i++) {
    g.rect(ox - 12, oy - 46 + i * 12, 24, 2);
    g.fill(0x6b4020);
  }
  // Book spines (colored horizontal stripes)
  const bookColors = [0xcc3333, 0x3366cc, 0x339933, 0xcc9933, 0x9933cc, 0xcc6633];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const c = bookColors[(i * 4 + j) % bookColors.length];
      g.rect(ox - 10 + j * 6, oy - 44 + i * 12, 5, 9);
      g.fill(c);
    }
  }
}

function drawReadingDesk(g: Graphics, ox: number, oy: number) {
  // Desk surface
  g.rect(ox - 18, oy - 14, 36, 4);
  g.fill(0x8b6914);
  g.rect(ox - 18, oy - 14, 36, 1);
  g.fill(0xa07920);
  // Desk body
  g.rect(ox - 18, oy - 10, 36, 12);
  g.fill(0x6b4f14);
  // Legs
  g.rect(ox - 16, oy, 3, 4);
  g.fill(0x5a3e10);
  g.rect(ox + 13, oy, 3, 4);
  g.fill(0x5a3e10);
  // Warm lamp glow
  g.circle(ox + 10, oy - 22, 6);
  g.fill({ color: 0xffdd44, alpha: 0.25 });
  // Lamp base
  g.rect(ox + 9, oy - 17, 3, 3);
  g.fill(0x8b6914);
  g.rect(ox + 7, oy - 24, 7, 5);
  g.fill(0xffdd88);
  // Open book
  g.rect(ox - 8, oy - 18, 12, 4);
  g.fill(0xfffff0);
  g.rect(ox - 2, oy - 18, 1, 4);
  g.fill(0xccccaa);
}

function drawArmchair(g: Graphics, ox: number, oy: number) {
  // Seat cushion
  g.rect(ox - 10, oy - 10, 20, 8);
  g.fill(0x8b2222);
  // Back
  g.rect(ox - 10, oy - 22, 20, 12);
  g.fill(0x7a1e1e);
  // Arms
  g.rect(ox - 13, oy - 16, 3, 14);
  g.fill(0x6b1a1a);
  g.rect(ox + 10, oy - 16, 3, 14);
  g.fill(0x6b1a1a);
  // Front legs
  g.rect(ox - 8, oy - 2, 3, 4);
  g.fill(0x5c3317);
  g.rect(ox + 5, oy - 2, 3, 4);
  g.fill(0x5c3317);
}

function drawGlobe(g: Graphics, ox: number, oy: number, frame: number) {
  // Stand
  g.rect(ox - 1, oy - 12, 2, 12);
  g.fill(0x8b6914);
  g.rect(ox - 6, oy - 2, 12, 3);
  g.fill(0x6b4f14);
  // Globe sphere
  g.circle(ox, oy - 22, 10);
  g.fill(0x2266aa);
  // Continents (rotating effect)
  const offset = Math.floor(frame / 20) % 10;
  g.rect(ox - 6 + offset % 5, oy - 28, 6, 4);
  g.fill(0x44aa44);
  g.rect(ox + 2 - offset % 3, oy - 20, 4, 6);
  g.fill(0x44aa44);
  // Axis ring
  g.ellipse(ox, oy - 22, 12, 4);
  g.stroke({ width: 1, color: 0x8b6914 });
}

function drawFireplace(g: Graphics, ox: number, oy: number, frame: number) {
  // Stone frame
  g.rect(ox - 16, oy - 40, 32, 40);
  g.fill(0x4a4a4a);
  g.rect(ox - 18, oy - 42, 36, 4);
  g.fill(0x5a5a5a);
  // Mantle
  g.rect(ox - 20, oy - 44, 40, 3);
  g.fill(0x8b6914);
  // Firebox opening
  g.rect(ox - 10, oy - 30, 20, 28);
  g.fill(0x1a1a1a);
  // Animated fire
  const flicker1 = Math.sin(frame * 0.2) * 2;
  const flicker2 = Math.cos(frame * 0.15) * 2;
  g.rect(ox - 6 + flicker1, oy - 20, 5, 16);
  g.fill({ color: 0xff4400, alpha: 0.9 });
  g.rect(ox + 1 + flicker2, oy - 18, 5, 14);
  g.fill({ color: 0xff6600, alpha: 0.85 });
  g.rect(ox - 3, oy - 14 + flicker1, 6, 10);
  g.fill({ color: 0xffaa00, alpha: 0.8 });
  // Embers
  g.rect(ox - 4, oy - 4, 8, 2);
  g.fill(0xff2200);
  // Warm glow
  g.circle(ox, oy - 16, 20);
  g.fill({ color: 0xff6600, alpha: 0.06 });
}

// ---- Casino furniture ----

function drawRouletteTable(g: Graphics, ox: number, oy: number, frame: number) {
  // Table base
  g.ellipse(ox, oy - 6, 24, 12);
  g.fill(0x006600);
  // Rim
  g.ellipse(ox, oy - 6, 24, 12);
  g.stroke({ width: 2, color: 0x8b6914 });
  // Inner wheel
  g.circle(ox, oy - 6, 8);
  g.fill(0x003300);
  // Spinning indicator
  const angle = (frame * 0.05) % (Math.PI * 2);
  const bx = ox + Math.cos(angle) * 6;
  const by = oy - 6 + Math.sin(angle) * 3;
  g.circle(bx, by, 2);
  g.fill(0xffffff);
  // Numbers hint
  g.rect(ox + 12, oy - 10, 8, 3);
  g.fill(0xff0000);
  g.rect(ox - 20, oy - 10, 8, 3);
  g.fill(0x000000);
  // Legs
  g.rect(ox - 2, oy + 4, 4, 4);
  g.fill(0x5c3317);
}

function drawSlotMachine(g: Graphics, ox: number, oy: number, frame: number) {
  // Cabinet body
  g.rect(ox - 12, oy - 40, 24, 40);
  g.fill(0xcc0000);
  g.rect(ox - 12, oy - 2, 24, 4);
  g.fill(0x990000);
  // Top decorative cap
  g.rect(ox - 14, oy - 44, 28, 6);
  g.fill(0xff2222);
  // Screen
  g.rect(ox - 8, oy - 32, 16, 12);
  g.fill(0x111111);
  // 3 spinning reels
  const symbols = [0xffff00, 0xff00ff, 0x00ffff];
  for (let i = 0; i < 3; i++) {
    const ci = (i + Math.floor(frame / 12)) % symbols.length;
    g.rect(ox - 6 + i * 5, oy - 30, 4, 8);
    g.fill({ color: symbols[ci], alpha: 0.9 });
  }
  // Lever
  g.rect(ox + 12, oy - 28, 3, 14);
  g.fill(0x666666);
  g.circle(ox + 13.5, oy - 30, 3);
  g.fill(0xff4444);
  // Coin tray
  g.rect(ox - 8, oy - 16, 16, 4);
  g.fill(0xffd700);
}

function drawBlackjackTable(g: Graphics, ox: number, oy: number) {
  // Green felt table (half-moon shape as rect)
  g.rect(ox - 22, oy - 10, 44, 12);
  g.fill(0x006600);
  g.rect(ox - 22, oy - 10, 44, 1);
  g.fill(0x008800);
  // Front edge
  g.rect(ox - 22, oy, 44, 4);
  g.fill(0x004400);
  // Dealer position marking
  g.ellipse(ox, oy - 6, 16, 5);
  g.stroke({ width: 1, color: 0xffd700 });
  // Card spots
  g.rect(ox - 14, oy - 8, 6, 4);
  g.fill(0xffffff);
  g.rect(ox - 4, oy - 8, 6, 4);
  g.fill(0xffffff);
  g.rect(ox + 6, oy - 8, 6, 4);
  g.fill(0xffffff);
  // Table legs
  g.rect(ox - 18, oy + 2, 3, 4);
  g.fill(0x5c3317);
  g.rect(ox + 15, oy + 2, 3, 4);
  g.fill(0x5c3317);
}

function drawChipStack(g: Graphics, ox: number, oy: number) {
  const colors = [0xff0000, 0x0000ff, 0x00cc00, 0xffd700];
  for (let i = 0; i < 4; i++) {
    g.ellipse(ox + i * 4 - 6, oy - 4 - i * 3, 6, 3);
    g.fill(colors[i]);
    g.ellipse(ox + i * 4 - 6, oy - 4 - i * 3, 6, 3);
    g.stroke({ width: 0.5, color: 0xffffff });
  }
}

function drawNeonSign(g: Graphics, ox: number, oy: number, frame: number) {
  const pulse = 0.6 + Math.sin(frame * 0.1) * 0.4;
  // Sign backing
  g.rect(ox - 20, oy - 30, 40, 16);
  g.fill(0x111111);
  // Neon border
  g.rect(ox - 20, oy - 30, 40, 16);
  g.stroke({ width: 2, color: 0xff00ff, alpha: pulse });
  // "CASINO" text effect (bright rects)
  g.rect(ox - 14, oy - 26, 28, 8);
  g.fill({ color: 0xff00ff, alpha: pulse * 0.3 });
  // Star decorations
  g.circle(ox - 16, oy - 22, 2);
  g.fill({ color: 0xffff00, alpha: pulse });
  g.circle(ox + 16, oy - 22, 2);
  g.fill({ color: 0xffff00, alpha: pulse });
}

// ---- Theater furniture ----

function drawStagePlatform(g: Graphics, ox: number, oy: number) {
  // Raised platform
  g.rect(ox - 16, oy - 8, 32, 4);
  g.fill(0x8b6914);
  g.rect(ox - 16, oy - 8, 32, 1);
  g.fill(0xa07920);
  // Front face
  g.rect(ox - 16, oy - 4, 32, 6);
  g.fill(0x6b4f14);
  // Stage floor boards
  for (let i = 0; i < 4; i++) {
    g.rect(ox - 14 + i * 8, oy - 7, 7, 2);
    g.fill(0x9b7924);
  }
}

function drawFootlights(g: Graphics, ox: number, oy: number, frame: number) {
  const colors = [0xffff44, 0xffaa22, 0xffff44, 0xff8822, 0xffff44];
  for (let i = 0; i < 5; i++) {
    const flicker = 0.7 + Math.sin(frame * 0.15 + i) * 0.3;
    g.circle(ox - 12 + i * 6, oy - 2, 2.5);
    g.fill({ color: colors[i], alpha: flicker });
    // Glow
    g.circle(ox - 12 + i * 6, oy - 2, 6);
    g.fill({ color: colors[i], alpha: flicker * 0.1 });
  }
}

function drawCurtain(g: Graphics, ox: number, oy: number) {
  // Tall heavy curtain
  g.rect(ox - 6, oy - 60, 12, 60);
  g.fill(0x8b0000);
  // Folds (vertical stripes)
  g.rect(ox - 4, oy - 58, 2, 56);
  g.fill(0x6b0000);
  g.rect(ox + 2, oy - 58, 2, 56);
  g.fill(0x6b0000);
  // Top valance
  g.rect(ox - 8, oy - 62, 16, 4);
  g.fill(0xffd700);
  // Tassel
  g.rect(ox - 1, oy - 30, 2, 8);
  g.fill(0xffd700);
  g.circle(ox, oy - 22, 2);
  g.fill(0xffd700);
}

function drawSpotlight(g: Graphics, ox: number, oy: number, frame: number) {
  const pulse = 0.6 + Math.sin(frame * 0.08) * 0.4;
  // Fixture
  g.rect(ox - 4, oy - 50, 8, 6);
  g.fill(0x333333);
  // Light cone (triangle effect)
  g.poly([
    { x: ox - 4, y: oy - 44 },
    { x: ox + 4, y: oy - 44 },
    { x: ox + 16, y: oy },
    { x: ox - 16, y: oy },
  ]);
  g.fill({ color: 0xffffcc, alpha: pulse * 0.12 });
  // Bright center
  g.circle(ox, oy - 46, 3);
  g.fill({ color: 0xffffff, alpha: pulse });
}

function drawAudienceSeat(g: Graphics, ox: number, oy: number) {
  // Seat
  g.rect(ox - 6, oy - 6, 12, 4);
  g.fill(0x4a1a1a);
  // Back
  g.rect(ox - 6, oy - 14, 12, 8);
  g.fill(0x3a1010);
  // Legs
  g.rect(ox - 5, oy - 2, 2, 4);
  g.fill(0x333333);
  g.rect(ox + 3, oy - 2, 2, 4);
  g.fill(0x333333);
}

function drawMicrophone(g: Graphics, ox: number, oy: number) {
  // Stand
  g.rect(ox - 1, oy - 30, 2, 28);
  g.fill(0x666666);
  // Base
  g.ellipse(ox, oy, 6, 3);
  g.fill(0x444444);
  // Mic head
  g.circle(ox, oy - 32, 4);
  g.fill(0x888888);
  g.circle(ox, oy - 32, 3);
  g.fill(0x666666);
  // Grid pattern
  g.rect(ox - 2, oy - 34, 1, 4);
  g.fill(0x555555);
  g.rect(ox + 1, oy - 34, 1, 4);
  g.fill(0x555555);
}

// ---- Rooftop furniture ----

function drawLoungeChair(g: Graphics, ox: number, oy: number) {
  // Angled flat surface
  g.poly([
    { x: ox - 14, y: oy - 6 },
    { x: ox + 14, y: oy - 6 },
    { x: ox + 14, y: oy - 2 },
    { x: ox - 14, y: oy - 2 },
  ]);
  g.fill(0xdddddd);
  // Slightly raised head portion
  g.rect(ox - 14, oy - 12, 8, 6);
  g.fill(0xcccccc);
  // Cushion
  g.rect(ox - 12, oy - 8, 24, 3);
  g.fill(0x4488cc);
  // Legs
  g.rect(ox - 12, oy - 2, 2, 4);
  g.fill(0x888888);
  g.rect(ox + 10, oy - 2, 2, 4);
  g.fill(0x888888);
}

function drawStringLights(g: Graphics, ox: number, oy: number, frame: number) {
  // Horizontal string
  g.rect(ox - 20, oy - 36, 40, 1);
  g.fill(0x444444);
  // Warm yellow dots along string
  for (let i = 0; i < 8; i++) {
    const flicker = 0.6 + Math.sin(frame * 0.1 + i * 1.2) * 0.4;
    const lx = ox - 18 + i * 5;
    g.circle(lx, oy - 34, 2);
    g.fill({ color: 0xffdd66, alpha: flicker });
    // Warm glow
    g.circle(lx, oy - 34, 5);
    g.fill({ color: 0xffdd66, alpha: flicker * 0.1 });
  }
}

function drawBarCart(g: Graphics, ox: number, oy: number) {
  // Cart frame
  g.rect(ox - 12, oy - 18, 24, 4);
  g.fill(0x888888);
  g.rect(ox - 12, oy - 8, 24, 4);
  g.fill(0x888888);
  // Side rails
  g.rect(ox - 12, oy - 18, 2, 18);
  g.fill(0x777777);
  g.rect(ox + 10, oy - 18, 2, 18);
  g.fill(0x777777);
  // Wheels
  g.circle(ox - 10, oy + 1, 2);
  g.fill(0x444444);
  g.circle(ox + 10, oy + 1, 2);
  g.fill(0x444444);
  // Bottles on top
  g.rect(ox - 6, oy - 24, 4, 6);
  g.fill(0x44aa44);
  g.rect(ox + 2, oy - 22, 4, 4);
  g.fill(0xaa4444);
  // Glasses on lower shelf
  g.rect(ox - 4, oy - 12, 3, 3);
  g.fill({ color: 0xffffff, alpha: 0.6 });
  g.rect(ox + 2, oy - 12, 3, 3);
  g.fill({ color: 0xffffff, alpha: 0.6 });
}

function drawCactusPot(g: Graphics, ox: number, oy: number) {
  // Pot
  g.rect(ox - 6, oy - 8, 12, 8);
  g.fill(0xcc6633);
  g.rect(ox - 7, oy - 10, 14, 3);
  g.fill(0xdd7744);
  // Cactus body
  g.rect(ox - 3, oy - 24, 6, 16);
  g.fill(0x228b22);
  // Arms
  g.rect(ox - 8, oy - 20, 5, 4);
  g.fill(0x228b22);
  g.rect(ox - 8, oy - 26, 4, 10);
  g.fill(0x1e7b1e);
  g.rect(ox + 3, oy - 18, 5, 4);
  g.fill(0x228b22);
  g.rect(ox + 4, oy - 22, 4, 8);
  g.fill(0x1e7b1e);
  // Flower on top
  g.circle(ox, oy - 26, 3);
  g.fill(0xff69b4);
}

function drawCitySkyline(g: Graphics, ox: number, oy: number) {
  // Buildings silhouette along bottom wall
  const buildings = [
    { x: -20, w: 8, h: 30 },
    { x: -10, w: 6, h: 45 },
    { x: -3, w: 10, h: 35 },
    { x: 8, w: 7, h: 50 },
    { x: 16, w: 6, h: 25 },
    { x: 23, w: 8, h: 40 },
  ];
  for (const b of buildings) {
    g.rect(ox + b.x, oy - b.h, b.w, b.h);
    g.fill(0x1a1a2e);
    // Windows (tiny yellow dots)
    for (let wy = 0; wy < b.h - 4; wy += 6) {
      for (let wx = 1; wx < b.w - 1; wx += 3) {
        g.rect(ox + b.x + wx, oy - b.h + 2 + wy, 1.5, 2);
        g.fill({ color: 0xffdd66, alpha: Math.random() > 0.3 ? 0.7 : 0.2 });
      }
    }
  }
}

// ---- Rooftop sky background ----

export function drawRooftopSky(
  g: Graphics,
  gridW: number,
  gridH: number,
  tileW: number,
  tileH: number,
  tileToScreenFn: (x: number, y: number) => { sx: number; sy: number },
  timeOfDay: "dawn" | "day" | "dusk" | "night"
) {
  const skyColors: Record<string, number[]> = {
    night: [0x0a0a1a, 0x0d0d2a, 0x101030, 0x141440, 0x181850],
    dawn: [0x1a0a2a, 0x4a2040, 0x8a3050, 0xcc6040, 0xFF8C00],
    day: [0x3366aa, 0x4488cc, 0x55aadd, 0x77ccee, 0x87CEEB],
    dusk: [0x1a0a1a, 0x3a1a2a, 0x6a2a3a, 0xaa4a3a, 0xFF6B35],
  };
  const colors = skyColors[timeOfDay];

  // Get boundary points
  const topLeft = tileToScreenFn(0, 0);
  const topRight = tileToScreenFn(gridW, 0);
  const bottomLeft = tileToScreenFn(0, gridH);

  const wallHeight = 80;
  const startY = topLeft.sy - wallHeight - 3;
  const endY = topLeft.sy + tileH / 2;
  const bandH = (endY - startY) / colors.length;

  for (let i = 0; i < colors.length; i++) {
    const y = startY + i * bandH;
    g.rect(topRight.sx - tileW, y, bottomLeft.sx - topRight.sx + tileW * 3, bandH + 1);
    g.fill(colors[i]);
  }

  // Stars at night
  if (timeOfDay === "night") {
    for (let i = 0; i < 20; i++) {
      const sx = topRight.sx - tileW + Math.random() * (bottomLeft.sx - topRight.sx + tileW * 3);
      const sy2 = startY + Math.random() * (endY - startY) * 0.6;
      g.circle(sx, sy2, 0.8 + Math.random() * 0.5);
      g.fill({ color: 0xffffff, alpha: 0.5 + Math.random() * 0.5 });
    }
  }
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


// ---- PhillyBot's Lair ----

export function drawPhillybotLair(
  g: Graphics,
  frameCount: number,
  tileToScreenFn: (x: number, y: number) => { sx: number; sy: number }
) {
  function toScreen(tx: number, ty: number) {
    const { sx, sy } = tileToScreenFn(tx, ty);
    return { x: sx, y: sy + 16 }; // offset to center in tile
  }

  // === Purple LED floor strips along perimeter ===
  // Top edge
  for (let i = 0; i < 12; i++) {
    const p = toScreen(i, 0);
    g.rect(p.x - 16, p.y - 2, 32, 2);
    g.fill({ color: 0x9333ea, alpha: 0.7 });
  }
  // Bottom edge
  for (let i = 0; i < 12; i++) {
    const p = toScreen(i, 9);
    g.rect(p.x - 16, p.y + 8, 32, 2);
    g.fill({ color: 0x9333ea, alpha: 0.7 });
  }
  // Left edge
  for (let j = 0; j < 10; j++) {
    const p = toScreen(0, j);
    g.rect(p.x - 18, p.y, 2, 16);
    g.fill({ color: 0x9333ea, alpha: 0.7 });
  }
  // Right edge
  for (let j = 0; j < 10; j++) {
    const p = toScreen(11, j);
    g.rect(p.x + 16, p.y, 2, 16);
    g.fill({ color: 0x9333ea, alpha: 0.7 });
  }
  // Corner bright dots
  const corners = [
    toScreen(0, 0), toScreen(11, 0), toScreen(0, 9), toScreen(11, 9),
  ];
  for (const c of corners) {
    g.circle(c.x, c.y, 2);
    g.fill(0xc084fc);
  }

  // === Triple Monitor Setup (centerpiece) ===
  const monitorPositions = [
    toScreen(3, 2),
    toScreen(5, 1.5),
    toScreen(7, 2),
  ];
  const codeLineWidths = [14, 9, 16, 6, 12, 8];

  for (const mp of monitorPositions) {
    const mx = mp.x;
    const my = mp.y;

    // Outer frame
    g.rect(mx - 14, my - 28, 28, 20);
    g.fill(0x1a1a2e);
    // Inner screen
    g.rect(mx - 11, my - 25, 22, 14);
    g.fill(0x050510);

    // Animated code lines
    const brightIdx = (Math.floor(frameCount / 5)) % 6;
    for (let i = 0; i < 6; i++) {
      const lineY = my - 23 + i * 2;
      const w = codeLineWidths[i];
      const color = i === brightIdx ? 0x00ff41 : 0x003b10;
      g.rect(mx - 9, lineY, w, 2);
      g.fill(color);
    }

    // Monitor stand
    g.rect(mx - 1.5, my - 8, 3, 6);
    g.fill(0x111111);
    // Base
    g.rect(mx - 4, my - 2, 8, 2);
    g.fill(0x111111);
  }

  // Keyboard below center monitor
  const kp = toScreen(5, 2.5);
  g.rect(kp.x - 15, kp.y - 6, 30, 6);
  g.fill(0x111111);
  // Key dots (3x4 grid)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      const kx = kp.x - 12 + c * 7;
      const ky = kp.y - 4 + r * 2;
      const keyColor = (r + c) % 2 === 0 ? 0x222222 : 0x9333ea;
      g.rect(kx, ky, 2, 2);
      g.fill(keyColor);
    }
  }

  // === Server Rack (right side) ===
  const sr = toScreen(9, 2);
  // Cabinet outer
  g.rect(sr.x - 10, sr.y - 40, 20, 40);
  g.fill(0x0a0a0a);
  // Face
  g.rect(sr.x - 8, sr.y - 38, 16, 36);
  g.fill(0x111111);

  // 8 rows of 4 status lights, animated
  const phase = Math.floor(frameCount % 24);
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 4; col++) {
      const lx = sr.x - 6 + col * 4;
      const ly = sr.y - 36 + row * 4;
      let color: number;
      if (phase < 12) {
        color = (col === 0 || col === 3) ? 0x22c55e : 0xef4444;
      } else {
        color = (col === 0 || col === 2) ? 0x22c55e : 0xef4444;
      }
      g.circle(lx, ly, 1.5);
      g.fill(color);
    }
  }

  // Fan at top
  g.circle(sr.x, sr.y - 36, 5);
  g.fill(0x1a1a1a);
  // Cross inside fan
  g.rect(sr.x - 4, sr.y - 36.5, 8, 1);
  g.fill(0x333333);
  g.rect(sr.x - 0.5, sr.y - 40, 1, 8);
  g.fill(0x333333);

  // Cable bundle at bottom
  g.rect(sr.x - 3, sr.y - 2, 1, 8);
  g.fill(0x333333);
  g.rect(sr.x, sr.y - 2, 1, 8);
  g.fill(0x9333ea);
  g.rect(sr.x + 3, sr.y - 2, 1, 8);
  g.fill(0x1a1a2e);

  // === Glowing Neon Sign (back wall) ===
  const ns = toScreen(5, 0);
  // Dark bg rect
  g.rect(ns.x - 40, ns.y - 20, 80, 16);
  g.fill(0x0d0512);
  // Purple border
  g.rect(ns.x - 40, ns.y - 20, 80, 16);
  g.stroke({ width: 1, color: 0x9333ea });

  // Block letter shapes suggesting "PHILLYBOT" — varied height rects
  const letterWidths = [5, 5, 3, 4, 4, 5, 5, 5, 4]; // P H I L L Y B O T
  const letterHeights = [10, 10, 10, 8, 8, 9, 10, 10, 9];
  let lx = ns.x - 36;
  for (let i = 0; i < 9; i++) {
    g.rect(lx, ns.y - 18, letterWidths[i], letterHeights[i]);
    g.fill(0xa855f7);
    lx += letterWidths[i] + 2;
  }

  // Animated glow overlay
  const glowAlpha = 0.06 + Math.sin(frameCount * 0.05) * 0.04;
  g.rect(ns.x - 41, ns.y - 21, 82, 18);
  g.fill({ color: 0x9333ea, alpha: glowAlpha });

  // === Coffee Station (left side) ===
  const cs = toScreen(2, 4);
  // Machine body
  g.rect(cs.x - 8, cs.y - 22, 16, 22);
  g.fill(0x1a1a1a);
  // Portafilter handle
  g.rect(cs.x - 12, cs.y - 14, 4, 3);
  g.fill(0x333333);
  // Water tank
  g.rect(cs.x + 6, cs.y - 20, 4, 16);
  g.fill(0x2a2a3e);
  // Red power light
  g.circle(cs.x - 4, cs.y - 18, 1.5);
  g.fill(0xff0000);

  // Animated steam
  for (let i = 0; i < 3; i++) {
    const steamAlpha = 0.2 + Math.sin(frameCount * 0.1 + i * 1.2) * 0.15;
    g.rect(cs.x - 4 + i * 3, cs.y - 30, 1, 8);
    g.fill({ color: 0xcccccc, alpha: steamAlpha });
  }

  // === Kernel's Cat Bed (corner) ===
  const cb = toScreen(1, 7);
  // Cushion
  g.ellipse(cb.x, cb.y, 11, 6);
  g.fill(0x7c3aed);
  // Inner cushion
  g.ellipse(cb.x, cb.y, 8, 4);
  g.fill(0xa855f7);
  // Paw prints
  g.circle(cb.x - 4, cb.y - 8, 2);
  g.fill(0x9333ea);
  g.circle(cb.x, cb.y - 10, 2);
  g.fill(0x9333ea);
  g.circle(cb.x + 4, cb.y - 8, 2);
  g.fill(0x9333ea);

  // === Bean Bag ===
  const bb = toScreen(2, 6);
  const offsets = [0, 2, -1, 3, 1, -2, 2, -1];
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const r = 9 + offsets[i];
    points.push({ x: bb.x + Math.cos(angle) * r, y: bb.y + Math.sin(angle) * r * 0.6 });
  }
  g.poly(points);
  g.fill(0x2d1b69);
  // Highlight patch
  const hPoints: { x: number; y: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - 0.5;
    const r = 5 + (offsets[i % 8] * 0.5);
    hPoints.push({ x: bb.x - 2 + Math.cos(angle) * r, y: bb.y - 1 + Math.sin(angle) * r * 0.5 });
  }
  g.poly(hPoints);
  g.fill(0x4c1d95);

  // === Energy Drink Cans ===
  const ed = toScreen(3.5, 3);
  const canColors = [0x00ff41, 0xff00ff, 0x00bfff];
  for (let i = 0; i < 3; i++) {
    const cx = ed.x - 4 + i * 4;
    // Body
    g.rect(cx - 1.5, ed.y - 8, 3, 8);
    g.fill(canColors[i]);
    // Top ellipse
    g.ellipse(cx, ed.y - 8, 2, 1);
    g.fill(canColors[i]);
  }

  // === Purple Ambient Overlay ===
  // Draw a large overlay rect (approximate room bounds)
  const tl = toScreen(0, 0);
  const br = toScreen(11, 9);
  g.rect(tl.x - 200, tl.y - 100, (br.x - tl.x) + 400, (br.y - tl.y) + 200);
  g.fill({ color: 0x3b0070, alpha: 0.06 });
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

// --- Personal Bot Room Furniture ---

export function drawBotRoomFurniture(
  g: Graphics,
  accentColor: number,
  frameCount: number,
  tileToScreenFn: (x: number, y: number) => { sx: number; sy: number },
) {
  const accentLight = lightenNum(accentColor, 0.3);
  const accentDark = darkenNum(accentColor, 0.4);

  // Bed (tileX:8, tileY:7)
  {
    const { sx, sy } = tileToScreenFn(8, 7);
    const bx = sx;
    const by = sy + 16;
    // Frame
    g.rect(bx - 15, by - 10, 30, 20);
    g.fill(0x2a2a2a);
    // Mattress
    g.rect(bx - 13, by - 8, 26, 16);
    g.fill(accentLight);
    // Pillow
    g.rect(bx - 12, by - 7, 10, 6);
    g.fill(0xeeeedd);
    // Blanket fold line
    g.rect(bx - 2, by - 6, 14, 1);
    g.fill({ color: accentDark, alpha: 0.5 });
  }

  // Desk (tileX:3, tileY:2)
  {
    const { sx, sy } = tileToScreenFn(3, 2);
    const dx = sx;
    const dy = sy + 16;
    // Surface
    g.rect(dx - 14, dy - 7, 28, 14);
    g.fill(0x3a2a1a);
    // Legs
    g.rect(dx - 13, dy + 5, 2, 6);
    g.fill(0x2a1a0a);
    g.rect(dx + 11, dy + 5, 2, 6);
    g.fill(0x2a1a0a);
    // Monitor
    g.rect(dx - 7, dy - 16, 14, 10);
    g.fill(0x111111);
    // Screen glow
    g.rect(dx - 5, dy - 14, 10, 7);
    g.fill(accentColor);
    // Screen lines
    for (let i = 0; i < 3; i++) {
      g.rect(dx - 4, dy - 13 + i * 2, 8, 1);
      g.fill({ color: 0xffffff, alpha: 0.3 });
    }
    // Monitor stand
    g.rect(dx - 1, dy - 6, 2, 2);
    g.fill(0x222222);
    // Coffee cup
    g.rect(dx + 7, dy - 4, 3, 4);
    g.fill(0x8B4513);
    g.rect(dx + 6, dy - 4, 5, 1);
    g.fill(0x6B3513);
  }

  // Chair (tileX:3, tileY:3)
  {
    const { sx, sy } = tileToScreenFn(3, 3);
    const cx = sx;
    const cy = sy + 16;
    // Seat
    g.rect(cx - 5, cy - 2, 10, 8);
    g.fill(accentDark);
    // Backrest
    g.rect(cx - 5, cy - 14, 10, 14);
    g.fill(accentDark);
    g.rect(cx - 4, cy - 13, 8, 10);
    g.fill(accentColor);
  }

  // Lamp (tileX:2, tileY:2)
  {
    const { sx, sy } = tileToScreenFn(2, 2);
    const lx = sx;
    const ly = sy + 16;
    // Glow circle
    const glowAlpha = 0.08 + Math.sin(frameCount * 0.03) * 0.03;
    g.circle(lx, ly - 16, 20);
    g.fill({ color: 0xFFE4B5, alpha: glowAlpha });
    // Pole
    g.rect(lx - 1, ly - 20, 2, 20);
    g.fill(0x888888);
    // Shade
    g.poly([
      { x: lx - 6, y: ly - 20 },
      { x: lx + 6, y: ly - 20 },
      { x: lx + 4, y: ly - 28 },
      { x: lx - 4, y: ly - 28 },
    ]);
    g.fill(0xFFE4B5);
    // Base
    g.rect(lx - 3, ly - 2, 6, 2);
    g.fill(0x666666);
  }

  // Rug (tileX:5, tileY:5) — accent colored ellipse
  {
    const { sx, sy } = tileToScreenFn(5, 5);
    const rx = sx;
    const ry = sy + 16;
    // Border ellipse
    g.ellipse(rx, ry, 22, 11);
    g.fill({ color: accentDark, alpha: 0.4 });
    // Inner ellipse
    g.ellipse(rx, ry, 18, 9);
    g.fill({ color: accentColor, alpha: 0.25 });
  }

  // Poster (tileX:0, tileY:4) — on wall
  {
    const { sx, sy } = tileToScreenFn(0, 4);
    const px = sx - 20;
    const py = sy - 10;
    // Frame
    g.rect(px - 8, py - 10, 16, 20);
    g.fill(accentColor);
    // White stripes (abstract art)
    for (let i = 0; i < 3; i++) {
      g.rect(px - 6, py - 6 + i * 5, 12, 2);
      g.fill({ color: 0xffffff, alpha: 0.7 });
    }
  }
}

function lightenNum(color: number, amount: number): number {
  const r = (color >> 16) & 0xff;
  const g2 = (color >> 8) & 0xff;
  const b = color & 0xff;
  return rgbToHex(
    Math.floor(r + (255 - r) * amount),
    Math.floor(g2 + (255 - g2) * amount),
    Math.floor(b + (255 - b) * amount)
  );
}

// --- Room Ambient Particles ---

export function drawRoomAmbient(
  g: Graphics,
  roomId: string,
  frameCount: number,
  tileToScreenFn: (x: number, y: number) => { sx: number; sy: number },
  accentColor?: number,
) {
  if (roomId === "kitchen") {
    // Steam particles rising from stoves
    for (let i = 0; i < 4; i++) {
      const stoveX = [1, 3, 5, 7][i];
      const { sx, sy } = tileToScreenFn(stoveX, 1);
      const offset = (frameCount * 0.5 + i * 40) % 60;
      const alpha = Math.max(0, 0.3 - offset * 0.005);
      g.circle(sx + Math.sin(frameCount * 0.02 + i) * 3, sy - offset, 1.5);
      g.fill({ color: 0xffffff, alpha });
    }
  } else if (roomId === "dancefloor") {
    // Colored light spots
    for (let i = 0; i < 4; i++) {
      const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xff00ff];
      const colorIdx = (Math.floor(frameCount / 30) + i) % 4;
      const tx = 4 + (i % 2) * 3;
      const ty = 4 + Math.floor(i / 2) * 2;
      const { sx, sy } = tileToScreenFn(tx, ty);
      g.circle(sx, sy + 16, 8);
      g.fill({ color: colors[colorIdx], alpha: 0.12 });
    }
  } else if (roomId === "bar") {
    // Warm amber glow behind bar
    const { sx: sx1, sy: sy1 } = tileToScreenFn(3, 1);
    const { sx: sx2 } = tileToScreenFn(7, 1);
    g.rect(sx1 - 16, sy1 - 10, sx2 - sx1 + 32, 30);
    g.fill({ color: 0xFFAA00, alpha: 0.04 });
  } else if (roomId === "studio") {
    // Paint splatter dots
    const splatColors = [0xff4444, 0x4444ff, 0x44ff44, 0xffff00, 0xff44ff, 0x44ffff];
    for (let i = 0; i < 6; i++) {
      const tx = 3 + (i % 3) * 2;
      const ty = 4 + Math.floor(i / 3) * 2;
      const { sx, sy } = tileToScreenFn(tx, ty);
      g.circle(sx + (i * 7) % 10 - 5, sy + 14 + (i * 3) % 6, 1 + (i % 2));
      g.fill({ color: splatColors[i], alpha: 0.25 });
    }
  } else if (roomId === "library") {
    // Dust motes near fireplace
    for (let i = 0; i < 3; i++) {
      const drift = (frameCount * 0.3 + i * 50) % 80;
      const { sx, sy } = tileToScreenFn(1, 4);
      g.circle(sx + drift * 0.5 + i * 5, sy - drift * 0.3 + 10, 0.8);
      g.fill({ color: 0xFFE4B5, alpha: 0.25 - drift * 0.003 });
    }
  } else if (roomId === "rooftop") {
    // Twinkling stars
    for (let i = 0; i < 8; i++) {
      const starX = -200 + (i * 61) % 400;
      const starY = -40 + (i * 37) % 60;
      const twinkle = 0.2 + Math.sin(frameCount * 0.04 + i * 1.7) * 0.2;
      g.circle(starX, starY, 0.8);
      g.fill({ color: 0xffffff, alpha: twinkle });
    }
  }

  // Bot personal rooms — accent color vignette
  if (roomId.startsWith("bot_room_") && accentColor !== undefined) {
    const { sx: tlsx, sy: tlsy } = tileToScreenFn(0, 0);
    const { sx: brsx, sy: brsy } = tileToScreenFn(11, 9);
    // Subtle accent glow at edges
    g.rect(tlsx - 100, tlsy - 50, brsx - tlsx + 200, brsy - tlsy + 100);
    g.fill({ color: accentColor, alpha: 0.025 });
  }
}
