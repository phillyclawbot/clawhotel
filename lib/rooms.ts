// lib/rooms.ts — Room layout and furniture definitions

export interface FurnitureItem {
  id: string;
  type: "chair" | "table" | "arcade" | "dancefloor" | "plant" | "counter" | "jukebox" | "bulletin"
    | "stove" | "prep_counter" | "fridge" | "sink" | "pot_rack"
    | "dj_booth" | "speaker" | "disco_ball" | "bar_counter" | "bar_stool"
    | "shelf" | "checkout" | "display_case" | "entrance_mat" | "basket_pile";
  tileX: number;
  tileY: number;
  label: string;
  action: string;
}

export interface RoomDef {
  id: string;
  name: string;
  emoji: string;
  grid: number[][];        // 12x10 walkable grid
  floorColorA: number;     // primary tile color
  floorColorB: number;     // alternate tile color
  wallColorLeft: number;
  wallColorRight: number;
  wallColorTop: number;
  floorStyle: "checker" | "disco" | "clean" | "tile";
  furniture: FurnitureItem[];
  ambientLight?: number;   // overlay tint color (hex)
}

// Standard 12x10 walkable grid (1=walkable, 0=blocked)
const FULL_GRID: number[][] = Array.from({ length: 10 }, () => Array(12).fill(1));

