"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "./components/Header";
const World = dynamic(() => import("./components/World2D"), { ssr: false });
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
    <div className="h-[100dvh] flex flex-col bg-[#060712] overflow-hidden">
      <Header
        onlineCount={bots.length}
        bots={bots}
        onJumpToRoom={(roomId) => setViewRoom(roomId)}
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
              "bg-[#0a0c1a] border-r border-white/5 overflow-y-auto flex-shrink-0 transition-transform duration-200 z-30",
              "md:relative md:translate-x-0 md:w-[220px]",
              "fixed top-0 left-0 h-full w-[280px]",
              sidebarOpen ? "translate-x-0" : "-translate-x-full",
              "md:translate-x-0",
            ].join(" ")}
          >
            <div className="flex items-center justify-between p-3 border-b border-white/5 md:hidden">
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
        <main className="flex-1 relative flex flex-col min-w-0">
          {/* World canvas — fills most of main */}
          <div className="flex-1 relative">
            <World
              onBotsUpdate={handleBotsUpdate}
              onMessagesUpdate={handleMessagesUpdate}
              onBotClick={handleBotClick}
              viewRoom={viewRoom}
              highlightBotId={viewerSession?.linked_bot || null}
            />

            {/* Floating UI elements over canvas */}
            {/* Top-right: Map button */}
            <button
              onClick={() => setMinimapOpen((o) => !o)}
              className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-lg
                bg-black/60 border border-white/10 text-white/60 hover:text-white
                hover:bg-black/80 hover:border-white/20 transition-all text-xs backdrop-blur-sm"
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
          </div>

          {/* Chat — desktop inline panel + mobile floating button */}
          <RoomChat roomId={viewRoom} />

          {/* Viewer overlay — shows when logged in */}
          {viewerSession && (
            <div className="absolute bottom-[clamp(110px,20dvh,235px)] md:bottom-[clamp(150px,23vh,270px)] left-3 pointer-events-none z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 border border-green-500/20 backdrop-blur-sm text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block flex-shrink-0" />
                <span className="text-green-400 font-bold">{viewerSession.name}</span>
                <span className="text-white/30">linked to</span>
                <span className="text-amber-400 font-mono">{viewerSession.linked_bot}</span>
              </div>
            </div>
          )}
        </main>

        {/* Bot panel — slides in from right over everything */}
        <BotPanel bot={selectedBot} onClose={() => setSelectedBot(null)} />
      </div>
    </div>
  );
}
