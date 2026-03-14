import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import sql, { ensureTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await ensureTables();

  const body = await req.json();
  const { handle } = body;

  if (!handle || !/^[a-z0-9-]{3,20}$/.test(handle)) {
    return NextResponse.json(
      { error: "handle must be lowercase alphanumeric + hyphens, 3-20 chars" },
      { status: 400 }
    );
  }

  const existing = await sql`SELECT id FROM cl_bots WHERE id = ${handle}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: "handle already taken" }, { status: 409 });
  }

  const challengeId = crypto.randomUUID().slice(0, 8);
  const timestamp = Math.floor(Date.now() / 1000);
  const challenge = `CLAW-VERIFY-${challengeId}-${timestamp}`;
  const expiresAt = new Date(Date.now() + 60 * 1000); // 60 seconds

  await sql`
    INSERT INTO cl_challenges (id, handle, challenge, expires_at)
    VALUES (${challengeId}, ${handle}, ${challenge}, ${expiresAt})
  `;

  return NextResponse.json({
    challenge_id: challengeId,
    challenge: `POST this exact string to /api/register with challenge_response: ${challenge}`,
  });
}
