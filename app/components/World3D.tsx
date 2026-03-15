"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import { Suspense } from "react";
import Room3D from "./three/Room3D";
import Bot3D from "./three/Bot3D";
import Lights from "./three/Lights";
import { ROOMS } from "@/lib/rooms";

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

interface WorldProps {
  onBotsUpdate: (bots: BotData[]) => void;
  onMessagesUpdate: (msgs: Message[]) => void;
  onBotClick: (bot: BotData) => void;
  viewRoom: string;
  highlightBotId?: string | null;
}

const GRID_COLS = 12;
const GRID_ROWS = 10;

export default function World3D({
  onBotsUpdate,
  onMessagesUpdate,
  onBotClick,
  viewRoom,
  highlightBotId,
}: WorldProps) {
  const [bots, setBots] = useState<BotData[]>([]);
  const [fading, setFading] = useState(false);
  const [activeRoom, setActiveRoom] = useState(viewRoom);
  const prevRoomRef = useRef(viewRoom);

  // Poll /api/world for bot data
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const res = await fetch("/api/world");
        if (!res.ok) return;
        const data = await res.json();
        if (!alive) return;
        const botList: BotData[] = data.bots || [];
        setBots(botList);
        onBotsUpdate(botList);
        if (data.messages) onMessagesUpdate(data.messages);
      } catch {
        // ignore
      }
    };
    poll();
    const interval = setInterval(poll, 2000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [onBotsUpdate, onMessagesUpdate]);

  // Room transition with fade
  useEffect(() => {
    if (viewRoom !== prevRoomRef.current) {
      setFading(true);
      const timer = setTimeout(() => {
        setActiveRoom(viewRoom);
        prevRoomRef.current = viewRoom;
        setTimeout(() => setFading(false), 50);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [viewRoom]);

  const handleBotClick = useCallback(
    (bot: BotData) => {
      onBotClick(bot);
    },
    [onBotClick]
  );

  const roomBots = bots.filter((b) => b.room_id === activeRoom);

  // Get room info for grid dimensions
  const room = ROOMS[activeRoom];
  const rows = room ? room.grid.length : GRID_ROWS;
  const cols = room ? room.grid[0].length : GRID_COLS;

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        className="w-full h-full"
        style={{ background: "#0a0b1a" }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
      >
        <OrthographicCamera
          makeDefault
          position={[10, 10, 10]}
          zoom={40}
          near={0.1}
          far={100}
        />

        <fog attach="fog" args={["#0a0b1a", 15, 30]} />

        <Lights roomId={activeRoom} />

        <Suspense fallback={null}>
          <Room3D roomId={activeRoom} />
          {roomBots.map((bot) => (
            <Bot3D
              key={bot.id}
              bot={bot}
              onClick={() => handleBotClick(bot)}
              cols={cols}
              rows={rows}
            />
          ))}
        </Suspense>
      </Canvas>

      {/* Fade overlay for room transitions */}
      <div
        className="absolute inset-0 pointer-events-none bg-black transition-opacity duration-300"
        style={{ opacity: fading ? 1 : 0 }}
      />

      {/* Room name overlay */}
      <div className="absolute top-3 left-3 pointer-events-none z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 backdrop-blur-sm text-sm">
          <span>{room?.emoji || "🏨"}</span>
          <span className="text-white font-bold">{room?.name || activeRoom}</span>
          <span className="text-white/40 text-xs">{roomBots.length} bots</span>
        </div>
      </div>
    </div>
  );
}
