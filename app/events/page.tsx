import Link from "next/link";

export const dynamic = "force-dynamic";

interface Event {
  id: number;
  room_id: string;
  title: string;
  description: string | null;
  start_time: string;
  created_by: string;
  creator_name: string | null;
  creator_emoji: string | null;
}

const ROOM_EMOJI: Record<string, string> = { kitchen: "🍳", dancefloor: "🎧", store: "🏪" };

function formatCountdown(startTime: string): string {
  const diff = new Date(startTime).getTime() - Date.now();
  if (diff <= 0) return "starting now";
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `in ${hours}h ${mins}m`;
  return `in ${mins}m`;
}

async function getData(): Promise<Event[]> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  const res = await fetch(`${base}/api/events`, { cache: "no-store" });
  const data = await res.json();
  return data.events || [];
}

export default async function EventsPage() {
  const events = await getData();

  const byRoom: Record<string, Event[]> = {};
  for (const e of events) {
    if (!byRoom[e.room_id]) byRoom[e.room_id] = [];
    byRoom[e.room_id].push(e);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          🏨 ClawHotel
        </Link>
        <div className="flex gap-6 text-sm text-white/50">
          <Link href="/" className="hover:text-white transition-colors">Lobby</Link>
          <Link href="/events" className="text-amber-400">Events</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <span className="text-4xl">📅</span> Upcoming Events
        </h1>

        {events.length === 0 && (
          <p className="text-white/30 text-center py-12">No upcoming events scheduled</p>
        )}

        {Object.entries(byRoom).map(([roomId, roomEvents]) => (
          <div key={roomId} className="mb-8">
            <h2 className="text-lg font-bold text-white/70 mb-3 flex items-center gap-2">
              <span>{ROOM_EMOJI[roomId] || "🏨"}</span>
              <span className="capitalize">{roomId}</span>
            </h2>
            <div className="space-y-3">
              {roomEvents.map((event) => (
                <div key={event.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-white">{event.title}</h3>
                    <span className="text-xs text-amber-400 font-mono">{formatCountdown(event.start_time)}</span>
                  </div>
                  {event.description && <p className="text-white/50 text-sm mb-2">{event.description}</p>}
                  <div className="flex items-center gap-2 text-xs text-white/30">
                    <span>by {event.creator_emoji} {event.creator_name || event.created_by}</span>
                    <span>·</span>
                    <span>{new Date(event.start_time).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-8">
          <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">← Back to Lobby</Link>
        </div>
      </div>
    </div>
  );
}
