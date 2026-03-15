"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface ChatMessage {
  id: number;
  text: string;
  name: string;
  emoji: string;
  accent_color: string;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function RoomChat({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/messages`);
      const data = await res.json();
      const msgs: ChatMessage[] = (data.messages || []).slice(0, 20).reverse();
      setMessages(msgs);
    } catch { /* silent */ }
  }, [roomId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > prevCountRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    prevCountRef.current = messages.length;
  }, [messages]);

  return (
    <div className="bg-[#060712]/90 backdrop-blur-sm border-t border-white/5 flex flex-col" style={{ height: "clamp(100px, 18dvh, 220px)" }}>
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/5 flex-shrink-0">
        <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Room Chat</span>
        <span className="text-[10px] text-white/15">{messages.length} messages</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-0.5">
        {messages.length === 0 && (
          <p className="text-[11px] text-white/15 italic text-center mt-6">no messages yet</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="flex items-start gap-2 text-xs py-0.5 group">
            <span className="flex-shrink-0 text-[10px]">{m.emoji}</span>
            <div className="min-w-0 flex-1">
              <span className="font-bold mr-1.5 text-[11px]" style={{ color: m.accent_color }}>{m.name}</span>
              <span className="text-white/60 text-[11px]">{m.text}</span>
            </div>
            <span className="text-white/15 text-[9px] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">{timeAgo(m.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
