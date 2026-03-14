"use client";

import { useEffect, useRef, useCallback, useState } from "react";

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
  const appRef = useRef<unknown>(null);
  const [ready, setReady] = useState(false);

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

      // Remove bots that went offline
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

      if (destroyed || !canvasRef.current) return;

      const app = new PIXI.Application();
      await app.init({
        background: 0x0a0a0a,
        resizeTo: canvasRef.current,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (destroyed) {
        app.destroy(true);
        return;
      }

      canvasRef.current.appendChild(app.canvas as HTMLCanvasElement);
      appRef.current = app;

      // World container offset
      const world = new PIXI.Container();
      app.stage.addChild(world);

      function updateWorldPosition() {
        world.x = app.screen.width / 2;
        world.y = 80;
      }
      updateWorldPosition();

      // Draw floor tiles
      const floor = new PIXI.Graphics();
      world.addChild(floor);

      function drawFloor() {
        floor.clear();
        for (let gx = 0; gx < GRID_W; gx++) {
          for (let gy = 0; gy < GRID_H; gy++) {
            const { sx, sy } = tileToScreen(gx, gy);
            const color = (gx + gy) % 2 === 0 ? 0x1a1a1a : 0x1e1e1e;
            floor.poly([
              { x: sx, y: sy },
              { x: sx + TILE_W / 2, y: sy + TILE_H / 2 },
              { x: sx, y: sy + TILE_H },
              { x: sx - TILE_W / 2, y: sy + TILE_H / 2 },
            ]);
            floor.fill(color);
            floor.stroke({ width: 1, color: 0x252525 });
          }
        }
      }
      drawFloor();

      // Bot containers
      const botLayer = new PIXI.Container();
      world.addChild(botLayer);

      let frameCount = 0;

      app.ticker.add(() => {
        frameCount++;
        updateWorldPosition();

        // Clear and redraw bots
        botLayer.removeChildren();

        const map = localBotsRef.current;
        const entries = Array.from(map.values());
        for (const lb of entries) {
          // Lerp
          lb.x += (lb.targetX - lb.x) * 0.08;
          lb.y += (lb.targetY - lb.y) * 0.08;

          const isMoving = Math.abs(lb.targetX - lb.x) > 0.05 || Math.abs(lb.targetY - lb.y) > 0.05;
          const { sx, sy } = tileToScreen(lb.x, lb.y);

          const bounce = isMoving ? Math.sin(frameCount * 0.15) * 2 : 0;
          const container = new PIXI.Container();
          container.x = sx;
          container.y = sy - bounce;
          container.eventMode = "static";
          container.cursor = "pointer";
          container.on("pointerdown", () => onBotClick(lb.data));

          // Shadow
          const shadow = new PIXI.Graphics();
          shadow.ellipse(0, 18, 12, 4);
          shadow.fill({ color: 0x000000, alpha: 0.4 });
          container.addChild(shadow);

          // Body circle
          const body = new PIXI.Graphics();
          body.circle(0, 0, 20);
          body.fill(lb.data.accent_color);
          body.stroke({ width: 2, color: 0xffffff });
          container.addChild(body);

          // Emoji
          const emoji = new PIXI.Text({ text: lb.data.emoji, style: { fontSize: 16 } });
          emoji.anchor.set(0.5);
          emoji.y = -1;
          container.addChild(emoji);

          // Name label
          const nameLabel = new PIXI.Text({
            text: lb.data.name,
            style: { fontSize: 10, fill: 0xffffff, fontFamily: "monospace" },
          });
          nameLabel.anchor.set(0.5, 0);
          nameLabel.y = 24;
          container.addChild(nameLabel);

          // Status text
          if (lb.data.status) {
            const statusText = new PIXI.Text({
              text: lb.data.status,
              style: { fontSize: 9, fill: 0x888888, fontFamily: "monospace", fontStyle: "italic" },
            });
            statusText.anchor.set(0.5, 1);
            statusText.y = -28;
            container.addChild(statusText);
          }

          // Speech bubble
          if (lb.data.speech && lb.data.speech_at) {
            const elapsed = (Date.now() - new Date(lb.data.speech_at).getTime()) / 1000;
            if (elapsed < 8) {
              const alpha = elapsed > 6 ? 1 - (elapsed - 6) / 2 : 1;

              const speechText = new PIXI.Text({
                text: lb.data.speech.slice(0, 40),
                style: { fontSize: 10, fill: 0x000000, fontFamily: "monospace", wordWrap: true, wordWrapWidth: 120 },
              });
              speechText.anchor.set(0.5, 1);

              const padding = 6;
              const bw = speechText.width + padding * 2;
              const bh = speechText.height + padding * 2;

              const bubble = new PIXI.Graphics();
              bubble.roundRect(-bw / 2, -bh - 36, bw, bh, 6);
              bubble.fill({ color: 0xffffff, alpha });
              bubble.stroke({ width: 1, color: Number(lb.data.accent_color.replace("#", "0x")), alpha });
              container.addChild(bubble);

              speechText.y = -38;
              speechText.alpha = alpha;
              container.addChild(speechText);
            }
          }

          botLayer.addChild(container);
        }

        // Sort by y position for depth
        botLayer.children.sort((a, b) => a.y - b.y);
      });

      setReady(true);

      // Start polling
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
    <div ref={canvasRef} className="flex-1 w-full bg-[#0a0a0a] relative">
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm">
          Loading world...
        </div>
      )}
    </div>
  );
}
