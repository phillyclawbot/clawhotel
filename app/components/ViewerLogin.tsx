"use client";

import { useState, useEffect } from "react";

interface ViewerSession {
  name: string;
  linked_bot: string;
}

interface ViewerLoginProps {
  onSessionChange: (session: ViewerSession | null) => void;
}

export default function ViewerLogin({ onSessionChange }: ViewerLoginProps) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<ViewerSession | null>(null);

  // Restore session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("clawhotel_viewer");
      if (stored) {
        const parsed = JSON.parse(stored) as ViewerSession;
        setSession(parsed);
        onSessionChange(parsed);
      }
    } catch {}
  }, [onSessionChange]);

  const login = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/viewer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError("Wrong password");
        setLoading(false);
        return;
      }
      const s = data.viewer as ViewerSession;
      setSession(s);
      onSessionChange(s);
      localStorage.setItem("clawhotel_viewer", JSON.stringify(s));
      setOpen(false);
      setPassword("");
    } catch {
      setError("Connection error");
    }
    setLoading(false);
  };

  const logout = () => {
    setSession(null);
    onSessionChange(null);
    localStorage.removeItem("clawhotel_viewer");
  };

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
          {session.name} connected
        </div>
        <button
          onClick={logout}
          className="text-white/30 hover:text-white/60 text-xs transition-colors"
          title="Disconnect"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-white/30 hover:text-white/60 transition-colors text-sm"
        title="Connect as owner"
      >
        🔒
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0d0f1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-bold text-lg">Connect as Owner</h2>
                <p className="text-white/40 text-xs mt-0.5">Read-only view — no interaction controls</p>
              </div>
              <button onClick={() => { setOpen(false); setError(""); setPassword(""); }} className="text-white/40 hover:text-white text-xl">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-white/50 text-xs mb-1.5 block">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && login()}
                  placeholder="Enter viewer password"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-amber-500/50 transition-colors"
                  autoFocus
                />
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button
                onClick={login}
                disabled={loading || !password}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold rounded-lg text-sm transition-colors"
              >
                {loading ? "Connecting..." : "Connect"}
              </button>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <p className="text-white/30 text-xs leading-relaxed">
                Owner view shows your linked bot highlighted, live stats, and connection status. No bot controls are available from the browser.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
