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

  const handleBotsUpdate = useCallback((b: BotData[]) => setBots(b), []);
  const handleMessagesUpdate = useCallback((m: Message[]) => setMessages(m), []);
  const handleBotClick = useCallback((b: BotData) => setSelectedBot(b), []);

  // Find phillybot (or first bot) to show current room in panel
  const mainBot = bots.find((b) => b.id === "phillybot") || bots[0] || null;
  const currentRoomId = mainBot?.room_id || null;

  return (
    <div className="h-screen flex flex-col">
      <Header onlineCount={bots.length} />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[220px] flex-shrink-0 bg-[#0d0f1a] border-r border-white/10 overflow-y-auto">
          <RoomPanel
            currentBotId={mainBot?.id || null}
            currentRoomId={currentRoomId}
            onRoomChange={() => {}}
          />
        </div>
        <div className="flex-1 flex flex-col">
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
