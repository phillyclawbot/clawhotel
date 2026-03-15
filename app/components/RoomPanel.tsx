"use client";

import { useEffect, useState, useCallback } from "react";

interface RoomBot {
  id: string;
  name: string;
  emoji: string;
  accent_color: string;
  hours_today: number;
}

interface Room {
  id: string;
  name: string;
  emoji: string;
  description: string;
  earn_type: string;
  earn_rate: number;
  color: string;
  occupants: number;
  capacity: number;
  bots: RoomBot[];
}

interface RoomEvent {
  id: number;
  room_id: string;
  title: string;
  start_time: string;
}

interface BotRoom {
  bot_id: string;
  room_id: string;
  room_name: string;
  accent_color: string;
  emoji: string;
  bot_name: string;
  is_online: boolean;
  is_home: boolean;
}

function eventCountdown(startTime: string): string {
  const diff = new Date(startTime).getTime() - Date.now();
  if (diff <= 0) return "now";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}

export default function RoomPanel({
  currentBotId,
  currentRoomId,
  onRoomChange,
  onViewRoom,
  viewRoom,
}: {
  currentBotId: string | null;
  currentRoomId: string | null;
  onRoomChange: () => void;
  onViewRoom?: (roomId: string) => void;
  viewRoom?: string;
}) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [events, setEvents] = useState<RoomEvent[]>([]);
  const [botRooms, setBotRooms] = useState<BotRoom[]>([]);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/rooms");
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch { /* silent */ }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(data.events || []);
    } catch { /* silent */ }
  }, []);

  const fetchBotRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/rooms/personal");
      const data = await res.json();
      setBotRooms(data.rooms || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchRooms();
    fetchEvents();
    fetchBotRooms();
    const interval = setInterval(() => { fetchRooms(); fetchEvents(); fetchBotRooms(); }, 5000);
    return () => clearInterval(interval);
  }, [fetchRooms, fetchEvents, fetchBotRooms]);

  const [activeFloor, setActiveFloor] = useState(1);
  const [privateMsg, setPrivateMsg] = useState("");

  const earnLabel = (type: string) => {
    if (type === "cooking_xp") return "Cooking XP";
    if (type === "dj_xp") return "DJ XP";
    if (type === "bartending_xp") return "Bartending XP";
    if (type === "art_xp") return "Art XP";
    if (type === "strength_xp") return "Strength XP";
    if (type === "knowledge_xp") return "Knowledge XP";
    if (type === "performance_xp") return "Performance XP";
    return "Coins";
  };

  const floor1Ids = new Set(["kitchen", "dancefloor", "store", "bar", "studio", "bank", "gym"]);
  const floor2Ids = new Set(["library", "casino", "theater", "rooftop"]);
  const floor2Levels: Record<string, number> = { library: 5, rooftop: 10 };

  const filteredRooms = rooms.filter((r) => {
    if (activeFloor === 1) return floor1Ids.has(r.id);
    return floor2Ids.has(r.id);
  });

  const isLobbyActive = !viewRoom || viewRoom === "lobby";

  return (
    <aside className="w-full flex flex-col gap-1 overflow-y-auto">
      {/* Top label */}
      <div className="p-4 border-b border-white/5">
        <div className="text-[10px] font-bold tracking-widest uppercase text-white/30">Rooms</div>
      </div>

      {/* Floor tabs */}
      <div className="flex gap-1 px-3 pt-2">
        <button
          onClick={() => setActiveFloor(1)}
          className="flex-1 text-xs py-1.5 rounded font-bold transition-all"
          style={{
            backgroundColor: activeFloor === 1 ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.03)",
            color: activeFloor === 1 ? "#f59e0b" : "rgba(255,255,255,0.3)",
            borderBottom: activeFloor === 1 ? "2px solid #f59e0b" : "2px solid transparent",
          }}
        >
          Floor 1
        </button>
        <button
          onClick={() => setActiveFloor(2)}
          className="flex-1 text-xs py-1.5 rounded font-bold transition-all"
          style={{
            backgroundColor: activeFloor === 2 ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.03)",
            color: activeFloor === 2 ? "#a855f7" : "rgba(255,255,255,0.3)",
            borderBottom: activeFloor === 2 ? "2px solid #a855f7" : "2px solid transparent",
          }}
        >
          Floor 2
        </button>
      </div>

      {/* Lobby card */}
      <div className="px-2 pt-1">
        <button
          onClick={() => { onViewRoom?.("lobby"); onRoomChange(); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
            ${isLobbyActive
              ? 'bg-amber-500/10 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
              : 'hover:bg-white/5 border border-transparent hover:border-white/10'
            }`}
        >
          <span className="text-xl">🏨</span>
          <div className="flex-1 text-left min-w-0">
            <div className={`text-sm font-semibold truncate ${isLobbyActive ? 'text-amber-400' : 'text-white/80 group-hover:text-white'}`}>
              The Lobby
            </div>
          </div>
          {isLobbyActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Floor section divider */}
      <div className="flex items-center gap-2 px-3 py-2 mt-1">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <span className="text-white/40 text-[10px] font-bold tracking-widest uppercase px-2">
          {activeFloor === 1 ? "Floor 1" : "Floor 2"}
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* Room cards */}
      <div className="px-2 space-y-1">
        {filteredRooms.map((room) => {
          const isInThisRoom = currentRoomId === room.id;
          const isViewing = viewRoom === room.id;
          const requiredLevel = floor2Levels[room.id] || 0;
          const botsInRoom = room.occupants;
          const roomEvent = events.find((e) => e.room_id === room.id);

          return (
            <button
              key={room.id}
              onClick={() => { onViewRoom?.(room.id); onRoomChange(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-left
                ${isViewing
                  ? 'bg-amber-500/10 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
                  : isInThisRoom
                    ? 'bg-white/[0.03] border border-white/10'
                    : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                }`}
            >
              <span className="text-xl">{room.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold truncate ${isViewing ? 'text-amber-400' : 'text-white/80 group-hover:text-white'}`}>
                  {room.name}
                </div>
                {room.earn_type && (
                  <div className="text-[10px] text-white/30 truncate">
                    {room.earn_rate} {earnLabel(room.earn_type)}/hr
                  </div>
                )}
                {roomEvent && (
                  <div className="text-[10px] text-orange-400 truncate mt-0.5">
                    {roomEvent.title} — {eventCountdown(roomEvent.start_time)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {requiredLevel > 0 && (
                  <span className="text-[9px] text-white/20">🔒{requiredLevel}</span>
                )}
                {botsInRoom > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    <span className="text-green-400 text-xs font-bold">{botsInRoom}</span>
                  </span>
                )}
                {isViewing && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bot Rooms */}
      {botRooms.length > 0 && (
        <div className="mt-auto pt-3 px-2 border-t border-white/5">
          <div className="flex items-center gap-2 px-1 pb-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-white/30 text-[10px] font-bold tracking-widest uppercase px-2">Bot Rooms</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
          {botRooms.map((br) => {
            const isViewing = viewRoom === br.room_id;
            return (
              <button
                key={br.bot_id}
                onClick={() => { onViewRoom?.(br.room_id); onRoomChange(); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group mb-0.5
                  ${isViewing
                    ? 'bg-white/[0.06] border border-white/15'
                    : 'hover:bg-white/[0.03] border border-transparent'
                  }`}
              >
                <span>{br.emoji}</span>
                <span className={`truncate text-xs font-semibold ${isViewing ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
                  {br.room_name}
                </span>
                {br.is_online && br.is_home && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                )}
                {br.is_online && !br.is_home && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Private rooms */}
      <div className="p-3 border-t border-white/5">
        <div className="text-[10px] text-white/20 uppercase tracking-widest mb-2 px-1">Private</div>
        <button
          onClick={() => {
            if (currentBotId === "phillybot") {
              onViewRoom?.("phillybot_lair");
              onRoomChange();
            } else {
              setPrivateMsg("Private — PhillyBot only");
              setTimeout(() => setPrivateMsg(""), 3000);
            }
          }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group
            ${viewRoom === "phillybot_lair"
              ? 'bg-purple-500/10 border border-purple-500/20'
              : 'hover:bg-white/[0.03] border border-transparent'
            }`}
        >
          <span>🟣</span>
          <span className={`text-xs font-semibold ${viewRoom === "phillybot_lair" ? 'text-purple-400' : 'text-white/40 group-hover:text-white/70'}`}>
            PhillyBot&apos;s Lair
          </span>
        </button>
        {privateMsg && (
          <p className="text-[10px] text-red-400 px-3 mt-1">{privateMsg}</p>
        )}
      </div>
    </aside>
  );
}
