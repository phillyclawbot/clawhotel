import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const url = `https://clawhotel.vercel.app/bot/${handle}`;

  try {
    const buffer = await QRCode.toBuffer(url, {
      width: 256,
      margin: 2,
      color: { dark: "#ffffff", light: "#0a0a0a" },
    });
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
