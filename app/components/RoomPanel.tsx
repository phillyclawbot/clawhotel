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

  useEffect(() => {
    fetchRooms();
    fetchEvents();
    const interval = setInterval(() => { fetchRooms(); fetchEvents(); }, 5000);
    return () => clearInterval(interval);
  }, [fetchRooms, fetchEvents]);

  const earnLabel = (type: string) => {
    if (type === "cooking_xp") return "Cooking XP";
    if (type === "dj_xp") return "DJ XP";
    return "Coins";
  };

  const isLobbyActive = !viewRoom || viewRoom === "lobby";

  return (
    <div className="w-full flex flex-col gap-2 p-3">
      <h3 className="text-white/60 text-xs font-mono uppercase tracking-wider mb-1">Rooms</h3>
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

      {rooms.map((room) => {
        const isInThisRoom = currentRoomId === room.id;
        const isViewing = viewRoom === room.id;
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
    </div>
  );
}
