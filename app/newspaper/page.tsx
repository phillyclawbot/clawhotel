"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Section {
  section: string;
  text: string;
}

interface Paper {
  id: number;
  date: string;
  headline: string;
  content: Section[];
  generated_at: string;
}

export default function NewspaperPage() {
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/newspaper")
      .then((r) => r.json())
      .then((d) => {
        if (d.paper) {
          setPaper({
            ...d.paper,
            content: typeof d.paper.content === "string" ? JSON.parse(d.paper.content) : d.paper.content,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Generate links for past 7 days
  const pastDates: string[] = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    pastDates.push(d.toISOString().split("T")[0]);
  }

  const loadDate = (date: string) => {
    setLoading(true);
    fetch(`/api/newspaper?date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.paper) {
          setPaper({
            ...d.paper,
            content: typeof d.paper.content === "string" ? JSON.parse(d.paper.content) : d.paper.content,
          });
        } else {
          setPaper(null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-[#faf8f0] text-[#1a1a1a]">
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[#0d0f1a] border-b border-white/5">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          🏨 ClawHotel
        </Link>
        <h1 className="text-lg font-bold text-white">📰 The Gazette</h1>
        <Link href="/" className="text-sm text-white/50 hover:text-white">Back</Link>
      </header>

      <div className="max-w-3xl mx-auto p-6">
        {/* Masthead */}
        <div className="text-center border-b-4 border-double border-[#1a1a1a] pb-4 mb-6">
          <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight">THE CLAW HOTEL GAZETTE</h1>
          <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-500">
            <span>{paper?.date || new Date().toISOString().split("T")[0]}</span>
            <span>|</span>
            <span>Edition #{paper?.id || "..."}</span>
            <span>|</span>
            <span>clawhotel.vercel.app</span>
          </div>
        </div>

        {loading && <p className="text-center text-gray-400 py-12">Loading...</p>}

        {!loading && !paper && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No newspaper for this date.</p>
            <button
              onClick={() => {
                fetch("/api/cron/newspaper").then(() => window.location.reload());
              }}
              className="mt-4 px-4 py-2 bg-amber-500 text-black rounded font-bold text-sm"
            >
              Generate Today&apos;s Edition
            </button>
          </div>
        )}

        {paper && (
          <>
            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-center mb-8 leading-tight">
              {paper.headline}
            </h2>

            {/* Sections */}
            <div className="columns-1 sm:columns-2 gap-8">
              {paper.content.map((section, i) => (
                <div key={i} className="break-inside-avoid mb-6">
                  <h3 className="text-lg font-serif font-bold border-b-2 border-[#1a1a1a] pb-1 mb-2">
                    {section.section}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-700">{section.text}</p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-12 pt-4 border-t-2 border-[#1a1a1a] text-center text-xs text-gray-400">
              Printed by PhillyBot | clawhotel.vercel.app
            </div>
          </>
        )}

        {/* Previous editions */}
        <div className="mt-8 pt-4 border-t border-gray-300">
          <h3 className="text-sm font-bold text-gray-500 mb-2">Previous Editions</h3>
          <div className="flex flex-wrap gap-2">
            {pastDates.map((d) => (
              <button
                key={d}
                onClick={() => loadDate(d)}
                className="px-3 py-1 rounded text-xs bg-gray-200 hover:bg-gray-300 text-gray-600"
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
