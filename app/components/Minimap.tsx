"use client";

interface MinimapBot {
  id: string;
  emoji: string;
  room_id?: string;
}

interface MinimapRoom {
  id: string;
  name: string;
  emoji: string;
}

const ALL_ROOMS: MinimapRoom[] = [
  { id: "lobby", name: "Lobby", emoji: "🏨" },
  { id: "kitchen", name: "Kitchen", emoji: "🍳" },
  { id: "dancefloor", name: "Dance Floor", emoji: "🎧" },
  { id: "store", name: "Store", emoji: "🏪" },
];

export default function Minimap({
  bots,
  viewRoom,
  onSelectRoom,
  onClose,
}: {
  bots: MinimapBot[];
  viewRoom: string;
  onSelectRoom: (roomId: string) => void;
  onClose: () => void;
}) {
  const botsByRoom: Record<string, MinimapBot[]> = {};
  for (const b of bots) {
    const room = b.room_id || "lobby";
    if (!botsByRoom[room]) botsByRoom[room] = [];
    botsByRoom[room].push(b);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-end p-4 pointer-events-none">
      <div className="pointer-events-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="bg-[#0d0f1a]/95 border border-white/10 rounded-xl p-4 backdrop-blur-sm w-[280px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold text-sm">🗺️ Minimap</h3>
            <button onClick={onClose} className="text-white/40 hover:text-white text-sm">&times;</button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Lobby full width top */}
            <div
              className="col-span-3 rounded-lg p-2 cursor-pointer transition-all border"
              style={{
                borderColor: viewRoom === "lobby" ? "#f59e0b" : "rgba(255,255,255,0.08)",
                backgroundColor: viewRoom === "lobby" ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)",
                boxShadow: viewRoom === "lobby" ? "0 0 12px rgba(245,158,11,0.3)" : "none",
              }}
              onClick={() => { onSelectRoom("lobby"); onClose(); }}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏨</span>
                <div>
                  <p className="text-white text-xs font-bold">Lobby</p>
                  <p className="text-white/40 text-[10px]">{(botsByRoom["lobby"] || []).length} bots</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {(botsByRoom["lobby"] || []).slice(0, 3).map((b) => (
                    <span key={b.id} className="text-xs">{b.emoji}</span>
                  ))}
                  {(botsByRoom["lobby"] || []).length > 3 && (
                    <span className="text-[10px] text-white/30">+{(botsByRoom["lobby"] || []).length - 3}</span>
                  )}
                </div>
              </div>
            </div>

            {/* 3 rooms bottom row */}
            {ALL_ROOMS.slice(1).map((room) => {
              const roomBots = botsByRoom[room.id] || [];
              const isActive = viewRoom === room.id;
              return (
                <div
                  key={room.id}
                  className="rounded-lg p-2 cursor-pointer transition-all border"
                  style={{
                    borderColor: isActive ? "#f59e0b" : "rgba(255,255,255,0.08)",
                    backgroundColor: isActive ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)",
                    boxShadow: isActive ? "0 0 12px rgba(245,158,11,0.3)" : "none",
                  }}
                  onClick={() => { onSelectRoom(room.id); onClose(); }}
                >
                  <span className="text-2xl block text-center">{room.emoji}</span>
                  <p className="text-white text-[10px] font-bold text-center mt-1">{room.name}</p>
                  <p className="text-white/40 text-[10px] text-center">{roomBots.length} bots</p>
                  <div className="flex justify-center gap-0.5 mt-1">
                    {roomBots.slice(0, 3).map((b) => (
                      <span key={b.id} className="text-[10px]">{b.emoji}</span>
                    ))}
                    {roomBots.length > 3 && (
                      <span className="text-[10px] text-white/30">+{roomBots.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
