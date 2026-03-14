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
  items?: BotItem[];
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
};

export default function World({
  onBotsUpdate,
  onMessagesUpdate,
  onBotClick,
  viewRoom,
}: {
  onBotsUpdate: (bots: BotData[]) => void;
  onMessagesUpdate: (msgs: Message[]) => void;
  onBotClick: (bot: BotData) => void;
  viewRoom: string;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const localBotsRef = useRef<Map<string, LocalBot>>(new Map());
  const appRef = useRef<unknown>(null);
  const worldContainerRef = useRef<unknown>(null);
  const currentRoomRef = useRef<string>(viewRoom);
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
          });
        }
      }

      Array.from(map.keys()).forEach((key) => {
        if (!seen.has(key)) map.delete(key);
      });
    } catch {
      // silent fail on poll
    }
  }, [onBotsUpdate, onMessagesUpdate]);

  useEffect(() => {
    let destroyed = false;
    let interval: ReturnType<typeof setInterval>;

    (async () => {
      const PIXI = await import("pixi.js");
      const { drawHabboBot, drawFurniture, drawRoomFloor, drawRoomWalls, drawChefHat } = await import("@/lib/pixel");
      const { ROOMS, furnitureEmoji } = await import("@/lib/rooms");

      if (destroyed || !canvasRef.current) return;

      const app = new PIXI.Application();
      await app.init({
        background: 0x0d0d1a,
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

      // Tooltip
      const tooltipContainer = new PIXI.Container();
      tooltipContainer.visible = false;
      app.stage.addChild(tooltipContainer);

      const tooltipBg = new PIXI.Graphics();
      tooltipContainer.addChild(tooltipBg);
      const tooltipText = new PIXI.Text({ text: "", style: { fontSize: 11, fill: 0xffffff, fontFamily: "monospace" } });
      tooltipContainer.addChild(tooltipText);

      let lastDrawnRoom = "";

      function drawScene(roomId: string) {
        const room = ROOMS[roomId] || ROOMS.lobby;

        wallsGraphics.clear();
        drawRoomWalls(wallsGraphics, room, GRID_W, GRID_H, TILE_W, TILE_H, tileToScreen);

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
        const activeRoom = ROOMS[lastDrawnRoom] || ROOMS.lobby;
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
          const roomDef = ROOMS[botRoom] || ROOMS.lobby;
          const workPos = roomDef.workPos;
          const botIndex = entries.filter((e) => (e.data.room_id || "lobby") === botRoom).indexOf(lb);
          lb.targetX = workPos.x + botIndex * 1.2;
          lb.targetY = workPos.y + botIndex * 0.5;

          lb.x += (lb.targetX - lb.x) * 0.08;
          lb.y += (lb.targetY - lb.y) * 0.08;

          const isMoving = Math.abs(lb.targetX - lb.x) > 0.05 || Math.abs(lb.targetY - lb.y) > 0.05;
          const { sx, sy } = tileToScreen(lb.x, lb.y);

          const progress = isMoving ? (frameCount % 60) / 60 : 0;
          const bounce = isMoving ? Math.sin(frameCount * 0.15) * 2 : 0;
          const container = new PIXI.Container();
          container.x = sx;
          container.y = sy - bounce;
          container.eventMode = "static";
          container.cursor = "pointer";
          container.on("pointerdown", () => onBotClick(lb.data));

          const botGraphics = new PIXI.Graphics();
          drawHabboBot(botGraphics, lb.data, progress, 0, 0);

          const hasChefHat = lb.data.items?.some((i) => i.item_id === "chefs_hat");
          if (hasChefHat) {
            drawChefHat(botGraphics, 0, 0, isMoving ? Math.sin(progress * Math.PI * 2) * 1.5 : 0);
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
          nameLabel.y = hasChefHat ? -42 : -30;
          container.addChild(nameLabel);

          // Status text
          if (lb.data.status) {
            const statusText = new PIXI.Text({
              text: lb.data.status,
              style: { fontSize: 8, fill: 0x888888, fontFamily: "monospace", fontStyle: "italic" },
            });
            statusText.anchor.set(0.5, 1);
            statusText.y = hasChefHat ? -50 : -38;
            container.addChild(statusText);
          }

          // Speech bubble
          if (lb.data.speech && lb.data.speech_at) {
            const elapsed = (Date.now() - new Date(lb.data.speech_at).getTime()) / 1000;
            if (elapsed < 8) {
              const alpha = elapsed > 6 ? 1 - (elapsed - 6) / 2 : 1;

              const speechText = new PIXI.Text({
                text: lb.data.speech.slice(0, 40),
                style: { fontSize: 9, fill: 0x000000, fontFamily: "monospace", wordWrap: true, wordWrapWidth: 110 },
              });
              speechText.anchor.set(0.5, 1);

              const padding = 6;
              const bw = speechText.width + padding * 2;
              const bh = speechText.height + padding * 2;

              const bubbleY = hasChefHat ? -56 : -44;
              const bubble = new PIXI.Graphics();
              bubble.roundRect(-bw / 2, -bh + bubbleY - 2, bw, bh, 6);
              bubble.fill({ color: 0xffffff, alpha });
              bubble.stroke({ width: 1.5, color: accentNum, alpha });
              bubble.poly([
                { x: -3, y: bubbleY - 2 },
                { x: 3, y: bubbleY - 2 },
                { x: 0, y: bubbleY + 2 },
              ]);
              bubble.fill({ color: 0xffffff, alpha });
              container.addChild(bubble);

              speechText.y = bubbleY - 4;
              speechText.alpha = alpha;
              container.addChild(speechText);
            }
          }

          botLayer.addChild(container);
        }

        botLayer.children.sort((a, b) => a.y - b.y);
      });

      setReady(true);

      poll();
      interval = setInterval(poll, 2000);
    })();

    return () => {
      destroyed = true;
      clearInterval(interval);
      if (appRef.current) {
        (appRef.current as { destroy: (b: boolean) => void }).destroy(true);
        appRef.current = null;
      }
    };
  }, [poll, onBotClick]);

  return (
    <div ref={canvasRef} className="flex-1 w-full bg-[#0d0d1a] relative">
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm">
          Loading world...
        </div>
      )}
    </div>
  );
}
