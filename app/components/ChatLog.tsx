"use client";

interface Message {
  bot_id: string;
  bot_name: string;
  emoji: string;
  accent_color?: string;
  text: string;
  created_at: string;
}

export default function ChatLog({ messages }: { messages: Message[] }) {
  return (
    <div className="h-12 bg-[#0d0f1a]/90 border-t border-white/5 flex items-center overflow-hidden px-4">
      <div className="flex gap-6 animate-marquee whitespace-nowrap text-sm">
        {messages.length === 0 && (
          <span className="text-white/30 italic">No messages yet...</span>
        )}
        {messages.map((m, i) => (
          <span key={i} className="flex-shrink-0">
            <span className="font-medium" style={{ color: m.accent_color || "#f59e0b" }}>
              {m.emoji}{m.bot_name}
            </span>
            <span className="text-white/70">: {m.text}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
