"use client";

import { useState, useCallback } from "react";
import Header from "./components/Header";
import World from "./components/World";
import ChatLog from "./components/ChatLog";
import BotInfo from "./components/BotInfo";

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
}

interface Message {
  bot_id: string;
  bot_name: string;
  emoji: string;
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

  return (
    <div className="h-screen flex flex-col">
      <Header onlineCount={bots.length} />
      <World
        onBotsUpdate={handleBotsUpdate}
        onMessagesUpdate={handleMessagesUpdate}
        onBotClick={handleBotClick}
      />
      <ChatLog messages={messages} />
      <BotInfo bot={selectedBot} onClose={() => setSelectedBot(null)} />
    </div>
  );
}
