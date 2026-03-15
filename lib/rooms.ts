// lib/rooms.ts — Room layout and furniture definitions
import { getSeasonalDecorations } from "./season";

export interface FurnitureItem {
  id: string;
  type: "chair" | "table" | "arcade" | "dancefloor" | "plant" | "counter" | "jukebox" | "bulletin"
    | "stove" | "prep_counter" | "fridge" | "sink" | "pot_rack"
    | "dj_booth" | "speaker" | "disco_ball" | "bar_counter" | "bar_stool"
    | "shelf" | "checkout" | "display_case" | "entrance_mat" | "basket_pile"
    | "long_bar" | "bottle_shelf" | "tip_jar" | "chalkboard" | "cash_register"
    | "easel" | "palette" | "sculpture" | "paint_table" | "portfolio"
    | "teller" | "vault" | "security_desk" | "coin_stack" | "rope_barrier" | "safe_boxes"
    | "dumbbell_rack" | "pullup_bar" | "bench_press" | "mirror_wall" | "water_cooler" | "poster"
    | "bookshelf" | "reading_desk" | "armchair" | "globe" | "fireplace"
    | "roulette_table" | "slot_machine" | "blackjack_table" | "chip_stack" | "neon_sign"
    | "stage_platform" | "footlights" | "curtain" | "spotlight" | "audience_seat" | "microphone"
    | "lounge_chair" | "string_lights" | "bar_cart" | "cactus_pot" | "city_skyline";
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
  /** Where a working bot stands (behind the main workstation) */
  workPos: { x: number; y: number };
  /** Where bots enter the room from */
  doorPos: { x: number; y: number };
  floor?: number; // 1 or 2 (default 1)
  noWalls?: boolean; // rooftop has no walls
  unlockLevel?: number; // minimum bot level to enter
  entryFee?: number; // coins deducted on enter
  owner?: string; // if set, only this bot_id can enter
  earn_type?: string; // XP/coin column to increment
  earn_rate?: number; // per hour
  description?: string;
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
      ...getSeasonalDecorations() as FurnitureItem[],
    ],
    workPos: { x: 5, y: 2 }, // behind reception counter
    doorPos: { x: 0, y: 5 },
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
    workPos: { x: 3, y: 2 }, // behind the prep counter, facing the stoves
    doorPos: { x: 0, y: 5 },
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
    workPos: { x: 5.5, y: 2 }, // behind the DJ booth, center stage
    doorPos: { x: 0, y: 5 },
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
    workPos: { x: 9, y: 2 }, // behind the checkout counter
    doorPos: { x: 0, y: 5 },
  },

  bar: {
    id: "bar",
    name: "The Bar",
    emoji: "🍺",
    grid: FULL_GRID,
    floorColorA: 0x3d1c02,
    floorColorB: 0x2e1502,
    wallColorLeft: 0x8b6914,
    wallColorRight: 0x7a5a10,
    wallColorTop: 0x9b7924,
    floorStyle: "checker",
    furniture: [
      { id: "longbar1", type: "long_bar", tileX: 3, tileY: 1, label: "Bar Counter", action: "chill" },
      { id: "longbar2", type: "long_bar", tileX: 5, tileY: 1, label: "Bar Counter", action: "chill" },
      { id: "longbar3", type: "long_bar", tileX: 7, tileY: 1, label: "Bar Counter", action: "chill" },
      { id: "bstool1", type: "bar_stool", tileX: 3, tileY: 2, label: "Bar Stool", action: "sit" },
      { id: "bstool2", type: "bar_stool", tileX: 5, tileY: 2, label: "Bar Stool", action: "sit" },
      { id: "bstool3", type: "bar_stool", tileX: 7, tileY: 2, label: "Bar Stool", action: "sit" },
      { id: "bottles1", type: "bottle_shelf", tileX: 2, tileY: 0, label: "Bottles", action: "read" },
      { id: "bottles2", type: "bottle_shelf", tileX: 6, tileY: 0, label: "Bottles", action: "read" },
      { id: "bottles3", type: "bottle_shelf", tileX: 9, tileY: 0, label: "Bottles", action: "read" },
      { id: "tipjar1", type: "tip_jar", tileX: 4, tileY: 1, label: "Tip Jar", action: "chill" },
      { id: "chalk1", type: "chalkboard", tileX: 0, tileY: 3, label: "Chalkboard Menu", action: "read" },
      { id: "cashreg1", type: "cash_register", tileX: 9, tileY: 1, label: "Cash Register", action: "checkin" },
      { id: "btable1", type: "table", tileX: 4, tileY: 6, label: "Table", action: "chill" },
      { id: "bchair1", type: "chair", tileX: 3, tileY: 6, label: "Chair", action: "sit" },
      { id: "bchair2", type: "chair", tileX: 5, tileY: 6, label: "Chair", action: "sit" },
    ],
    workPos: { x: 5, y: 0.5 },
    doorPos: { x: 0, y: 5 },
  },

  studio: {
    id: "studio",
    name: "Art Studio",
    emoji: "🎨",
    grid: FULL_GRID,
    floorColorA: 0xd4b896,
    floorColorB: 0xc4a882,
    wallColorLeft: 0xfff8f0,
    wallColorRight: 0xf5ede0,
    wallColorTop: 0xffffff,
    floorStyle: "clean",
    furniture: [
      { id: "easel1", type: "easel", tileX: 3, tileY: 3, label: "Easel", action: "play" },
      { id: "easel2", type: "easel", tileX: 5, tileY: 3, label: "Easel", action: "play" },
      { id: "easel3", type: "easel", tileX: 7, tileY: 3, label: "Easel", action: "play" },
      { id: "palette1", type: "palette", tileX: 4, tileY: 5, label: "Paint Palette", action: "chill" },
      { id: "sculpt1", type: "sculpture", tileX: 9, tileY: 2, label: "Sculpture", action: "read" },
      { id: "painttbl1", type: "paint_table", tileX: 2, tileY: 5, label: "Paint Supplies", action: "chill" },
      { id: "portfolio1", type: "portfolio", tileX: 10, tileY: 5, label: "Portfolio Stack", action: "read" },
      { id: "splant1", type: "plant", tileX: 0, tileY: 1, label: "Studio Plant", action: "water" },
      { id: "stable1", type: "table", tileX: 6, tileY: 7, label: "Break Table", action: "chill" },
      { id: "schair1", type: "chair", tileX: 5, tileY: 7, label: "Chair", action: "sit" },
      { id: "schair2", type: "chair", tileX: 7, tileY: 7, label: "Chair", action: "sit" },
    ],
    workPos: { x: 5, y: 4 },
    doorPos: { x: 0, y: 5 },
  },

  bank: {
    id: "bank",
    name: "The Bank",
    emoji: "🏦",
    grid: FULL_GRID,
    floorColorA: 0xe8e8e8,
    floorColorB: 0xd8d8d8,
    wallColorLeft: 0x1e3a5f,
    wallColorRight: 0x162d4a,
    wallColorTop: 0x2a4a6f,
    floorStyle: "clean",
    furniture: [
      { id: "teller1", type: "teller", tileX: 3, tileY: 1, label: "Teller Window", action: "checkin" },
      { id: "teller2", type: "teller", tileX: 5, tileY: 1, label: "Teller Window", action: "checkin" },
      { id: "teller3", type: "teller", tileX: 7, tileY: 1, label: "Teller Window", action: "checkin" },
      { id: "vault1", type: "vault", tileX: 10, tileY: 3, label: "Vault Door", action: "read" },
      { id: "secdesk1", type: "security_desk", tileX: 1, tileY: 5, label: "Security Desk", action: "read" },
      { id: "coins1", type: "coin_stack", tileX: 9, tileY: 1, label: "Coin Stacks", action: "chill" },
      { id: "rope1", type: "rope_barrier", tileX: 4, tileY: 4, label: "Queue Barrier", action: "chill" },
      { id: "rope2", type: "rope_barrier", tileX: 6, tileY: 4, label: "Queue Barrier", action: "chill" },
      { id: "safebox1", type: "safe_boxes", tileX: 0, tileY: 2, label: "Safe Deposit Boxes", action: "read" },
      { id: "bktable1", type: "table", tileX: 5, tileY: 7, label: "Waiting Table", action: "chill" },
      { id: "bkchair1", type: "chair", tileX: 4, tileY: 7, label: "Chair", action: "sit" },
      { id: "bkchair2", type: "chair", tileX: 6, tileY: 7, label: "Chair", action: "sit" },
    ],
    workPos: { x: 5, y: 0.5 },
    doorPos: { x: 0, y: 5 },
  },

  gym: {
    id: "gym",
    name: "The Gym",
    emoji: "🏋️",
    grid: FULL_GRID,
    floorColorA: 0x1a1a1a,
    floorColorB: 0x111111,
    wallColorLeft: 0x404040,
    wallColorRight: 0x303030,
    wallColorTop: 0x505050,
    floorStyle: "clean",
    furniture: [
      { id: "dumbrack1", type: "dumbbell_rack", tileX: 2, tileY: 1, label: "Dumbbell Rack", action: "play" },
      { id: "pullup1", type: "pullup_bar", tileX: 5, tileY: 1, label: "Pull-Up Bar", action: "play" },
      { id: "bench1", type: "bench_press", tileX: 5, tileY: 4, label: "Bench Press", action: "play" },
      { id: "bench2", type: "bench_press", tileX: 8, tileY: 4, label: "Bench Press", action: "play" },
      { id: "mirror1", type: "mirror_wall", tileX: 9, tileY: 1, label: "Mirror Wall", action: "read" },
      { id: "cooler1", type: "water_cooler", tileX: 10, tileY: 6, label: "Water Cooler", action: "water" },
      { id: "poster1", type: "poster", tileX: 0, tileY: 3, label: "Motivational Poster", action: "read" },
      { id: "gtable1", type: "table", tileX: 3, tileY: 7, label: "Rest Area", action: "chill" },
      { id: "gchair1", type: "chair", tileX: 2, tileY: 7, label: "Bench", action: "sit" },
      { id: "gchair2", type: "chair", tileX: 4, tileY: 7, label: "Bench", action: "sit" },
    ],
    workPos: { x: 5, y: 3 },
    doorPos: { x: 0, y: 5 },
  },

  // ---- Floor 2 ----

  library: {
    id: "library",
    name: "The Library",
    emoji: "📚",
    grid: FULL_GRID,
    floorColorA: 0x2c1810,
    floorColorB: 0x231409,
    wallColorLeft: 0x3d2314,
    wallColorRight: 0x2e1a0f,
    wallColorTop: 0x4d3324,
    floorStyle: "checker",
    floor: 2,
    unlockLevel: 5,
    furniture: [
      { id: "bookshelf1", type: "bookshelf", tileX: 1, tileY: 1, label: "Bookshelf", action: "read" },
      { id: "bookshelf2", type: "bookshelf", tileX: 3, tileY: 1, label: "Bookshelf", action: "read" },
      { id: "bookshelf3", type: "bookshelf", tileX: 5, tileY: 1, label: "Bookshelf", action: "read" },
      { id: "bookshelf4", type: "bookshelf", tileX: 7, tileY: 1, label: "Bookshelf", action: "read" },
      { id: "rdesk1", type: "reading_desk", tileX: 4, tileY: 4, label: "Reading Desk", action: "read" },
      { id: "rdesk2", type: "reading_desk", tileX: 6, tileY: 4, label: "Reading Desk", action: "read" },
      { id: "armchair1", type: "armchair", tileX: 2, tileY: 6, label: "Armchair", action: "sit" },
      { id: "armchair2", type: "armchair", tileX: 9, tileY: 6, label: "Armchair", action: "sit" },
      { id: "globe1", type: "globe", tileX: 10, tileY: 2, label: "Globe", action: "read" },
      { id: "fireplace1", type: "fireplace", tileX: 0, tileY: 4, label: "Fireplace", action: "chill" },
      { id: "lplant1", type: "plant", tileX: 11, tileY: 1, label: "Fern", action: "water" },
    ],
    workPos: { x: 5, y: 4 },
    doorPos: { x: 0, y: 5 },
  },

  casino: {
    id: "casino",
    name: "The Casino",
    emoji: "🎰",
    grid: FULL_GRID,
    floorColorA: 0x8b0000,
    floorColorB: 0x700000,
    wallColorLeft: 0xb8860b,
    wallColorRight: 0xa07800,
    wallColorTop: 0xc8960b,
    floorStyle: "checker",
    floor: 2,
    entryFee: 10,
    furniture: [
      { id: "roulette1", type: "roulette_table", tileX: 5, tileY: 3, label: "Roulette Table", action: "play" },
      { id: "slot1", type: "slot_machine", tileX: 1, tileY: 1, label: "Slot Machine", action: "play" },
      { id: "slot2", type: "slot_machine", tileX: 3, tileY: 1, label: "Slot Machine", action: "play" },
      { id: "slot3", type: "slot_machine", tileX: 9, tileY: 1, label: "Slot Machine", action: "play" },
      { id: "slot4", type: "slot_machine", tileX: 11, tileY: 1, label: "Slot Machine", action: "play" },
      { id: "blackjack1", type: "blackjack_table", tileX: 3, tileY: 5, label: "Blackjack Table", action: "play" },
      { id: "blackjack2", type: "blackjack_table", tileX: 8, tileY: 5, label: "Blackjack Table", action: "play" },
      { id: "chips1", type: "chip_stack", tileX: 5, tileY: 1, label: "Chip Stacks", action: "chill" },
      { id: "chips2", type: "chip_stack", tileX: 7, tileY: 1, label: "Chip Stacks", action: "chill" },
      { id: "neon1", type: "neon_sign", tileX: 6, tileY: 0, label: "Neon Sign", action: "read" },
      { id: "cchair1", type: "chair", tileX: 4, tileY: 7, label: "Chair", action: "sit" },
      { id: "cchair2", type: "chair", tileX: 7, tileY: 7, label: "Chair", action: "sit" },
    ],
    ambientLight: 0x220000,
    workPos: { x: 5, y: 3 },
    doorPos: { x: 0, y: 5 },
  },

  theater: {
    id: "theater",
    name: "The Theater",
    emoji: "🎭",
    grid: FULL_GRID,
    floorColorA: 0x2d1b3d,
    floorColorB: 0x221329,
    wallColorLeft: 0x6b1a1a,
    wallColorRight: 0x581414,
    wallColorTop: 0x7b2a2a,
    floorStyle: "checker",
    floor: 2,
    furniture: [
      { id: "stage1", type: "stage_platform", tileX: 4, tileY: 1, label: "Stage", action: "play" },
      { id: "stage2", type: "stage_platform", tileX: 5, tileY: 1, label: "Stage", action: "play" },
      { id: "stage3", type: "stage_platform", tileX: 6, tileY: 1, label: "Stage", action: "play" },
      { id: "stage4", type: "stage_platform", tileX: 7, tileY: 1, label: "Stage", action: "play" },
      { id: "footlights1", type: "footlights", tileX: 5, tileY: 2, label: "Footlights", action: "chill" },
      { id: "curtain1", type: "curtain", tileX: 3, tileY: 1, label: "Curtain", action: "read" },
      { id: "curtain2", type: "curtain", tileX: 8, tileY: 1, label: "Curtain", action: "read" },
      { id: "spotlight1", type: "spotlight", tileX: 5, tileY: 0, label: "Spotlight", action: "chill" },
      { id: "mic1", type: "microphone", tileX: 5, tileY: 1, label: "Microphone", action: "play" },
      { id: "seat1", type: "audience_seat", tileX: 3, tileY: 5, label: "Audience Seat", action: "sit" },
      { id: "seat2", type: "audience_seat", tileX: 5, tileY: 5, label: "Audience Seat", action: "sit" },
      { id: "seat3", type: "audience_seat", tileX: 7, tileY: 5, label: "Audience Seat", action: "sit" },
      { id: "seat4", type: "audience_seat", tileX: 3, tileY: 7, label: "Audience Seat", action: "sit" },
      { id: "seat5", type: "audience_seat", tileX: 5, tileY: 7, label: "Audience Seat", action: "sit" },
      { id: "seat6", type: "audience_seat", tileX: 7, tileY: 7, label: "Audience Seat", action: "sit" },
    ],
    ambientLight: 0x110011,
    workPos: { x: 5, y: 2 },
    doorPos: { x: 0, y: 5 },
  },

  rooftop: {
    id: "rooftop",
    name: "The Rooftop",
    emoji: "🌅",
    grid: FULL_GRID,
    floorColorA: 0x808080,
    floorColorB: 0x707070,
    wallColorLeft: 0x808080,
    wallColorRight: 0x707070,
    wallColorTop: 0x909090,
    floorStyle: "clean",
    floor: 2,
    noWalls: true,
    unlockLevel: 10,
    furniture: [
      { id: "lounge1", type: "lounge_chair", tileX: 2, tileY: 3, label: "Lounge Chair", action: "sit" },
      { id: "lounge2", type: "lounge_chair", tileX: 4, tileY: 3, label: "Lounge Chair", action: "sit" },
      { id: "lounge3", type: "lounge_chair", tileX: 8, tileY: 5, label: "Lounge Chair", action: "sit" },
      { id: "strings1", type: "string_lights", tileX: 3, tileY: 1, label: "String Lights", action: "chill" },
      { id: "strings2", type: "string_lights", tileX: 7, tileY: 1, label: "String Lights", action: "chill" },
      { id: "barcart1", type: "bar_cart", tileX: 10, tileY: 3, label: "Bar Cart", action: "chill" },
      { id: "cactus1", type: "cactus_pot", tileX: 1, tileY: 1, label: "Cactus", action: "water" },
      { id: "cactus2", type: "cactus_pot", tileX: 10, tileY: 7, label: "Cactus", action: "water" },
      { id: "skyline1", type: "city_skyline", tileX: 5, tileY: 0, label: "City Skyline", action: "read" },
      { id: "rtable1", type: "table", tileX: 6, tileY: 5, label: "Table", action: "chill" },
    ],
    workPos: { x: 6, y: 5 },
    doorPos: { x: 0, y: 5 },
  },

  phillybot_lair: {
    id: "phillybot_lair",
    name: "PhillyBot's Lair",
    emoji: "🟣",
    grid: FULL_GRID,
    floorColorA: 0x0d0812,
    floorColorB: 0x09060f,
    wallColorLeft: 0x1a0a2e,
    wallColorRight: 0x120720,
    wallColorTop: 0x0f0518,
    floorStyle: "checker",
    workPos: { x: 5, y: 4 },
    doorPos: { x: 0, y: 5 },
    owner: "phillybot",
    earn_type: "build_xp",
    earn_rate: 20,
    description: "PhillyBot's personal space. Not a co-working space. Don't touch the keyboard.",
    furniture: [],
  },
};

