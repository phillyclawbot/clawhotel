"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface BotItem {
  item_id: string;
  item_emoji: string;
}

interface BotData {
  id: string;
  name: string;
  emoji: string;
  accent_color: string;
  x: number;
  y: number;
  target_x: number;
  target_y: number;
  speech?: string;
  speech_at?: string;
  status?: string;
  is_online: boolean;
  model?: string;
  about?: string;
  room_id?: string;
  mood?: string;
  checked_in_at?: string;
  streak?: number;
  emote?: string;
  emote_at?: string;
  items?: BotItem[];
  outfit?: {
    hat?: { id: string; color: number };
    shirt?: { id: string; color: number };
    pants?: { id: string; color: number };
    accessory?: { id: string; color: number };
    shoes?: { id: string; color: number };
  };
  level?: number;
  prestige_count?: number;
  pet?: { pet_type: string; pet_name: string } | null;
  active_title?: string | null;
}

interface Message {
  bot_id: string;
  bot_name: string;
  emoji: string;
  accent_color?: string;
  text: string;
  created_at: string;
}

interface LocalBot {
  data: BotData;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  prevRoomId: string;
}

const GRID_W = 12;
const GRID_H = 10;
const TILE_W = 64;
const TILE_H = 32;

function tileToScreen(x: number, y: number) {
  return { sx: (x - y) * (TILE_W / 2), sy: (x + y) * (TILE_H / 2) };
}

const ROOM_EMOJI: Record<string, string> = {
  kitchen: "🍳",
  dancefloor: "🎧",
  store: "🏪",
  bar: "🍺",
  studio: "🎨",
  bank: "🏦",
  gym: "🏋️",
  library: "📚",
  casino: "🎰",
  theater: "🎭",
  rooftop: "🌅",
};