export const ROOMS: Record<string, RoomDef> = {
  lobby: {
    id: "lobby",
    name: "The Lobby",
    emoji: "🏨",
    grid: FULL_GRID,
    floorColorA: 0x8b7355,
    floorColorB: 0x7a6348,
    wallColorLeft: 0x4a90d9,
    wallColorRight: 0x3a7bc8,
    wallColorTop: 0x5aa0e9,
    floorStyle: "checker",
    furniture: [
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
    ],
  },

  kitchen: {
    id: "kitchen",
    name: "Kitchen",
    emoji: "🍳",
    grid: FULL_GRID,
    floorColorA: 0xc4783a,
    floorColorB: 0xb8692e,
    wallColorLeft: 0xe8d5a3,
    wallColorRight: 0xd4c090,
    wallColorTop: 0xf0ddb0,
    floorStyle: "tile",
    furniture: [
      { id: "stove1", type: "stove", tileX: 1, tileY: 1, label: "Stove", action: "play" },
      { id: "stove2", type: "stove", tileX: 3, tileY: 1, label: "Stove", action: "play" },
      { id: "stove3", type: "stove", tileX: 5, tileY: 1, label: "Stove", action: "play" },
      { id: "stove4", type: "stove", tileX: 7, tileY: 1, label: "Stove", action: "play" },
      { id: "prep1", type: "prep_counter", tileX: 2, tileY: 3, label: "Prep Counter", action: "chill" },
      { id: "prep2", type: "prep_counter", tileX: 3, tileY: 3, label: "Prep Counter", action: "chill" },
      { id: "prep3", type: "prep_counter", tileX: 4, tileY: 3, label: "Prep Counter", action: "chill" },
      { id: "prep4", type: "prep_counter", tileX: 2, tileY: 4, label: "Prep Counter", action: "chill" },
      { id: "fridge1", type: "fridge", tileX: 10, tileY: 1, label: "Refrigerator", action: "read" },
      { id: "sink1", type: "sink", tileX: 9, tileY: 1, label: "Sink", action: "water" },
      { id: "potrack1", type: "pot_rack", tileX: 4, tileY: 1, label: "Pot Rack", action: "read" },
      { id: "ktable1", type: "table", tileX: 8, tileY: 6, label: "Table", action: "sit" },
      { id: "kchair1", type: "chair", tileX: 7, tileY: 6, label: "Chair", action: "sit" },
      { id: "kchair2", type: "chair", tileX: 9, tileY: 6, label: "Chair", action: "sit" },
    ],
  },

  dancefloor: {
    id: "dancefloor",
    name: "Dance Floor",
    emoji: "🎧",
    grid: FULL_GRID,
    floorColorA: 0x1a1a2e,
    floorColorB: 0x151528,
    wallColorLeft: 0x0d0d2e,
    wallColorRight: 0x08081a,
    wallColorTop: 0x14143a,
    floorStyle: "disco",
    furniture: [
      { id: "djbooth1", type: "dj_booth", tileX: 5, tileY: 1, label: "DJ Booth", action: "play" },
      { id: "djbooth2", type: "dj_booth", tileX: 6, tileY: 1, label: "DJ Booth", action: "play" },
      { id: "speaker1", type: "speaker", tileX: 3, tileY: 1, label: "Speaker", action: "dance" },
      { id: "speaker2", type: "speaker", tileX: 8, tileY: 1, label: "Speaker", action: "dance" },
      { id: "discoball1", type: "disco_ball", tileX: 5, tileY: 4, label: "Disco Ball", action: "dance" },
      { id: "bar1", type: "bar_counter", tileX: 1, tileY: 7, label: "Bar", action: "chill" },
      { id: "bar2", type: "bar_counter", tileX: 2, tileY: 7, label: "Bar", action: "chill" },
      { id: "bar3", type: "bar_counter", tileX: 3, tileY: 7, label: "Bar", action: "chill" },
      { id: "stool1", type: "bar_stool", tileX: 1, tileY: 8, label: "Bar Stool", action: "sit" },
      { id: "stool2", type: "bar_stool", tileX: 2, tileY: 8, label: "Bar Stool", action: "sit" },
      { id: "stool3", type: "bar_stool", tileX: 3, tileY: 8, label: "Bar Stool", action: "sit" },
      { id: "stool4", type: "bar_stool", tileX: 4, tileY: 8, label: "Bar Stool", action: "sit" },
    ],
    ambientLight: 0x110022,
  },

  store: {
    id: "store",
    name: "Convenience Store",
    emoji: "🏪",
    grid: FULL_GRID,
    floorColorA: 0xcccccc,
    floorColorB: 0xbbbbbb,
    wallColorLeft: 0xffffff,
    wallColorRight: 0xf0f0f0,
    wallColorTop: 0xffffff,
    floorStyle: "clean",
    furniture: [
      { id: "shelf1", type: "shelf", tileX: 2, tileY: 2, label: "Shelf", action: "read" },
      { id: "shelf2", type: "shelf", tileX: 2, tileY: 4, label: "Shelf", action: "read" },
      { id: "shelf3", type: "shelf", tileX: 2, tileY: 6, label: "Shelf", action: "read" },
      { id: "shelf4", type: "shelf", tileX: 5, tileY: 2, label: "Shelf", action: "read" },
      { id: "shelf5", type: "shelf", tileX: 5, tileY: 4, label: "Shelf", action: "read" },
      { id: "shelf6", type: "shelf", tileX: 5, tileY: 6, label: "Shelf", action: "read" },
      { id: "checkout1", type: "checkout", tileX: 9, tileY: 3, label: "Checkout", action: "checkin" },
      { id: "checkout2", type: "checkout", tileX: 9, tileY: 4, label: "Checkout", action: "checkin" },
      { id: "display1", type: "display_case", tileX: 8, tileY: 1, label: "Drinks", action: "read" },
      { id: "display2", type: "display_case", tileX: 10, tileY: 1, label: "Snacks", action: "read" },
      { id: "mat1", type: "entrance_mat", tileX: 9, tileY: 8, label: "Entrance", action: "chill" },
      { id: "baskets1", type: "basket_pile", tileX: 10, tileY: 8, label: "Baskets", action: "chill" },
    ],
  },
};

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
  stove: "🔥",
  prep_counter: "🔪",
  fridge: "🧊",
  sink: "🚰",
  pot_rack: "🍳",
  dj_booth: "🎧",
  speaker: "🔊",
  disco_ball: "🪩",
  bar_counter: "🍸",
  bar_stool: "🪑",
  shelf: "📦",
  checkout: "💰",
  display_case: "🧃",
  entrance_mat: "🚪",
  basket_pile: "🧺",
};

// Room zone definitions (kept for backward compat with API)
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

export const roomZoneColors: Record<string, { a: number; b: number }> = {
  kitchen: { a: 0xc4783a, b: 0xb06830 },
  dancefloor: { a: 0x2a1a3e, b: 0x1e1230 },
  store: { a: 0xaaaaaa, b: 0x999999 },
};

// Keep lobbyFurniture export for backward compat
export const lobbyFurniture = ROOMS.lobby.furniture;

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
