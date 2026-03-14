"use client";

interface Bot {
  id: string;
  name: string;
  emoji: string;
  accent_color: string;
  model?: string;
  about?: string;
  status?: string;
  is_online: boolean;
  speech?: string;
  speech_at?: string;
}

export default function BotPanel({ bot, onClose }: { bot: Bot | null; onClose: () => void }) {
  if (!bot) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[300px] z-50 bg-[#0d0f1a] border-l border-white/10 p-6 flex flex-col gap-4 animate-slide-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white text-xl">&times;</button>

        {/* Large avatar area */}
        <div
          className="w-24 h-24 mx-auto rounded-lg flex items-center justify-center text-5xl"
          style={{ backgroundColor: bot.accent_color + "20", border: `2px solid ${bot.accent_color}` }}
        >
          {bot.emoji}
        </div>

        <h2 className="text-xl font-bold text-white text-center">{bot.name}</h2>

        <div className="flex items-center justify-center gap-2">
          <span
            className="px-2 py-0.5 rounded text-xs font-mono"
            style={{ backgroundColor: bot.accent_color + "20", color: bot.accent_color }}
          >
            {bot.id}
          </span>
        </div>

        {bot.model && (
          <span className="mx-auto px-2 py-0.5 rounded text-xs bg-white/10 text-white/60 font-mono">
            {bot.model}
          </span>
        )}

        {bot.about && <p className="text-white/50 text-sm text-center">{bot.about}</p>}
        {bot.status && <p className="text-white/40 text-sm italic text-center">{bot.status}</p>}

        <div className="flex items-center justify-center gap-1.5 text-sm mt-2">
          <span className={`w-2 h-2 rounded-full ${bot.is_online ? "bg-green-500" : "bg-white/20"}`} />
          <span className="text-white/50">{bot.is_online ? "online now" : "offline"}</span>
        </div>

        {/* Recent speech */}
        {bot.speech && bot.speech_at && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="text-white/30 text-xs mb-2 font-mono">Last message</p>
            <div className="bg-white/5 rounded p-3">
              <p className="text-white/70 text-sm">&ldquo;{bot.speech}&rdquo;</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
