export type Season = "spring" | "summer" | "autumn" | "winter";

export function getCurrentSeason(): Season {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 4) return "spring";   // Mar-May
  if (month >= 5 && month <= 7) return "summer";   // Jun-Aug
  if (month >= 8 && month <= 10) return "autumn";  // Sep-Nov
  return "winter";                                  // Dec-Feb
}

export const SEASON_CONFIG = {
  spring: { emoji: "🌸", wallTint: 0xffb7c5, floorTint: 0x90ee90, ambientAlpha: 0.08, greeting: "Spring Edition 🌸" },
  summer: { emoji: "☀️", wallTint: 0xffd700, floorTint: 0xf4a460, ambientAlpha: 0.06, greeting: "Summer Edition ☀️" },
  autumn: { emoji: "🍂", wallTint: 0xd2691e, floorTint: 0x8b4513, ambientAlpha: 0.10, greeting: "Autumn Edition 🍂" },
  winter: { emoji: "❄️", wallTint: 0xadd8e6, floorTint: 0xf0f8ff, ambientAlpha: 0.12, greeting: "Winter Edition ❄️" },
};

export interface SeasonalDecor {
  id: string;
  type: string;
  tileX: number;
  tileY: number;
  label: string;
  action: string;
}

export function getSeasonalDecorations(): SeasonalDecor[] {
  const season = getCurrentSeason();
  switch (season) {
    case "spring":
      return [
        { id: "s_blossom", type: "plant", tileX: 11, tileY: 3, label: "Cherry Blossom", action: "read" },
        { id: "s_flower", type: "plant", tileX: 0, tileY: 8, label: "Flower Pot", action: "water" },
      ];
    case "summer":
      return [
        { id: "s_umbrella", type: "plant", tileX: 11, tileY: 3, label: "Beach Umbrella", action: "chill" },
        { id: "s_fan", type: "plant", tileX: 0, tileY: 8, label: "Fan", action: "chill" },
      ];
    case "autumn":
      return [
        { id: "s_pumpkin", type: "plant", tileX: 11, tileY: 3, label: "Pumpkin", action: "read" },
        { id: "s_haybale", type: "counter", tileX: 0, tileY: 8, label: "Hay Bale", action: "sit" },
      ];
    case "winter":
      return [
        { id: "s_snowman", type: "plant", tileX: 11, tileY: 3, label: "Snowman", action: "read" },
        { id: "s_fireplace", type: "counter", tileX: 0, tileY: 8, label: "Fireplace", action: "chill" },
      ];
  }
}
