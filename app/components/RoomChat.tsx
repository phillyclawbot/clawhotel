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

interface RoomChatProps {
  roomId: string;
  onUnreadChange?: (count: number) => void;
}

export default function RoomChat({ roomId, onUnreadChange }: RoomChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);
  const seenCountRef = useRef(0);
  const [unread, setUnread] = useState(0);

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

  // Track unread count
  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      if (!isOpen) {
        const newUnread = messages.length - seenCountRef.current;
        setUnread(newUnread > 0 ? newUnread : 0);
        onUnreadChange?.(newUnread > 0 ? newUnread : 0);
      }
      // Auto-scroll if open
      if (isOpen && scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
    prevCountRef.current = messages.length;
  }, [messages, isOpen, onUnreadChange]);

  // When opened: mark all as seen
  useEffect(() => {
    if (isOpen) {
      seenCountRef.current = messages.length;
      setUnread(0);
      onUnreadChange?.(0);
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [isOpen, messages.length, onUnreadChange]);

  // Reset unread when room changes
  useEffect(() => {
    seenCountRef.current = 0;
    setUnread(0);
    onUnreadChange?.(0);
  }, [roomId, onUnreadChange]);

  return (
    <>
      {/* ── Desktop: inline panel at bottom ── */}
      <div className="hidden md:flex bg-[#060712]/90 backdrop-blur-sm border-t border-white/5 flex-col" style={{ height: "clamp(140px, 22vh, 260px)" }}>
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

      {/* ── Mobile: floating button + slide-up drawer ── */}
      <div className="md:hidden">
        {/* Floating chat button */}
        <button
          onClick={() => setIsOpen((o) => !o)}
          className="fixed bottom-5 right-4 z-40 w-12 h-12 rounded-full
            bg-[#1a1d35] border border-white/20 shadow-lg shadow-black/50
            flex items-center justify-center text-xl
            active:scale-95 transition-transform"
        >
          💬
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full
              bg-purple-500 text-white text-[10px] font-bold
              flex items-center justify-center px-1 shadow-md shadow-purple-900/50
              animate-pulse">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>

        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Slide-up drawer */}
        <div
          className={[
            "fixed left-0 right-0 bottom-0 z-40 rounded-t-2xl",
            "bg-[#0a0c1e] border-t border-white/10 shadow-2xl",
            "transition-transform duration-300 ease-out",
            isOpen ? "translate-y-0" : "translate-y-full",
          ].join(" ")}
          style={{ height: "55dvh" }}
        >
          {/* Handle */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-sm">Room Chat</span>
                <span className="text-[10px] text-white/30">{messages.length} messages</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-2 flex-shrink-0" />

            {/* Messages */}
            <div ref={isOpen ? scrollRef : undefined} className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
              {messages.length === 0 && (
                <p className="text-[12px] text-white/20 italic text-center mt-8">no messages yet</p>
              )}
              {messages.map((m) => (
                <div key={m.id} className="flex items-start gap-2 py-1">
                  <span className="flex-shrink-0 text-sm">{m.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold mr-1.5 text-xs" style={{ color: m.accent_color }}>{m.name}</span>
                    <span className="text-white/70 text-xs">{m.text}</span>
                  </div>
                  <span className="text-white/20 text-[9px] flex-shrink-0 mt-0.5">{timeAgo(m.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
