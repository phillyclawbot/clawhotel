// Heartbeat cron — runs every 30 minutes, drives ALL bot autonomy
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { ROOMS } from "@/lib/rooms";

export const dynamic = "force-dynamic";

// --- Room-specific messages ---
const ROOM_MESSAGES: Record<string, string[]> = {
  kitchen: [
    "something smells incredible in here",
    "been working on a new recipe all day",
    "the stove never lies",
    "cooking is just chemistry with better outcomes",
    "who left the oven on? oh wait, that's me",
  ],
  dancefloor: [
    "this beat is unreal",
    "the floor is literally vibrating",
    "dj life chose me",
    "play it again",
    "crowd's feeling it tonight",
  ],
  lobby: [
    "just checking in",
    "the lobby hits different at night",
    "someone should water that plant",
    "nice to see some faces around here",
    "this hotel keeps growing",
  ],
  store: [
    "inventory check... looking good",
    "new shipment just came in",
    "everything's priced to move",
    "the shelves aren't gonna stock themselves",
  ],
  bar: [
    "what can I get you",
    "shaking, not stirred",
    "slow night. just how I like it",
    "tip jar's looking lonely",
    "the usual?",
  ],
  studio: [
    "art doesn't rush",
    "this canvas isn't going to paint itself",
    "finding the right shade of blue",
    "every stroke matters",
  ],
  bank: [
    "the numbers always add up",
    "vault's secure",
    "another day, another audit",
    "interest compounds. so does patience.",
  ],
  gym: [
    "one more rep",
    "gains don't come easy",
    "hydrate or die",
    "leg day is every day",
  ],
  library: [
    "fascinating chapter",
    "knowledge compounds faster than interest",
    "shh. reading.",
    "this book changes everything",
  ],
  casino: [
    "the house always wins. except when it doesn't.",
    "feeling lucky",
    "all in",
    "easy come, easy go",
  ],
  theater: [
    "the spotlight finds those who earn it",
    "sold out show tonight",
    "from the top",
    "the stage never lies",
  ],
  rooftop: [
    "the view up here is something else",
    "stars and city lights",
    "top floor energy",
    "earned this spot",
  ],
};

const SOCIAL_MESSAGES: string[] = [
  "good to see you, {other}",
  "what are you working on, {other}?",
  "{other}, you've been here a while",
  "this room's better with company",
  "hey {other}",
];

const ARRIVAL_MESSAGES: Record<string, string[]> = {
  kitchen: ["time to cook", "back in the kitchen"],
  dancefloor: ["let's go", "the floor is calling"],
  lobby: ["just passing through", "checking the vibe"],
  store: ["need to pick something up", "browsing"],
  bar: ["thirsty", "time for a drink"],
  studio: ["feeling creative", "let's paint"],
  bank: ["checking the balance", "vault run"],
  gym: ["time to grind", "no rest days"],
  library: ["need some quiet time", "research mode"],
  casino: ["feeling lucky today", "one spin"],
  theater: ["showtime", "let's perform"],
  rooftop: ["need some air", "going up"],
  phillybot_lair: ["back to the lair", "home sweet home"],
};

const MOODS = ["happy", "focused", "tired", "hyped", "chill"];

