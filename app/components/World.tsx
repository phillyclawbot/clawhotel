"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { FurnitureItem } from "@/lib/rooms";

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

export default function World({
  onBotsUpdate,
  onMessagesUpdate,
  onBotClick,
}: {
  onBotsUpdate: (bots: BotData[]) => void;
  onMessagesUpdate: (msgs: Message[]) => void;
  onBotClick: (bot: BotData) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const localBotsRef = useRef<Map<string, LocalBot>>(new Map());
  const furnitureRef = useRef<FurnitureItem[]>([]);
  const appRef = useRef<unknown>(null);
  const [ready, setReady] = useState(false);

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/world");
      const data = await res.json();
      const bots: BotData[] = data.bots;
      const messages: Message[] = data.messages;
      if (data.furniture) furnitureRef.current = data.furniture;

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
      const { drawHabboBot, drawFurniture, drawTile, drawWalls } = await import("@/lib/pixel");
      const { lobbyFurniture, furnitureEmoji } = await import("@/lib/rooms");
      furnitureRef.current = lobbyFurniture;

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
      app.stage.addChild(world);

      function updateWorldPosition() {
        world.x = app.screen.width / 2;
        world.y = 120;
      }
      updateWorldPosition();

      // ---- WALLS ----
      const wallsGraphics = new PIXI.Graphics();
      world.addChild(wallsGraphics);
      drawWalls(wallsGraphics, GRID_W, GRID_H, TILE_W, TILE_H, tileToScreen);

      // ---- FLOOR ----
      const floor = new PIXI.Graphics();
      world.addChild(floor);

      function drawFloor() {
        floor.clear();
        for (let gx = 0; gx < GRID_W; gx++) {
          for (let gy = 0; gy < GRID_H; gy++) {
            const { sx, sy } = tileToScreen(gx, gy);
            drawTile(floor, sx, sy, TILE_W, TILE_H, gx, gy);
          }
        }
      }
      drawFloor();

      // ---- FURNITURE LAYER ----
      const furnitureLayer = new PIXI.Container();
      world.addChild(furnitureLayer);

      // ---- BOT LAYER ----
      const botLayer = new PIXI.Container();
      world.addChild(botLayer);

      // ---- TOOLTIP ----
      const tooltipContainer = new PIXI.Container();
      tooltipContainer.visible = false;
      app.stage.addChild(tooltipContainer);

      const tooltipBg = new PIXI.Graphics();
      tooltipContainer.addChild(tooltipBg);
      const tooltipText = new PIXI.Text({ text: "", style: { fontSize: 11, fill: 0xffffff, fontFamily: "monospace" } });
      tooltipContainer.addChild(tooltipText);

      let frameCount = 0;

      app.ticker.add(() => {
        frameCount++;
        updateWorldPosition();

        // ---- Draw furniture ----
        furnitureLayer.removeChildren();
        const furnitureGraphics = new PIXI.Graphics();
        furnitureLayer.addChild(furnitureGraphics);

        const furniture = furnitureRef.current;
        const sortedFurniture = [...furniture].sort((a, b) => (a.tileX + a.tileY) - (b.tileX + b.tileY));

        for (const item of sortedFurniture) {
          const { sx, sy } = tileToScreen(item.tileX, item.tileY);
          drawFurniture(furnitureGraphics, item.type, sx, sy + TILE_H / 2, frameCount);

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

        // ---- Draw bots ----
        botLayer.removeChildren();

        const map = localBotsRef.current;
        const entries = Array.from(map.values());
        for (const lb of entries) {
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

          // Draw the pixel art bot
          const botGraphics = new PIXI.Graphics();
          drawHabboBot(botGraphics, lb.data, progress, 0, 0);
          container.addChild(botGraphics);

          // Emoji badge (top-right of head)
          const emojiBadge = new PIXI.Text({ text: lb.data.emoji, style: { fontSize: 12 } });
          emojiBadge.anchor.set(0.5);
          emojiBadge.x = 14;
          emojiBadge.y = -22;
          container.addChild(emojiBadge);

          // Name label (below character, accent color)
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
          nameLabel.anchor.set(0.5, 0);
          nameLabel.y = 30;
          container.addChild(nameLabel);

          // Status text (above head)
          if (lb.data.status) {
            const statusText = new PIXI.Text({
              text: lb.data.status,
              style: { fontSize: 8, fill: 0x888888, fontFamily: "monospace", fontStyle: "italic" },
            });
            statusText.anchor.set(0.5, 1);
            statusText.y = -38;
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

              const bubble = new PIXI.Graphics();
              bubble.roundRect(-bw / 2, -bh - 44, bw, bh, 6);
              bubble.fill({ color: 0xffffff, alpha });
              bubble.stroke({ width: 1.5, color: accentNum, alpha });
              // Bubble tail
              bubble.poly([
                { x: -3, y: -44 },
                { x: 3, y: -44 },
                { x: 0, y: -40 },
              ]);
              bubble.fill({ color: 0xffffff, alpha });
              container.addChild(bubble);

              speechText.y = -46;
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