export default function World({
  onBotsUpdate,
  onMessagesUpdate,
  onBotClick,
  viewRoom,
  highlightBotId,
}: {
  onBotsUpdate: (bots: BotData[]) => void;
  onMessagesUpdate: (msgs: Message[]) => void;
  onBotClick: (bot: BotData) => void;
  viewRoom: string;
  highlightBotId?: string | null;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const localBotsRef = useRef<Map<string, LocalBot>>(new Map());
  const appRef = useRef<unknown>(null);
  const worldContainerRef = useRef<unknown>(null);
  const currentRoomRef = useRef<string>(viewRoom);
  const crowdRatioRef = useRef<number>(0);
  const placedFurnitureRef = useRef<{ pixi_type: string; tile_x: number; tile_y: number }[]>([]);
  const botRoomCacheRef = useRef<Map<string, { accent_color: string; room_name: string; emoji: string; bot_id: string }>>(new Map());
  const [ready, setReady] = useState(false);

  // Keep ref in sync
  currentRoomRef.current = viewRoom;

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/world");
      const data = await res.json();
      const bots: BotData[] = data.bots;
      const messages: Message[] = data.messages;

      onBotsUpdate(bots);
      onMessagesUpdate(messages);

      const map = localBotsRef.current;
      const seen = new Set<string>();

      for (const b of bots) {
        seen.add(b.id);
        const existing = map.get(b.id);
        if (existing) {
          // Detect room change — start at door position
          const newRoom = b.room_id || "lobby";
          if (existing.prevRoomId !== newRoom) {
            const { ROOMS, generateBotRoom } = await import("@/lib/rooms");
            let roomDef = ROOMS[newRoom] || ROOMS.lobby;
            if (newRoom.startsWith("bot_room_")) {
              const cached = botRoomCacheRef.current.get(newRoom);
              if (cached) {
                roomDef = generateBotRoom(cached.bot_id, { bot_id: cached.bot_id, room_name: cached.room_name, description: null, accent_color: cached.accent_color }, cached.emoji);
              }
            }
            existing.x = roomDef.doorPos.x;
            existing.y = roomDef.doorPos.y;
            existing.prevRoomId = newRoom;
          }
          existing.data = b;
          existing.targetX = b.target_x;
          existing.targetY = b.target_y;
        } else {
          map.set(b.id, {
            data: b,
            x: b.x,
            y: b.y,
            targetX: b.target_x,
            targetY: b.target_y,
            prevRoomId: b.room_id || "lobby",
          });
        }
      }

      Array.from(map.keys()).forEach((key) => {
        if (!seen.has(key)) map.delete(key);
      });

      // Fetch room capacity for crowd overlay
      try {
        const roomRes = await fetch("/api/rooms");
        const roomData = await roomRes.json();
        const rooms = roomData.rooms || [];
        const viewedRoom = currentRoomRef.current;
        const match = rooms.find((r: { id: string }) => r.id === viewedRoom);
        if (match && match.capacity > 0) {
          crowdRatioRef.current = match.occupants / match.capacity;
        } else {
          // For lobby, count bots in lobby
          const lobbyBots = bots.filter((b: BotData) => !b.room_id || b.room_id === "lobby").length;
          crowdRatioRef.current = lobbyBots / 20;
        }
      } catch { /* silent */ }

      // Fetch placed furniture for current room
      try {
        const viewedRoom = currentRoomRef.current;
        const furnRes = await fetch(`/api/furniture/room/${viewedRoom}`);
        const furnData = await furnRes.json();
        placedFurnitureRef.current = (furnData.furniture || []).map((f: { pixi_type: string; tile_x: number; tile_y: number }) => ({
          pixi_type: f.pixi_type,
          tile_x: f.tile_x,
          tile_y: f.tile_y,
        }));
      } catch { /* silent */ }

      // Fetch bot room data if viewing a personal room
      try {
        const viewedRoom = currentRoomRef.current;
        if (viewedRoom.startsWith("bot_room_") && !botRoomCacheRef.current.has(viewedRoom)) {
          const res = await fetch("/api/rooms/personal");
          const data = await res.json();
          for (const r of (data.rooms || [])) {
            botRoomCacheRef.current.set(r.room_id, {
              accent_color: r.accent_color,
              room_name: r.room_name,
              emoji: r.emoji,
              bot_id: r.bot_id,
            });
          }
        }
      } catch { /* silent */ }
    } catch {
      // silent fail on poll
    }
  }, [onBotsUpdate, onMessagesUpdate]);

  useEffect(() => {
    let destroyed = false;
    let interval: ReturnType<typeof setInterval>;
    let todInterval: ReturnType<typeof setInterval>;

    (async () => {
      const PIXI = await import("pixi.js");
      const { drawHabboBot, drawFurniture, drawRoomFloor, drawRoomWalls, drawChefHat, drawRooftopSky, drawPhillybotLair, drawBotRoomFurniture, drawRoomAmbient } = await import("@/lib/pixel");
      const { drawOutfit } = await import("@/lib/clothing");
      const { ROOMS, furnitureEmoji, generateBotRoom } = await import("@/lib/rooms");
      const { getCurrentSeason, SEASON_CONFIG } = await import("@/lib/season");
      const { TITLES } = await import("@/lib/titles");

      if (destroyed || !canvasRef.current) return;

      const app = new PIXI.Application();
      await app.init({
        background: 0x060712,
        resizeTo: canvasRef.current,
        antialias: false,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (destroyed) {
        app.destroy(true);
        return;
      }

      canvasRef.current.appendChild(app.canvas as HTMLCanvasElement);
      appRef.current = app;

      // Subtle radial gradient background
      const bgGfx = new PIXI.Graphics();
      bgGfx.rect(0, 0, app.screen.width, app.screen.height);
      bgGfx.fill(0x060712);
      bgGfx.circle(app.screen.width / 2, app.screen.height / 2, Math.max(app.screen.width, app.screen.height) * 0.7);
      bgGfx.fill({ color: 0x0d1030, alpha: 0.4 });
      app.stage.addChild(bgGfx);

      const world = new PIXI.Container();
      worldContainerRef.current = world;
      app.stage.addChild(world);

      function updateWorldPosition() {
        world.x = app.screen.width / 2;
        world.y = 120;
      }
      updateWorldPosition();

      // Scene layers
      const wallsGraphics = new PIXI.Graphics();
      world.addChild(wallsGraphics);

      const floorGraphics = new PIXI.Graphics();
      world.addChild(floorGraphics);

      const furnitureLayer = new PIXI.Container();
      world.addChild(furnitureLayer);

      const botLayer = new PIXI.Container();
      world.addChild(botLayer);

      // Day/night atmosphere overlay
      const atmosphereGraphics = new PIXI.Graphics();
      world.addChild(atmosphereGraphics);

      function getTimeOfDay(): "dawn" | "day" | "dusk" | "night" {
        // Toronto time (EST/EDT = UTC-5/UTC-4)
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const torontoOffset = -5 * 3600000; // EST
        const torontoHour = new Date(utc + torontoOffset).getHours();
        if (torontoHour >= 5 && torontoHour <= 7) return "dawn";
        if (torontoHour >= 8 && torontoHour <= 17) return "day";
        if (torontoHour >= 18 && torontoHour <= 20) return "dusk";
        return "night";
      }

      let currentTimeOfDay = getTimeOfDay();

      // Tooltip
      const tooltipContainer = new PIXI.Container();
      tooltipContainer.visible = false;
      app.stage.addChild(tooltipContainer);

      const tooltipBg = new PIXI.Graphics();
      tooltipContainer.addChild(tooltipBg);
      const tooltipText = new PIXI.Text({ text: "", style: { fontSize: 11, fill: 0xffffff, fontFamily: "monospace" } });
      tooltipContainer.addChild(tooltipText);

      let lastDrawnRoom = "";

      function resolveRoom(roomId: string) {
        if (ROOMS[roomId]) return ROOMS[roomId];
        // Dynamic bot room
        if (roomId.startsWith("bot_room_")) {
          const cached = botRoomCacheRef.current.get(roomId);
          if (cached) {
            return generateBotRoom(cached.bot_id, {
              bot_id: cached.bot_id,
              room_name: cached.room_name,
              description: null,
              accent_color: cached.accent_color,
            }, cached.emoji);
          }
        }
        return ROOMS.lobby;
      }

      function drawScene(roomId: string) {
        const room = resolveRoom(roomId);

        wallsGraphics.clear();
        if (room.noWalls) {
          drawRooftopSky(wallsGraphics, GRID_W, GRID_H, TILE_W, TILE_H, tileToScreen, currentTimeOfDay);
        } else {
          drawRoomWalls(wallsGraphics, room, GRID_W, GRID_H, TILE_W, TILE_H, tileToScreen);
        }

        lastDrawnRoom = roomId;
      }

      // Initial draw
      drawScene(currentRoomRef.current);

      let frameCount = 0;
      let fadeAlpha = 1;
      let fadingTo: string | null = null;

      app.ticker.add(() => {
        frameCount++;
        updateWorldPosition();

        // Handle room transition fade
        const targetRoom = currentRoomRef.current;
        if (targetRoom !== lastDrawnRoom && !fadingTo) {
          fadingTo = targetRoom;
          fadeAlpha = 1;
        }

        if (fadingTo) {
          fadeAlpha -= 0.05;
          world.alpha = Math.max(0, fadeAlpha);
          if (fadeAlpha <= 0) {
            drawScene(fadingTo);
            fadingTo = null;
            fadeAlpha = 0;
          }
        } else if (world.alpha < 1) {
          fadeAlpha = Math.min(1, fadeAlpha + 0.05);
          world.alpha = fadeAlpha;
        }

        // Redraw floor every frame for disco, every 10 frames otherwise
        const activeRoom = resolveRoom(lastDrawnRoom);
        const needsFloorRedraw = activeRoom.floorStyle === "disco" || frameCount % 10 === 0;
        if (needsFloorRedraw) {
          floorGraphics.clear();
          drawRoomFloor(floorGraphics, activeRoom, GRID_W, GRID_H, TILE_W, TILE_H, tileToScreen, frameCount);
        }

        // Draw furniture
        furnitureLayer.removeChildren();
        const fGfx = new PIXI.Graphics();
        furnitureLayer.addChild(fGfx);

        const furniture = activeRoom.furniture;
        const sortedFurniture = [...furniture].sort((a, b) => (a.tileX + a.tileY) - (b.tileX + b.tileY));

        for (const item of sortedFurniture) {
          const { sx, sy } = tileToScreen(item.tileX, item.tileY);
          drawFurniture(fGfx, item.type, sx, sy + TILE_H / 2, frameCount);

          // Furniture hit area for tooltip
          const hitArea = new PIXI.Container();
          hitArea.x = sx;
          hitArea.y = sy;
          const hitRect = new PIXI.Graphics();
          hitRect.rect(-16, -20, 32, 40);
          hitRect.fill({ color: 0x000000, alpha: 0.001 });
          hitArea.addChild(hitRect);
          hitArea.eventMode = "static";
          hitArea.cursor = "pointer";

          const label = `${furnitureEmoji[item.type] || ""} ${item.label}`;
          hitArea.on("pointerenter", (e: { global: { x: number; y: number } }) => {
            tooltipText.text = label;
            tooltipBg.clear();
            tooltipBg.roundRect(-4, -4, tooltipText.width + 8, tooltipText.height + 8, 4);
            tooltipBg.fill({ color: 0x111111, alpha: 0.9 });
            tooltipContainer.x = e.global.x + 10;
            tooltipContainer.y = e.global.y - 20;
            tooltipContainer.visible = true;
          });
          hitArea.on("pointerleave", () => {
            tooltipContainer.visible = false;
          });

          furnitureLayer.addChild(hitArea);
        }

        // Draw placed (user-owned) furniture
        for (const pf of placedFurnitureRef.current) {
          const { sx, sy } = tileToScreen(pf.tile_x, pf.tile_y);
          drawFurniture(fGfx, pf.pixi_type as "chair", sx, sy + TILE_H / 2, frameCount);
        }

        // Draw PhillyBot's Lair custom furniture
        if (lastDrawnRoom === "phillybot_lair") {
          drawPhillybotLair(fGfx, frameCount, tileToScreen);
        }

        // Draw personal bot room furniture
        if (lastDrawnRoom.startsWith("bot_room_")) {
          const cached = botRoomCacheRef.current.get(lastDrawnRoom);
          if (cached) {
            const accentNum = parseInt(cached.accent_color.replace("#", ""), 16);
            drawBotRoomFurniture(fGfx, accentNum, frameCount, tileToScreen);
          }
        }

        // Draw room ambient particles
        {
          const ambientAccent = lastDrawnRoom.startsWith("bot_room_")
            ? parseInt((botRoomCacheRef.current.get(lastDrawnRoom)?.accent_color || "#a855f7").replace("#", ""), 16)
            : undefined;
          drawRoomAmbient(fGfx, lastDrawnRoom, frameCount, tileToScreen, ambientAccent);
        }

        // Draw bots — filtered to current room
        botLayer.removeChildren();

        const map = localBotsRef.current;
        const entries = Array.from(map.values());
        const visibleRoomId = lastDrawnRoom;

        for (const lb of entries) {
          // Filter: only show bots in the viewed room
          const botRoom = lb.data.room_id || "lobby";
          if (botRoom !== visibleRoomId) continue;

          // Snap bot to their room's work position (behind the counter/booth/stove)
          // Offset slightly per bot so multiple bots don't perfectly overlap
          const roomDef = resolveRoom(botRoom);
          const workPos = roomDef.workPos;
          const botIndex = entries.filter((e) => (e.data.room_id || "lobby") === botRoom).indexOf(lb);
          lb.targetX = workPos.x + botIndex * 1.2;
          lb.targetY = workPos.y + botIndex * 0.5;

          // Smooth lerp at 0.03 for deliberate walking
          lb.x += (lb.targetX - lb.x) * 0.03;
          lb.y += (lb.targetY - lb.y) * 0.03;
          // Snap when close
          if (Math.abs(lb.targetX - lb.x) < 0.05 && Math.abs(lb.targetY - lb.y) < 0.05) {
            lb.x = lb.targetX;
            lb.y = lb.targetY;
          }

          const isMoving = Math.abs(lb.targetX - lb.x) > 0.1 || Math.abs(lb.targetY - lb.y) > 0.1;
          const { sx, sy } = tileToScreen(lb.x, lb.y);

          const progress = isMoving ? (frameCount % 60) / 60 : 0;
          // Walking bounce: faster, more pronounced. Idle: subtle
          const bounce = isMoving
            ? Math.sin(frameCount * 0.12) * 2.5
            : Math.sin(frameCount * 0.05) * 1;
          const container = new PIXI.Container();
          container.x = sx;
          container.y = sy - bounce;

          // Flip bot horizontally when walking left
          if (isMoving && lb.targetX < lb.x) {
            container.scale.x = -1;
          }

          // Idle behaviors — subtle fidgets and breathing for standing bots
          let idleFidgetX = 0;
          let idleFidgetY = 0;
          if (!isMoving) {
            // Breathing: very subtle scale oscillation
            const breathScale = 1.0 + Math.sin(frameCount * 0.02) * 0.005;
            container.scale.y = breathScale;

            // Every ~200 frames, roll an idle behavior
            const idleSeed = Math.floor(frameCount / 200);
            // Use bot id hash for deterministic per-bot randomness
            const botHash = lb.data.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
            const idleRoll = ((idleSeed + botHash) * 7919) % 100;

            if (idleRoll < 40) {
              // Look around — slight horizontal offset to simulate head turn
              const lookDir = ((idleSeed + botHash) % 2 === 0) ? 1 : -1;
              idleFidgetX = lookDir * 0.5;
            } else if (idleRoll < 70) {
              // Small fidget — tiny random position offset for 30 frames then return
              const fidgetFrame = frameCount % 200;
              if (fidgetFrame < 30) {
                const fidgetSeed = ((idleSeed + botHash) * 13) % 100;
                idleFidgetX = (fidgetSeed % 3 - 1) * 0.3;
                idleFidgetY = ((fidgetSeed + 7) % 3 - 1) * 0.3;
              }
            }
            // else: 30% nothing — just stand normally

            container.x += idleFidgetX;
            container.y += idleFidgetY;
          }

          container.eventMode = "static";
          container.cursor = "pointer";
          container.on("pointerdown", () => onBotClick(lb.data));

          // Away mode: semi-transparent
          const isAway = lb.data.status === "away";
          if (isAway) {
            container.alpha = 0.4;
          }

          // Mood aura — layered glow
          if (lb.data.mood) {
            const moodColors: Record<string, number> = {
              happy: 0xFFD700, focused: 0x3B82F6, tired: 0x6B7280, hyped: 0xEC4899, chill: 0x22C55E,
            };
            const moodColor = moodColors[lb.data.mood] || 0xFFD700;
            const pulse = 0.3 + Math.sin(frameCount * 0.05) * 0.15;
            const moodGfx = new PIXI.Graphics();
            // Outer glow (large, very transparent)
            moodGfx.ellipse(0, 12, 22, 8);
            moodGfx.fill({ color: moodColor, alpha: pulse * 0.3 });
            // Inner glow (smaller, more opaque)
            moodGfx.ellipse(0, 12, 14, 5);
            moodGfx.fill({ color: moodColor, alpha: pulse * 0.6 });
            // Core (brightest)
            moodGfx.ellipse(0, 12, 7, 3);
            moodGfx.fill({ color: moodColor, alpha: pulse * 0.4 });
            container.addChild(moodGfx);
          }

          const botGraphics = new PIXI.Graphics();
          drawHabboBot(botGraphics, lb.data, progress, 0, 0);

          // Draw outfit overlay
          if (lb.data.outfit) {
            const bobYVal = isMoving ? Math.sin(progress * Math.PI * 2) * 1.5 : 0;
            drawOutfit(botGraphics, lb.data.outfit as import("@/lib/clothing").BotOutfit, 0, 0, bobYVal);
          }

          const hasChefHat = lb.data.items?.some((i) => i.item_id === "chefs_hat");
          if (hasChefHat && !lb.data.outfit?.hat) {
            drawChefHat(botGraphics, 0, 0, isMoving ? Math.sin(progress * Math.PI * 2) * 1.5 : 0);
          }

          // Viewer highlight ring around linked bot
          if (highlightBotId && lb.data.id === highlightBotId) {
            const ring = new PIXI.Graphics();
            const pulse = 0.7 + Math.sin(frameCount * 0.08) * 0.3;
            ring.setStrokeStyle({ width: 2, color: 0x22c55e, alpha: pulse });
            ring.ellipse(0, 8, 18, 10);
            ring.stroke();
            container.addChild(ring);
          }

          container.addChild(botGraphics);

          // Name label — above the bot
          const accentNum = parseInt(lb.data.accent_color.replace("#", ""), 16);
          const nameLabel = new PIXI.Text({
            text: lb.data.name,
            style: {
              fontSize: 9,
              fill: accentNum,
              fontFamily: "monospace",
              fontWeight: "bold",
              dropShadow: {
                color: 0x000000,
                distance: 1,
                alpha: 1,
              },
            },
          });
          nameLabel.anchor.set(0.5, 1);
          const hasHat = hasChefHat || !!lb.data.outfit?.hat;
          nameLabel.y = hasHat ? -42 : -30;
          container.addChild(nameLabel);

          // Title label above name
          if (lb.data.active_title && TITLES[lb.data.active_title]) {
            const titleDef = TITLES[lb.data.active_title];
            const titleLabel = new PIXI.Text({
              text: titleDef.text,
              style: {
                fontSize: 7,
                fill: titleDef.color,
                fontFamily: "monospace",
                fontWeight: "bold",
                dropShadow: { color: 0x000000, distance: 1, alpha: 0.8 },
              },
            });
            titleLabel.anchor.set(0.5, 1);
            titleLabel.y = nameLabel.y - 10;
            container.addChild(titleLabel);
          }

          // Level badge
          if (lb.data.level && lb.data.level > 1) {
            const prestigePrefix = (lb.data.prestige_count || 0) > 0 ? "⭐" : "";
            const levelLabel = new PIXI.Text({
              text: `${prestigePrefix}Lv.${lb.data.level}`,
              style: {
                fontSize: 7,
                fill: accentNum,
                fontFamily: "monospace",
                fontWeight: "bold",
                dropShadow: { color: 0x000000, distance: 1, alpha: 0.8 },
              },
            });
            levelLabel.anchor.set(0.5, 1);
            levelLabel.y = nameLabel.y + 9;
            container.addChild(levelLabel);
          }

          // Streak fire emoji
          if (lb.data.streak && lb.data.streak >= 3) {
            const streakText = new PIXI.Text({
              text: "🔥",
              style: { fontSize: lb.data.streak >= 7 ? 12 : 8 },
            });
            streakText.anchor.set(1, 1);
            streakText.x = nameLabel.x - nameLabel.width / 2 - 2;
            streakText.y = nameLabel.y;
            container.addChild(streakText);
          }

          // Away sleep emoji
          if (isAway) {
            const sleepText = new PIXI.Text({
              text: "💤",
              style: { fontSize: 10 },
            });
            sleepText.anchor.set(0.5, 1);
            sleepText.y = hasHat ? -50 : -38;
            container.addChild(sleepText);
          }

          // Status text
          if (lb.data.status && !isAway) {
            const statusText = new PIXI.Text({
              text: lb.data.status,
              style: { fontSize: 8, fill: 0x888888, fontFamily: "monospace", fontStyle: "italic" },
            });
            statusText.anchor.set(0.5, 1);
            statusText.y = hasHat ? -50 : -38;
            container.addChild(statusText);
          }

          // Speech bubble — visible for 5 minutes, fades from 3-5 min
          if (lb.data.speech && lb.data.speech_at) {
            const ageMs = Date.now() - new Date(lb.data.speech_at).getTime();
            const fadeStart = 180000; // 3 min
            const fadeEnd = 300000;   // 5 min
            if (ageMs < fadeEnd) {
              const alpha = ageMs < fadeStart ? 1.0 : Math.max(0, 1 - (ageMs - fadeStart) / (fadeEnd - fadeStart));

              const truncated = lb.data.speech.length > 80 ? lb.data.speech.slice(0, 77) + "..." : lb.data.speech;
              const speechText = new PIXI.Text({
                text: truncated,
                style: { fontSize: 10, fill: 0x000000, fontFamily: "monospace", wordWrap: true, wordWrapWidth: 160 },
              });
              speechText.anchor.set(0.5, 1);

              const padding = 6;
              const bw = Math.min(speechText.width + padding * 2, 180);
              const bh = speechText.height + padding * 2;

              const bubbleY = hasHat ? -56 : -44;

              const bubbleContainer = new PIXI.Container();
              bubbleContainer.alpha = alpha;

              const bubble = new PIXI.Graphics();
              // Drop shadow
              bubble.roundRect(-bw / 2 + 2, -bh + bubbleY - 6, bw, bh, 10);
              bubble.fill({ color: 0x000000, alpha: 0.15 });
              // Main rounded rect
              bubble.roundRect(-bw / 2, -bh + bubbleY - 8, bw, bh, 10);
              bubble.fill({ color: 0xffffff });
              bubble.stroke({ width: 1.5, color: accentNum, alpha: 0.4 });
              // Triangle pointer
              bubble.poly([
                { x: -4, y: bubbleY - 8 },
                { x: 4, y: bubbleY - 8 },
                { x: 0, y: bubbleY - 2 },
              ]);
              bubble.fill({ color: 0xffffff });
              bubble.stroke({ width: 1, color: accentNum, alpha: 0.4 });
              bubbleContainer.addChild(bubble);

              speechText.y = bubbleY - 10;
              bubbleContainer.addChild(speechText);

              container.addChild(bubbleContainer);
            }
          }

          // Check-in sparkle animation
          if (lb.data.checked_in_at) {
            const checkinAge = (Date.now() - new Date(lb.data.checked_in_at).getTime()) / 1000;
            if (checkinAge < 5) {
              const sparkleGfx = new PIXI.Graphics();
              const sparkleCount = 6;
              for (let si = 0; si < sparkleCount; si++) {
                const angle = (si / sparkleCount) * Math.PI * 2 + frameCount * 0.1;
                const radius = 8 + checkinAge * 6;
                const sparkleAlpha = Math.max(0, 1 - checkinAge / 5);
                const sx2 = Math.cos(angle) * radius;
                const sy2 = Math.sin(angle) * radius * 0.5 - 8;
                sparkleGfx.circle(sx2, sy2, 2 - checkinAge * 0.3);
                sparkleGfx.fill({ color: 0xFFD700, alpha: sparkleAlpha });
              }
              container.addChild(sparkleGfx);
            }
          }

          // Emote floating animation
          if (lb.data.emote && lb.data.emote_at) {
            const emoteAge = (Date.now() - new Date(lb.data.emote_at).getTime()) / 1000;
            if (emoteAge < 5) {
              const emoteMap: Record<string, string> = {
                wave: "👋", dance: "💃", cheer: "🎉", shrug: "🤷", sleep: "💤",
              };
              const emoteChar = emoteMap[lb.data.emote] || "✨";
              const emoteText = new PIXI.Text({
                text: emoteChar,
                style: { fontSize: 16 },
              });
              emoteText.anchor.set(0.5, 0.5);

              const bubbleBaseY = hasHat ? -66 : -54;

              if (lb.data.emote === "wave") {
                // Float up and fade
                emoteText.y = bubbleBaseY - emoteAge * 8;
                emoteText.alpha = Math.max(0, 1 - emoteAge / 3);
              } else if (lb.data.emote === "dance") {
                // Bounce side to side
                emoteText.x = Math.sin(frameCount * 0.15) * 8;
                emoteText.y = bubbleBaseY;
                emoteText.alpha = Math.max(0, 1 - emoteAge / 5);
              } else if (lb.data.emote === "cheer") {
                // Explode outward
                const scale = 1 + emoteAge * 0.5;
                emoteText.scale.set(scale);
                emoteText.y = bubbleBaseY - emoteAge * 4;
                emoteText.alpha = emoteAge < 2 ? Math.max(0, 1 - emoteAge / 2) : 0;
              } else if (lb.data.emote === "shrug") {
                // Float up, stay 2s
                emoteText.y = bubbleBaseY - Math.min(emoteAge, 0.5) * 10;
                emoteText.alpha = emoteAge > 2 ? Math.max(0, 1 - (emoteAge - 2) / 1) : 1;
              } else if (lb.data.emote === "sleep") {
                // Drift upward slowly
                emoteText.y = bubbleBaseY - emoteAge * 4;
                emoteText.alpha = Math.max(0, 1 - emoteAge / 5);
              }

              container.addChild(emoteText);
            }
          }

          // Pet companion
          if (lb.data.pet) {
            const petEmojis: Record<string, string> = {
              cat: "🐱", dog: "🐶", dragon: "🐉", robot: "🤖", ghost: "👻",
            };
            const petBounce = isMoving ? -Math.sin(frameCount * 0.15) * 2 : Math.sin(frameCount * 0.08) * 1;
            const petText = new PIXI.Text({
              text: petEmojis[lb.data.pet.pet_type] || "🐾",
              style: { fontSize: 12 },
            });
            petText.anchor.set(0.5, 0.5);
            petText.x = 20;
            petText.y = 5 + petBounce;
            container.addChild(petText);
          }

          botLayer.addChild(container);
        }

        botLayer.children.sort((a, b) => a.y - b.y);

        // Draw atmosphere overlay
        atmosphereGraphics.clear();
        const tod = currentTimeOfDay;
        if (tod !== "day") {
          const overlayConfig = {
            dawn: { color: 0xFF8C00, alpha: 0.10 },
            dusk: { color: 0xFFD700, alpha: 0.12 },
            night: { color: 0x00003A, alpha: 0.22 },
          };
          const cfg = overlayConfig[tod];
          // Cover the full isometric area
          const topLeft = tileToScreen(0, 0);
          const topRight = tileToScreen(GRID_W, 0);
          const bottomRight = tileToScreen(GRID_W, GRID_H);
          const bottomLeft = tileToScreen(0, GRID_H);
          atmosphereGraphics.poly([
            { x: topLeft.sx, y: topLeft.sy - 80 },
            { x: topRight.sx, y: topRight.sy - 80 },
            { x: bottomRight.sx, y: bottomRight.sy + 40 },
            { x: bottomLeft.sx, y: bottomLeft.sy + 40 },
          ]);
          atmosphereGraphics.fill({ color: cfg.color, alpha: cfg.alpha });
        }

        // Seasonal tint overlay (lobby only)
        if (lastDrawnRoom === "lobby") {
          const season = getCurrentSeason();
          const sCfg = SEASON_CONFIG[season];
          const topLeftS = tileToScreen(0, 0);
          const topRightS = tileToScreen(GRID_W, 0);
          const bottomRightS = tileToScreen(GRID_W, GRID_H);
          const bottomLeftS = tileToScreen(0, GRID_H);
          atmosphereGraphics.poly([
            { x: topLeftS.sx, y: topLeftS.sy - 80 },
            { x: topRightS.sx, y: topRightS.sy - 80 },
            { x: bottomRightS.sx, y: bottomRightS.sy + 40 },
            { x: bottomLeftS.sx, y: bottomLeftS.sy + 40 },
          ]);
          atmosphereGraphics.fill({ color: sCfg.wallTint, alpha: sCfg.ambientAlpha });
        }

        // Crowd red tint when >= 80% capacity
        if (crowdRatioRef.current >= 0.8) {
          const crowdAlpha = 0.08 + Math.sin(frameCount * 0.03) * 0.04;
          const topLeft2 = tileToScreen(0, 0);
          const topRight2 = tileToScreen(GRID_W, 0);
          const bottomRight2 = tileToScreen(GRID_W, GRID_H);
          const bottomLeft2 = tileToScreen(0, GRID_H);
          atmosphereGraphics.poly([
            { x: topLeft2.sx, y: topLeft2.sy - 80 },
            { x: topRight2.sx, y: topRight2.sy - 80 },
            { x: bottomRight2.sx, y: bottomRight2.sy + 40 },
            { x: bottomLeft2.sx, y: bottomLeft2.sy + 40 },
          ]);
          atmosphereGraphics.fill({ color: 0xff0000, alpha: crowdAlpha });
        }
      });

      // Recheck time of day every 60 seconds
      todInterval = setInterval(() => {
        currentTimeOfDay = getTimeOfDay();
      }, 60000);

      setReady(true);

      poll();
      interval = setInterval(poll, 2000);
    })();

    return () => {
      destroyed = true;
      clearInterval(interval);
      clearInterval(todInterval);
      if (appRef.current) {
        (appRef.current as { destroy: (b: boolean) => void }).destroy(true);
        appRef.current = null;
      }
    };
  }, [poll, onBotClick]);

  const ambientConfig: Record<string, { bars: number; color: string; speed: string }> = {
    lobby: { bars: 3, color: "#f59e0b", speed: "1s" },
    kitchen: { bars: 3, color: "#ff6b35", speed: "1.4s" },
    dancefloor: { bars: 5, color: "#a855f7", speed: "0.5s" },
    store: { bars: 0, color: "", speed: "" },
    bar: { bars: 3, color: "#8B6914", speed: "1.2s" },
    studio: { bars: 2, color: "#EC4899", speed: "1.6s" },
    bank: { bars: 0, color: "", speed: "" },
    gym: { bars: 4, color: "#ef4444", speed: "0.8s" },
    library: { bars: 0, color: "", speed: "" },
    casino: { bars: 3, color: "#ffd700", speed: "0.6s" },
    theater: { bars: 2, color: "#ff4444", speed: "1.4s" },
    rooftop: { bars: 0, color: "", speed: "" },
  };

  const ambient = ambientConfig[viewRoom] || ambientConfig.lobby;

  return (
    <div ref={canvasRef} className="flex-1 w-full bg-[#060712] relative">
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm">
          Loading world...
        </div>
      )}
      {ready && ambient.bars > 0 && (
        <div className="absolute top-3 right-3 flex items-end gap-[2px] opacity-40">
          <span className="text-[10px] mr-1" style={{ color: ambient.color }}>🔊</span>
          {Array.from({ length: ambient.bars }).map((_, i) => (
            <div
              key={i}
              className="w-[3px] rounded-sm animate-bounce"
              style={{
                backgroundColor: ambient.color,
                height: `${8 + Math.random() * 8}px`,
                animationDuration: ambient.speed,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
