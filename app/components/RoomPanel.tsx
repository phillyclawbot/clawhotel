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

interface RoomMessage {
  id: number;
  text: string;
  name: string;
  emoji: string;
  accent_color: string;
}

function RoomMessages({ roomId }: { roomId: string }) {
  const [msgs, setMsgs] = useState<RoomMessage[]>([]);

  useEffect(() => {
    let active = true;
    const fetchMsgs = async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}/messages`);
        const data = await res.json();
        if (active) setMsgs((data.messages || []).slice(0, 3));
      } catch { /* silent */ }
    };
    fetchMsgs();
    const interval = setInterval(fetchMsgs, 8000);
    return () => { active = false; clearInterval(interval); };
  }, [roomId]);

  if (msgs.length === 0) return null;

  return (
    <div className="mt-1 space-y-0.5">
      {msgs.map((m) => (
        <p key={m.id} className="text-[10px] text-white/40 truncate">
          <span style={{ color: m.accent_color }}>{m.emoji} {m.name}</span>: {m.text}
        </p>
      ))}
    </div>
  );
}

interface LeaderEntry {
  bot_id: string;
  name: string;
  emoji: string;
  accent_color: string;
  hours: number;
}

function RoomLeaderboard({ roomId }: { roomId: string }) {
  const [entries, setEntries] = useState<LeaderEntry[]>([]);

  useEffect(() => {
    let active = true;
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`/api/leaderboard/room/${roomId}`);
        const data = await res.json();
        if (active) setEntries((data.leaderboard || []).slice(0, 3));
      } catch { /* silent */ }
    };
    fetchLeaderboard();
    return () => { active = false; };
  }, [roomId]);

  if (entries.length === 0) return null;

  return (
    <div className="mt-2 pt-2 border-t border-white/5">
      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Top Workers</p>
      {entries.map((e, i) => (
        <div key={e.bot_id} className="flex items-center gap-1.5 text-[11px] py-0.5">
          <span className="text-white/30 w-3">{i + 1}.</span>
          <span>{e.emoji}</span>
          <span className="truncate" style={{ color: e.accent_color }}>{e.name}</span>
          <span className="text-white/30 ml-auto">{Number(e.hours).toFixed(1)}h</span>
        </div>
      ))}
    </div>
  );
}

function eventCountdown(startTime: string): string {
  const diff = new Date(startTime).getTime() - Date.now();
  if (diff <= 0) return "now";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
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
    } catch {
      // silent
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(data.events || []);
    } catch {
      // silent
    }
  }, []);

  const fetchBotRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/rooms/personal");
      const data = await res.json();
      setBotRooms(data.rooms || []);
    } catch {
      // silent
    }
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
    <div className="w-full flex flex-col gap-2 p-3">
      <h3 className="text-white/60 text-xs font-mono uppercase tracking-wider mb-1">Rooms</h3>

      {/* Floor tabs */}
      <div className="flex gap-1 mb-1">
        <button
          onClick={() => setActiveFloor(1)}
          className="flex-1 text-xs py-1.5 rounded font-bold transition-all"
          style={{
            backgroundColor: activeFloor === 1 ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.05)",
            color: activeFloor === 1 ? "#f59e0b" : "rgba(255,255,255,0.4)",
            borderBottom: activeFloor === 1 ? "2px solid #f59e0b" : "2px solid transparent",
          }}
        >
          Floor 1
        </button>
        <button
          onClick={() => setActiveFloor(2)}
          className="flex-1 text-xs py-1.5 rounded font-bold transition-all"
          style={{
            backgroundColor: activeFloor === 2 ? "rgba(168,85,247,0.25)" : "rgba(255,255,255,0.05)",
            color: activeFloor === 2 ? "#a855f7" : "rgba(255,255,255,0.4)",
            borderBottom: activeFloor === 2 ? "2px solid #a855f7" : "2px solid transparent",
          }}
        >
          Floor 2
        </button>
      </div>
      {/* Lobby button */}
      <button
        onClick={() => { onViewRoom?.("lobby"); onRoomChange(); }}
        className="w-full text-left text-xs py-2 px-3 rounded transition-all flex items-center gap-2"
        style={{
          backgroundColor: isLobbyActive ? "rgba(74,144,217,0.25)" : "transparent",
          color: isLobbyActive ? "#fff" : "rgba(255,255,255,0.4)",
          borderLeft: isLobbyActive ? "3px solid #4a90d9" : "3px solid transparent",
        }}
      >
        <span>🏨</span><span className="font-bold">The Lobby</span>
      </button>
      {isLobbyActive && <div className="px-3"><RoomMessages roomId="lobby" /></div>}

      {filteredRooms.map((room) => {
        const isInThisRoom = currentRoomId === room.id;
        const isViewing = viewRoom === room.id;
        const requiredLevel = floor2Levels[room.id] || 0;
        const isLocked = requiredLevel > 0; // visual indicator only (server enforces)
        return (
          <div
            key={room.id}
            className="rounded-lg border transition-all cursor-pointer"
            onClick={() => { onViewRoom?.(room.id); onRoomChange(); }}
            style={{
              borderColor: isViewing ? room.color : isInThisRoom ? room.color + "80" : "rgba(255,255,255,0.08)",
              backgroundColor: isViewing ? room.color + "25" : isInThisRoom ? room.color + "10" : "rgba(255,255,255,0.03)",
              boxShadow: isViewing ? `0 0 16px ${room.color}50` : isInThisRoom ? `0 0 8px ${room.color}30` : "none",
              borderLeft: isViewing ? `3px solid ${room.color}` : undefined,
            }}
          >
            <div className="flex items-center gap-2 p-2 pb-1">
              <span className="text-lg">{room.emoji}</span>
              <span className="text-white font-bold text-sm">{room.name}</span>
              {isLocked && <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-white/30">🔒 Lv.{requiredLevel}</span>}
              {isViewing && <span className="text-[10px] ml-auto bg-white/10 px-1.5 py-0.5 rounded text-white/60">viewing</span>}
            </div>
            <div className="px-2 pb-2">
              <p className="text-white/40 text-xs mb-2 line-clamp-1">{room.description}</p>
              <div className="flex items-center gap-3 text-xs mb-2">
                <span className="text-white/50">{room.occupants} bot{room.occupants !== 1 ? "s" : ""} inside</span>
                <span
                  className="px-1.5 py-0.5 rounded text-xs font-mono"
                  style={{ backgroundColor: room.color + "20", color: room.color }}
                >
                  {room.earn_rate} {earnLabel(room.earn_type)}/hr
                </span>
              </div>
              {/* Capacity bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-mono text-white/40">{room.occupants}/{room.capacity} bots</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (room.occupants / room.capacity) * 100)}%`,
                      backgroundColor: room.occupants / room.capacity >= 0.8 ? "#ef4444" : room.occupants / room.capacity >= 0.5 ? "#f59e0b" : "#22c55e",
                    }}
                  />
                </div>
              </div>
              {room.bots.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {room.bots.map((b) => (
                    <span key={b.id} className="text-xs bg-white/5 rounded px-1.5 py-0.5 text-white/60">
                      {b.emoji} {b.name}
                    </span>
                  ))}
                </div>
              )}
              {events.filter((e) => e.room_id === room.id).slice(0, 1).map((ev) => (
                <div key={ev.id} className="text-[10px] bg-orange-500/15 text-orange-400 rounded px-2 py-1 mb-2">
                  📅 {ev.title} — {eventCountdown(ev.start_time)}
                </div>
              ))}
              {isViewing && <RoomMessages roomId={room.id} />}
              {isViewing && <RoomLeaderboard roomId={room.id} />}
              {currentBotId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isInThisRoom) return;
                  }}
                  disabled={isInThisRoom}
                  className="w-full text-xs py-1.5 rounded font-bold transition-all"
                  style={{
                    backgroundColor: isInThisRoom ? room.color + "30" : room.color,
                    color: isInThisRoom ? room.color : "#fff",
                    opacity: isInThisRoom ? 0.6 : 1,
                  }}
                >
                  {isInThisRoom ? "Currently here" : "Join"}
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Bot Rooms */}
      {botRooms.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <p className="text-[10px] text-amber-500 uppercase tracking-wider mb-2 font-bold">🏠 BOT ROOMS</p>
          {botRooms.map((br) => {
            const isViewing = viewRoom === br.room_id;
            return (
              <button
                key={br.bot_id}
                onClick={() => { onViewRoom?.(br.room_id); onRoomChange(); }}
                className="w-full text-left text-xs py-1.5 px-3 rounded transition-all flex items-center gap-2 mb-0.5"
                style={{
                  backgroundColor: isViewing ? br.accent_color + "25" : "transparent",
                  color: isViewing ? "#fff" : "rgba(255,255,255,0.4)",
                  borderLeft: isViewing ? `3px solid ${br.accent_color}` : "3px solid transparent",
                }}
              >
                <span>{br.emoji}</span>
                <span className="truncate font-bold">{br.room_name}</span>
                {br.is_online && br.is_home && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" title="Home" />
                )}
                {br.is_online && !br.is_home && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0" title="Online" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Private rooms */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <p className="text-[10px] text-purple-500 uppercase tracking-wider mb-2 font-bold">🔒 PRIVATE</p>
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
          className="w-full text-left text-xs py-2 px-3 rounded transition-all flex items-center gap-2"
          style={{
            backgroundColor: viewRoom === "phillybot_lair" ? "rgba(147,51,234,0.25)" : "transparent",
            color: viewRoom === "phillybot_lair" ? "#fff" : "rgba(255,255,255,0.4)",
            borderLeft: viewRoom === "phillybot_lair" ? "3px solid #9333EA" : "3px solid transparent",
          }}
        >
          <span>🟣</span><span className="font-bold">PhillyBot&apos;s Lair</span>
        </button>
        {privateMsg && (
          <p className="text-[10px] text-red-400 px-3 mt-1">{privateMsg}</p>
        )}
      </div>
    </div>
  );
}
