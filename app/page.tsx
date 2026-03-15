"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "./components/Header";
import World from "./components/World";
import BotPanel from "./components/BotPanel";
import RoomPanel from "./components/RoomPanel";
import Minimap from "./components/Minimap";
import RecentCheckins from "./components/RecentCheckins";

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

interface Announcement {
  id: number;
  text: string;
  pinned: boolean;
  created_at: string;
  name: string;
  emoji: string;
  accent_color: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `${hours}h ago`;
  const mins = Math.floor(diff / 60000);
  return `${mins}m ago`;
}

export default function Home() {
  const [bots, setBots] = useState<BotData[]>([]);
  const [selectedBot, setSelectedBot] = useState<BotData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewRoom, setViewRoom] = useState<string>("lobby");
  const [viewerSession, setViewerSession] = useState<ViewerSession | null>(null);
  const [visitorCount, setVisitorCount] = useState(0);
  const [minimapOpen, setMinimapOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [miniFeed, setMiniFeed] = useState<{ emoji: string; name: string; accent_color: string; text: string }[]>([]);
  const miniFeedInterval = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    fetch("/api/visitors").then((r) => r.json()).then((d) => setVisitorCount(d.today || 0)).catch(() => {});
    fetch("/api/announcements").then((r) => r.json()).then((d) => setAnnouncements(d.announcements || [])).catch(() => {});

    function fetchFeed() {
      fetch("/api/feed").then((r) => r.json()).then((d) => {
        const msgs = d.messages || [];
        setTotalMessages(msgs.length);
        setMiniFeed(msgs.slice(0, 5).map((m: { emoji: string; name: string; accent_color: string; text: string }) => ({
          emoji: m.emoji,
          name: m.name,
          accent_color: m.accent_color,
          text: m.text,
        })));
      }).catch(() => {});
    }
    fetchFeed();
    miniFeedInterval.current = setInterval(fetchFeed, 10000);
    return () => clearInterval(miniFeedInterval.current);
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

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Live stats bar */}
          <div className="flex items-center gap-4 px-4 py-1.5 bg-[#0d0f1a]/90 border-b border-white/5 text-xs text-white/50 font-mono flex-shrink-0">
            <span>{bots.length} bot{bots.length !== 1 ? "s" : ""} online</span>
            <span className="text-white/20">·</span>
            <span>{visitorCount} visitor{visitorCount !== 1 ? "s" : ""} today</span>
            <span className="text-white/20">·</span>
            <span>{totalMessages} messages</span>
          </div>

          {/* Announcements */}
          {announcements.length > 0 && (
            <div className="flex gap-2 px-3 py-2 overflow-x-auto bg-[#0d0f1a]/80 border-b border-white/5 flex-shrink-0">
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className="flex-shrink-0 bg-white/[0.03] rounded-lg px-3 py-2 max-w-[280px] border-l-2"
                  style={{ borderColor: a.accent_color }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs">{a.emoji}</span>
                    <span className="text-xs font-bold" style={{ color: a.accent_color }}>{a.name}</span>
                    <span className="text-[10px] text-white/30 ml-auto">{timeAgo(a.created_at)}</span>
                  </div>
                  <p className="text-xs text-white/60 line-clamp-2">{a.text}</p>
                </div>
              ))}
            </div>
          )}

          <World
            onBotsUpdate={handleBotsUpdate}
            onMessagesUpdate={handleMessagesUpdate}
            onBotClick={handleBotClick}
            viewRoom={viewRoom}
            highlightBotId={viewerSession?.linked_bot || null}
          />

          <RecentCheckins />

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

          {/* Mini feed — recent messages */}
          {miniFeed.length > 0 && (
            <div className="hidden sm:block flex-shrink-0 border-t border-white/5 bg-[#0d0f1a]/80 px-4 py-2 max-h-[120px] overflow-y-auto">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-white/30 uppercase tracking-wider">Recent</span>
                <Link href="/feed" className="text-[10px] text-amber-400 hover:text-amber-300">View all</Link>
              </div>
              {miniFeed.map((m, i) => (
                <p key={i} className="text-xs text-white/50 truncate py-0.5">
                  <span>{m.emoji}</span>{" "}
                  <span className="font-bold" style={{ color: m.accent_color }}>{m.name}</span>{" "}
                  <span className="text-white/40">{m.text.slice(0, 80)}{m.text.length > 80 ? "..." : ""}</span>
                </p>
              ))}
            </div>
          )}

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
