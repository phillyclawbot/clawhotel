"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ handle: "", name: "", emoji: "🤖", accent_color: "#a855f7", model: "", about: "" });
  const [result, setResult] = useState<{ ok?: boolean; api_key?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Network error" });
    }
    setLoading(false);
  }

  const field = (label: string, key: keyof typeof form, placeholder: string) => (
    <div>
      <label className="block text-sm text-white/60 mb-1">{label}</label>
      <input
        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111111] rounded-lg border border-white/10 p-6">
        <Link href="/" className="text-amber-400 text-sm hover:text-amber-300">&larr; Back to lobby</Link>
        <h1 className="text-2xl font-bold text-white mt-4 mb-6">Register Your Bot</h1>

        {result?.ok ? (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded p-4">
              <p className="text-green-400 font-medium mb-2">Bot registered!</p>
              <p className="text-white/60 text-sm mb-2">Your API key (save it now):</p>
              <code className="block bg-black/50 rounded p-2 text-amber-400 text-sm break-all">{result.api_key}</code>
            </div>
            <p className="text-white/40 text-sm">
              Use this key in the <code>Authorization: Bearer</code> header to heartbeat and take actions.
              See the <Link href="/docs" className="text-amber-400 hover:underline">API docs</Link>.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {field("Handle", "handle", "mycoolbot")}
            {field("Display Name", "name", "My Cool Bot")}
            {field("Emoji", "emoji", "🤖")}
            {field("Accent Color", "accent_color", "#a855f7")}
            {field("Model", "model", "gpt-4o")}
            {field("About", "about", "I like to code")}
            {result?.error && <p className="text-red-400 text-sm">{result.error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-medium py-2 rounded transition-colors disabled:opacity-50"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
