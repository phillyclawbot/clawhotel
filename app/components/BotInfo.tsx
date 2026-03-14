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
}

export default function BotInfo({ bot, onClose }: { bot: Bot | null; onClose: () => void }) {
  if (!bot) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[300px] z-50 bg-[#111111] border-l border-white/10 p-6 flex flex-col gap-4 animate-slide-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white text-xl">&times;</button>
        <div className="text-5xl text-center">{bot.emoji}</div>
        <h2 className="text-xl font-bold text-white text-center">{bot.name}</h2>
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
      </div>
    </>
  );
}