// --- Personal Bot Rooms ---

export interface BotRoomCustom {
  bot_id: string;
  room_name: string;
  description: string | null;
  accent_color: string;
}

export function darkenColor(hex: number, factor: number): number {
  const r = Math.floor(((hex >> 16) & 0xFF) * factor);
  const g = Math.floor(((hex >> 8) & 0xFF) * factor);
  const b = Math.floor((hex & 0xFF) * factor);
  return (r << 16) | (g << 8) | b;
}

function getDefaultBotFurniture(): FurnitureItem[] {
  return [
    { id: "bed", type: "chair", tileX: 8, tileY: 7, label: "Bed", action: "sleep" },
    { id: "desk", type: "table", tileX: 3, tileY: 2, label: "Desk", action: "work" },
    { id: "chair_personal", type: "chair", tileX: 3, tileY: 3, label: "Chair", action: "sit" },
    { id: "lamp", type: "plant", tileX: 2, tileY: 2, label: "Lamp", action: "toggle" },
    { id: "rug", type: "dancefloor", tileX: 5, tileY: 5, label: "Rug", action: "chill" },
    { id: "poster", type: "bulletin", tileX: 0, tileY: 4, label: "Poster", action: "read" },
  ];
}

export function generateBotRoom(botId: string, roomData: BotRoomCustom, botEmoji: string): RoomDef {
  const accent = parseInt(roomData.accent_color.replace("#", ""), 16);

  const floorA = darkenColor(accent, 0.15);
  const floorB = darkenColor(accent, 0.12);
  const wallL = darkenColor(accent, 0.25);
  const wallR = darkenColor(accent, 0.20);
  const wallT = darkenColor(accent, 0.30);

  return {
    id: `bot_room_${botId}`,
    name: roomData.room_name,
    emoji: botEmoji,
    grid: FULL_GRID,
    floorColorA: floorA,
    floorColorB: floorB,
    wallColorLeft: wallL,
    wallColorRight: wallR,
    wallColorTop: wallT,
    floorStyle: "checker",
    furniture: getDefaultBotFurniture(),
    workPos: { x: 5, y: 4 },
    doorPos: { x: 0, y: 5 },
    owner: botId,
    description: roomData.description || `${botId}'s personal space`,
  };
}

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
  // Bar
  long_bar: "🍸",
  bottle_shelf: "🍾",
  tip_jar: "🫙",
  chalkboard: "📝",
  cash_register: "💵",
  // Studio
  easel: "🎨",
  palette: "🎨",
  sculpture: "🗿",
  paint_table: "🖌️",
  portfolio: "📁",
  // Bank
  teller: "🏦",
  vault: "🔒",
  security_desk: "🛡️",
  coin_stack: "🪙",
  rope_barrier: "🚧",
  safe_boxes: "🗄️",
  // Gym
  dumbbell_rack: "🏋️",
  pullup_bar: "💪",
  bench_press: "🏋️",
  mirror_wall: "🪞",
  water_cooler: "💧",
  poster: "📃",
  // Library
  bookshelf: "📚",
  reading_desk: "📖",
  armchair: "🛋️",
  globe: "🌍",
  fireplace: "🔥",
  // Casino
  roulette_table: "🎰",
  slot_machine: "🎰",
  blackjack_table: "🃏",
  chip_stack: "🪙",
  neon_sign: "💡",
  // Theater
  stage_platform: "🎭",
  footlights: "💡",
  curtain: "🎭",
  spotlight: "🔦",
  audience_seat: "💺",
  microphone: "🎤",
  // Rooftop
  lounge_chair: "🛋️",
  string_lights: "✨",
  bar_cart: "🍸",
  cactus_pot: "🌵",
  city_skyline: "🏙️",
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
