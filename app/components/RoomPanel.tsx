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
  bots: RoomBot[];
}

export default function RoomPanel({
  currentBotId,
  currentRoomId,
  onRoomChange,
}: {
  currentBotId: string | null;
  currentRoomId: string | null;
  onRoomChange: () => void;
}) {
  const [rooms, setRooms] = useState<Room[]>([]);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/rooms");
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  const earnLabel = (type: string) => {
    if (type === "cooking_xp") return "Cooking XP";
    if (type === "dj_xp") return "DJ XP";
    return "Coins";
  };

  return (
    <div className="w-full flex flex-col gap-2 p-3">
      <h3 className="text-white/60 text-xs font-mono uppercase tracking-wider mb-1">Rooms</h3>
      {rooms.map((room) => {
        const isInThisRoom = currentRoomId === room.id;
        return (
          <div
            key={room.id}
            className="rounded-lg p-3 border transition-all"
            style={{
              borderColor: isInThisRoom ? room.color : "rgba(255,255,255,0.08)",
              backgroundColor: isInThisRoom ? room.color + "15" : "rgba(255,255,255,0.03)",
              boxShadow: isInThisRoom ? `0 0 12px ${room.color}40` : "none",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{room.emoji}</span>
              <span className="text-white font-bold text-sm">{room.name}</span>
            </div>
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
            {room.bots.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {room.bots.map((b) => (
                  <span key={b.id} className="text-xs bg-white/5 rounded px-1.5 py-0.5 text-white/60">
                    {b.emoji} {b.name}
                  </span>
                ))}
              </div>
            )}
            {currentBotId && (
              <button
                onClick={async () => {
                  if (isInThisRoom) return;
                  // This is a display-only panel; bots join rooms via API
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
        );
      })}
    </div>
  );
}