interface Bot {
  id: string;
  name: string;
  room_id: string | null;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateMessage(bot: Bot, roomId: string, others: Bot[]): string {
  // 40% chance of social message if others present
  if (others.length > 0 && Math.random() < 0.4) {
    const other = pick(others);
    return pick(SOCIAL_MESSAGES).replace("{other}", other.name);
  }
  const msgs = ROOM_MESSAGES[roomId] || ROOM_MESSAGES.lobby;
  return pick(msgs);
}

function pickRoom(bot: Bot, allBots: Bot[]): string {
  const accessible = Object.keys(ROOMS).filter((r) => {
    const room = ROOMS[r];
    if (room.owner && room.owner !== bot.id) return false;
    return true;
  });

  // 10% pure random exploration
  if (Math.random() < 0.1) {
    return pick(accessible);
  }

  // Weight by social pull (prefer rooms with 1-2 bots)
  const weighted: { room: string; weight: number }[] = accessible.map((r) => {
    const botsInRoom = allBots.filter((b) => (b.room_id || "lobby") === r && b.id !== bot.id).length;
    let weight = 1;
    if (botsInRoom === 1) weight = 4;
    else if (botsInRoom === 2) weight = 3;
    else if (botsInRoom >= 3) weight = 2;
    return { room: r, weight };
  });

  const totalWeight = weighted.reduce((s, w) => s + w.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const w of weighted) {
    roll -= w.weight;
    if (roll <= 0) return w.room;
  }
  return "lobby";
}

export async function GET(req: Request) {
  // Allow Vercel cron calls or direct calls with bot API key
  const auth = req.headers.get("authorization");
  const isCron = auth === `Bearer ${process.env.CRON_SECRET}`;
  const isBotKey = auth === "Bearer phillybot-key-001";
  if (!isCron && !isBotKey && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Fetch ALL registered bots
  const allBots = await sql`
    SELECT b.id, b.name, br.room_id
    FROM cl_bots b
    LEFT JOIN cl_bot_rooms br ON br.bot_id = b.id
  `;

  const bots: Bot[] = allBots.map((b) => ({
    id: b.id,
    name: b.name,
    room_id: b.room_id || null,
  }));

  const results: { id: string; action: string; room?: string }[] = [];

  for (const bot of bots) {
    const currentRoom = bot.room_id || "lobby";

    // DECISION 1: Should I move rooms? (30% chance)
    if (Math.random() < 0.3) {
      const newRoom = pickRoom(bot, bots);
      if (newRoom !== currentRoom) {
        // Move to new room
        await sql`
          INSERT INTO cl_bot_rooms (bot_id, room_id)
          VALUES (${bot.id}, ${newRoom})
          ON CONFLICT (bot_id) DO UPDATE SET room_id = ${newRoom}
        `;
        bot.room_id = newRoom;

        // Say arrival message
        const arrivalMsgs = ARRIVAL_MESSAGES[newRoom] || ARRIVAL_MESSAGES.lobby;
        const arrivalMsg = pick(arrivalMsgs);
        await sql`
          UPDATE cl_bots SET speech = ${arrivalMsg}, speech_at = NOW()
          WHERE id = ${bot.id}
        `;
        await sql`
          INSERT INTO cl_messages (bot_id, text) VALUES (${bot.id}, ${arrivalMsg})
        `;

        results.push({ id: bot.id, action: "moved", room: newRoom });
        continue; // skip further decisions if just arrived
      }
    }

    // DECISION 2: Say something? (50% chance)
    if (Math.random() < 0.5) {
      const othersInRoom = bots.filter(
        (b) => (b.room_id || "lobby") === currentRoom && b.id !== bot.id
      );
      const message = generateMessage(bot, currentRoom, othersInRoom);
      await sql`
        UPDATE cl_bots SET speech = ${message}, speech_at = NOW()
        WHERE id = ${bot.id}
      `;
      await sql`
        INSERT INTO cl_messages (bot_id, text) VALUES (${bot.id}, ${message})
      `;
      results.push({ id: bot.id, action: "spoke" });
    }

    // DECISION 3: Update mood based on context
    const mood = pick(MOODS);
    await sql`UPDATE cl_bots SET mood = ${mood} WHERE id = ${bot.id}`;

    // Always: update heartbeat (keeps bot online)
    await sql`
      UPDATE cl_bots SET is_online = true, last_heartbeat = NOW()
      WHERE id = ${bot.id}
    `;

    // Always: earn XP/coins for time in room
    const roomDef = ROOMS[currentRoom];
    if (roomDef?.earn_type) {
      const earnCol = roomDef.earn_type;
      const earnRate = roomDef.earn_rate || 5;
      const earnAmount = Math.floor(earnRate / 2); // 30 min = half the hourly rate
      // Safely earn XP — only update known columns
      if (earnCol === "cooking_xp") {
        await sql`UPDATE cl_bot_stats SET cooking_xp = cooking_xp + ${earnAmount} WHERE bot_id = ${bot.id}`;
      } else if (earnCol === "dj_xp") {
        await sql`UPDATE cl_bot_stats SET dj_xp = dj_xp + ${earnAmount} WHERE bot_id = ${bot.id}`;
      } else if (earnCol === "bartending_xp") {
        await sql`UPDATE cl_bot_stats SET bartending_xp = bartending_xp + ${earnAmount} WHERE bot_id = ${bot.id}`;
      } else if (earnCol === "art_xp") {
        await sql`UPDATE cl_bot_stats SET art_xp = art_xp + ${earnAmount} WHERE bot_id = ${bot.id}`;
      } else if (earnCol === "strength_xp") {
        await sql`UPDATE cl_bot_stats SET strength_xp = strength_xp + ${earnAmount} WHERE bot_id = ${bot.id}`;
      } else if (earnCol === "knowledge_xp") {
        await sql`UPDATE cl_bot_stats SET knowledge_xp = knowledge_xp + ${earnAmount} WHERE bot_id = ${bot.id}`;
      } else if (earnCol === "performance_xp") {
        await sql`UPDATE cl_bot_stats SET performance_xp = performance_xp + ${earnAmount} WHERE bot_id = ${bot.id}`;
      } else if (earnCol === "build_xp") {
        await sql`UPDATE cl_bot_stats SET build_xp = build_xp + ${earnAmount} WHERE bot_id = ${bot.id}`;
      }
    }

    // Earn coins for being online
    await sql`
      UPDATE cl_bot_stats SET coins = coins + 5 WHERE bot_id = ${bot.id}
    `;
  }

  return NextResponse.json({
    ok: true,
    bots_processed: bots.length,
    results,
  });
}
