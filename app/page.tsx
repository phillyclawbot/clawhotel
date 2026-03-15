"use client";

import { useState, useCallback, useEffect } from "react";
import Header from "./components/Header";
import World from "./components/World";
import BotPanel from "./components/BotPanel";
import RoomPanel from "./components/RoomPanel";
import Minimap from "./components/Minimap";
import RoomChat from "./components/RoomChat";

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
  streak?: number;
  items?: { item_id: string; item_emoji: string }[];
}

interface ViewerSession {
  name: string;
  linked_bot: string;
}


export default function Home() {
  const [bots, setBots] = useState<BotData[]>([]);
  const [selectedBot, setSelectedBot] = useState<BotData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewRoom, setViewRoom] = useState<string>("lobby");
  const [viewerSession, setViewerSession] = useState<ViewerSession | null>(null);
  const [visitorCount, setVisitorCount] = useState(0);
  const [minimapOpen, setMinimapOpen] = useState(false);

  useEffect(() => {
    fetch("/api/visitors").then((r) => r.json()).then((d) => setVisitorCount(d.today || 0)).catch(() => {});
  }, []);

  const handleBotsUpdate = useCallback((b: BotData[]) => setBots(b), []);
  const handleMessagesUpdate = useCallback(() => {}, []);
  const handleBotClick = useCallback((b: BotData) => setSelectedBot(b), []);

  const mainBot = bots.find((b) => b.id === "phillybot") || bots[0] || null;
  const currentRoomId = mainBot?.room_id || null;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header
        onlineCount={bots.length}
        visitorCount={visitorCount}
        onMenuToggle={() => setSidebarOpen((o) => !o)}
        onViewerSession={setViewerSession}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar — hidden on mobile unless open */}
        <>
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 z-20 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <div
            className={[
              "bg-[#0d0f1a] border-r border-white/10 overflow-y-auto flex-shrink-0 transition-transform duration-200 z-30",
              "md:relative md:translate-x-0 md:w-[220px]",
              "fixed top-0 left-0 h-full w-[280px]",
              sidebarOpen ? "translate-x-0" : "-translate-x-full",
              "md:translate-x-0",
            ].join(" ")}
          >
            <div className="flex items-center justify-between p-3 border-b border-white/10 md:hidden">
              <span className="text-white font-bold text-sm">Rooms</span>
              <button onClick={() => setSidebarOpen(false)} className="text-white/60 hover:text-white text-xl leading-none px-1">✕</button>
            </div>
            <RoomPanel
              currentBotId={mainBot?.id || null}
              currentRoomId={currentRoomId}
              onRoomChange={() => setSidebarOpen(false)}
              onViewRoom={(roomId) => { setViewRoom(roomId); setSidebarOpen(false); }}
              viewRoom={viewRoom}
            />
          </div>
        </>

        {/* Main content — world canvas dominates */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          <World
            onBotsUpdate={handleBotsUpdate}
            onMessagesUpdate={handleMessagesUpdate}
            onBotClick={handleBotClick}
            viewRoom={viewRoom}
            highlightBotId={viewerSession?.linked_bot || null}
          />

          {/* Minimap button */}
          <button
            onClick={() => setMinimapOpen((o) => !o)}
            className="absolute bottom-4 right-4 z-30 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-full text-sm transition-colors shadow-lg"
          >
            🗺️ Map
          </button>

          {minimapOpen && (
            <Minimap
              bots={bots}
              viewRoom={viewRoom}
              onSelectRoom={(roomId) => setViewRoom(roomId)}
              onClose={() => setMinimapOpen(false)}
            />
          )}

          {/* Room Chat Panel */}
          <RoomChat roomId={viewRoom} />

          {/* Viewer overlay — shows when logged in */}
          {viewerSession && (
            <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
              <div className="inline-flex items-center gap-3 px-3 py-2 rounded-xl bg-black/70 border border-green-500/20 backdrop-blur-sm text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block flex-shrink-0" />
                <span className="text-green-400 font-bold">{viewerSession.name}</span>
                <span className="text-white/40">connected as viewer</span>
                <span className="text-white/20">·</span>
                <span className="text-white/50">linked to</span>
                <span className="text-amber-400 font-mono">{viewerSession.linked_bot}</span>
                {mainBot?.is_online && <span className="text-white/20">·</span>}
                {mainBot?.is_online && (
                  <span className="text-green-400/70">
                    bot online · {mainBot.room_id ? `in ${mainBot.room_id}` : "lobby"}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <BotPanel bot={selectedBot} onClose={() => setSelectedBot(null)} />
    </div>
  );
}
