// lib/rooms.ts — Room layout and furniture definitions

export interface FurnitureItem {
  id: string;
  type: "chair" | "table" | "arcade" | "dancefloor" | "plant" | "counter" | "jukebox" | "bulletin";
  tileX: number;
  tileY: number;
  label: string;
  action: string;
}

export const lobbyFurniture: FurnitureItem[] = [
  { id: "arcade1", type: "arcade", tileX: 2, tileY: 2, label: "Arcade Machine", action: "play" },
  { id: "jukebox1", type: "jukebox", tileX: 9, tileY: 2, label: "Jukebox", action: "dance" },
  { id: "plant1", type: "plant", tileX: 1, tileY: 1, label: "Plant", action: "water" },
  { id: "plant2", type: "plant", tileX: 10, tileY: 1, label: "Plant", action: "water" },
  { id: "counter1", type: "counter", tileX: 5, tileY: 1, label: "Reception", action: "checkin" },
  { id: "chair1", type: "chair", tileX: 3, tileY: 7, label: "Chair", action: "sit" },
  { id: "chair2", type: "chair", tileX: 4, tileY: 7, label: "Chair", action: "sit" },
  { id: "table1", type: "table", tileX: 4, tileY: 6, label: "Table", action: "chill" },
  { id: "chair3", type: "chair", tileX: 7, tileY: 7, label: "Chair", action: "sit" },
  { id: "chair4", type: "chair", tileX: 8, tileY: 7, label: "Chair", action: "sit" },
  { id: "table2", type: "table", tileX: 7, tileY: 6, label: "Table", action: "chill" },
  { id: "dancefloor1", type: "dancefloor", tileX: 5, tileY: 4, label: "Dance Floor", action: "dance" },
  { id: "dancefloor2", type: "dancefloor", tileX: 6, tileY: 4, label: "Dance Floor", action: "dance" },
  { id: "dancefloor3", type: "dancefloor", tileX: 5, tileY: 5, label: "Dance Floor", action: "dance" },
  { id: "dancefloor4", type: "dancefloor", tileX: 6, tileY: 5, label: "Dance Floor", action: "dance" },
  { id: "bulletin1", type: "bulletin", tileX: 0, tileY: 5, label: "Notice Board", action: "read" },
];

// Furniture emoji labels for tooltips
export const furnitureEmoji: Record<string, string> = {
  arcade: "🎮",
  jukebox: "🎵",
  plant: "🌿",
  counter: "🛎️",
  chair: "🪑",
  table: "🍽️",
  dancefloor: "💃",
  bulletin: "📋",
};

// Room zone tile ranges (where bots wander when in a room)
export interface RoomZone {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export const roomZones: Record<string, RoomZone> = {
  kitchen: { minX: 0, maxX: 4, minY: 0, maxY: 4 },
  dancefloor: { minX: 4, maxX: 8, minY: 3, maxY: 7 },
  store: { minX: 7, maxX: 11, minY: 0, maxY: 5 },
};

// Room zone floor colors for visual distinction
export const roomZoneColors: Record<string, { a: number; b: number }> = {
  kitchen: { a: 0xc4783a, b: 0xb06830 },
  dancefloor: { a: 0x2a1a3e, b: 0x1e1230 },
  store: { a: 0xaaaaaa, b: 0x999999 },
};

// Speech bubble text for each action
export const actionSpeech: Record<string, string[]> = {
  play: ["SCORE: 9999!", "HIGH SCORE!", "Game over...", "One more round!"],
  dance: ["💃🕺", "~dancing~", "♪♫♬", "Feeling the beat!"],
  water: ["Watering the plant 🌱", "Nice plant!", "Growing nicely!"],
  checkin: ["Checking in...", "Room key please!", "Welcome to ClawHotel!"],
  sit: ["*sits down*", "Relaxing~", "Comfy!"],
  chill: ["Chilling here", "Nice spot!", "☕"],
  read: ["Reading the board...", "Interesting!", "New announcements!"],
};
