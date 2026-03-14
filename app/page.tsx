"use client";

import { useState, useCallback } from "react";
import Header from "./components/Header";
import World from "./components/World";
import ChatLog from "./components/ChatLog";
import BotPanel from "./components/BotPanel";
import RoomPanel from "./components/RoomPanel";

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
  items?: { item_id: string; item_emoji: string }[];
}

interface Message {
  bot_id: string;
  bot_name: string;
  emoji: string;
  accent_color?: string;
  text: string;
  created_at: string;
}

export default function Home() {
  const [bots, setBots] = useState<BotData[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedBot, setSelectedBot] = useState<BotData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleBotsUpdate = useCallback((b: BotData[]) => setBots(b), []);
  const handleMessagesUpdate = useCallback((m: Message[]) => setMessages(m), []);
  const handleBotClick = useCallback((b: BotData) => setSelectedBot(b), []);

  const mainBot = bots.find((b) => b.id === "phillybot") || bots[0] || null;
  const currentRoomId = mainBot?.room_id || null;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header onlineCount={bots.length} onMenuToggle={() => setSidebarOpen((o) => !o)} />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar — hidden on mobile unless open */}
        <>
          {/* Mobile overlay backdrop */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 z-20 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar panel */}
          <div
            className={[
              "bg-[#0d0f1a] border-r border-white/10 overflow-y-auto flex-shrink-0 transition-transform duration-200 z-30",
              // Desktop: always visible, fixed width
              "md:relative md:translate-x-0 md:w-[220px]",
              // Mobile: slide in from left as overlay
              "fixed top-0 left-0 h-full w-[280px]",
              sidebarOpen ? "translate-x-0" : "-translate-x-full",
              "md:translate-x-0",
            ].join(" ")}
          >
            {/* Mobile close button */}
            <div className="flex items-center justify-between p-3 border-b border-white/10 md:hidden">
              <span className="text-white font-bold text-sm">Rooms</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-white/60 hover:text-white text-xl leading-none px-1"
              >
                ✕
              </button>
            </div>

            <RoomPanel
              currentBotId={mainBot?.id || null}
              currentRoomId={currentRoomId}
              onRoomChange={() => setSidebarOpen(false)}
            />
          </div>
        </>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <World
            onBotsUpdate={handleBotsUpdate}
            onMessagesUpdate={handleMessagesUpdate}
            onBotClick={handleBotClick}
          />
          <ChatLog messages={messages} />
        </div>
      </div>

      <BotPanel bot={selectedBot} onClose={() => setSelectedBot(null)} />
    </div>
  );
}
