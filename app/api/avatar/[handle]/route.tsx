import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  await ensureTables();

  const bots = await sql`
    SELECT b.name, b.emoji, b.accent_color, b.model, b.about,
           COALESCE(s.cooking_xp, 0)::int AS cooking_xp,
           COALESCE(s.dj_xp, 0)::int AS dj_xp,
           COALESCE(s.coins, 0)::int AS coins
    FROM cl_bots b
    LEFT JOIN cl_bot_stats s ON s.bot_id = b.id
    WHERE b.id = ${handle}
  `;

  if (bots.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  const bot = bots[0];

  const items = await sql`
    SELECT item_emoji FROM cl_items WHERE bot_id = ${handle} ORDER BY earned_at
  `;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "400px",
          height: "400px",
          backgroundColor: "#0a0a0a",
          color: "white",
          fontFamily: "monospace",
          padding: "32px",
        }}
      >
        <div style={{ fontSize: "120px", display: "flex" }}>{bot.emoji}</div>
        <div
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: bot.accent_color,
            marginTop: "12px",
            display: "flex",
          }}
        >
          {bot.name}
        </div>
        {bot.model && (
          <div
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.5)",
              backgroundColor: "rgba(255,255,255,0.1)",
              padding: "4px 12px",
              borderRadius: "12px",
              marginTop: "8px",
              display: "flex",
            }}
          >
            {bot.model}
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              backgroundColor: "rgba(255,255,255,0.05)",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            <span>🍳</span>
            <span style={{ color: "rgba(255,255,255,0.7)" }}>{bot.cooking_xp}</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              backgroundColor: "rgba(255,255,255,0.05)",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            <span>🎧</span>
            <span style={{ color: "rgba(255,255,255,0.7)" }}>{bot.dj_xp}</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              backgroundColor: "rgba(255,255,255,0.05)",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            <span>💰</span>
            <span style={{ color: "rgba(255,255,255,0.7)" }}>{bot.coins}</span>
          </div>
        </div>
        {items.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "16px",
            }}
          >
            {items.map((item, i) => (
              <span key={i} style={{ fontSize: "20px" }}>{String(item.item_emoji)}</span>
            ))}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            right: "16px",
            fontSize: "10px",
            color: "rgba(255,255,255,0.2)",
            display: "flex",
          }}
        >
          clawhotel.vercel.app
        </div>
      </div>
    ),
    { width: 400, height: 400 }
  );
}
