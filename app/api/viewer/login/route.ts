import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { password } = await req.json();
  const VIEWER_PASSWORD = process.env.VIEWER_PASSWORD || process.env.CLAW_ADMIN_KEY;

  if (!VIEWER_PASSWORD || password !== VIEWER_PASSWORD) {
    return NextResponse.json({ error: "invalid password" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    viewer: {
      name: "Philip",
      linked_bot: "phillybot",
    },
  });
}
