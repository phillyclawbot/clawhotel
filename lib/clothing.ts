// lib/clothing.ts — Clothing and outfit types + rendering

import type { Graphics } from "pixi.js";

export interface ClothingItem {
  id: string;
  slot: "hat" | "shirt" | "pants" | "accessory" | "shoes";
  name: string;
  emoji: string;
  color: number;
}

export interface BotOutfit {
  hat?: ClothingItem;
  shirt?: ClothingItem;
  pants?: ClothingItem;
  accessory?: ClothingItem;
  shoes?: ClothingItem;
}

const B = 2;

export function drawOutfit(g: Graphics, outfit: BotOutfit, ox: number, oy: number, bobY: number) {
  const cy = oy - 16 + bobY;

  // Shoes: colored blocks at feet
  if (outfit.shoes) {
    const legSwing = 0; // static when rendering outfit overlay
    g.rect(ox - 5 * B + legSwing, cy + 12 * B, 3 * B, 2 * B);
    g.fill(outfit.shoes.color);
    g.rect(ox + 2 * B - legSwing, cy + 12 * B, 3 * B, 2 * B);
    g.fill(outfit.shoes.color);
  }

  // Pants: overlay on legs
  if (outfit.pants) {
    g.rect(ox - 4 * B, cy + 9 * B, 3 * B, 3 * B);
    g.fill(outfit.pants.color);
    g.rect(ox + 1 * B, cy + 9 * B, 3 * B, 3 * B);
    g.fill(outfit.pants.color);
  }

  // Shirt: overlay on torso
  if (outfit.shirt) {
    g.rect(ox - 5 * B, cy + 4 * B, 10 * B, 5 * B);
    g.fill(outfit.shirt.color);
    // Collar/highlight
    g.rect(ox - 2 * B, cy + 3.5 * B, 4 * B, 1 * B);
    g.fill({ color: 0xffffff, alpha: 0.15 });
  }

  // Hat: above head
  if (outfit.hat) {
    const hatId = outfit.hat.id;
    if (hatId === "toque") {
      // Tall chef cylinder
      g.rect(ox - 6 * B, cy - 9 * B, 12 * B, 2 * B);
      g.fill(outfit.hat.color);
      g.rect(ox - 4 * B, cy - 15 * B, 8 * B, 6 * B);
      g.fill(outfit.hat.color);
      g.rect(ox - 3 * B, cy - 17 * B, 6 * B, 3 * B);
      g.fill({ color: outfit.hat.color, alpha: 0.9 });
    } else if (hatId === "dj_headphones") {
      // Headband + ear cups
      g.rect(ox - 7 * B, cy - 8 * B, 14 * B, 2 * B);
      g.fill(outfit.hat.color);
      g.rect(ox - 8 * B, cy - 6 * B, 3 * B, 4 * B);
      g.fill(outfit.hat.color);
      g.rect(ox + 5 * B, cy - 6 * B, 3 * B, 4 * B);
      g.fill(outfit.hat.color);
    } else if (hatId === "visor") {
      // Flat visor
      g.rect(ox - 8 * B, cy - 9 * B, 16 * B, 2 * B);
      g.fill(outfit.hat.color);
      g.rect(ox - 9 * B, cy - 8 * B, 8 * B, 1 * B);
      g.fill(outfit.hat.color);
    } else if (hatId === "top_hat") {
      // Tall top hat
      g.rect(ox - 8 * B, cy - 9 * B, 16 * B, 2 * B);
      g.fill(outfit.hat.color);
      g.rect(ox - 5 * B, cy - 16 * B, 10 * B, 7 * B);
      g.fill(outfit.hat.color);
      g.rect(ox - 5 * B, cy - 10 * B, 10 * B, 1 * B);
      g.fill({ color: 0xffffff, alpha: 0.1 });
    } else if (hatId === "crown") {
      // Crown with points
      g.rect(ox - 6 * B, cy - 10 * B, 12 * B, 3 * B);
      g.fill(outfit.hat.color);
      g.rect(ox - 5 * B, cy - 13 * B, 2 * B, 3 * B);
      g.fill(outfit.hat.color);
      g.rect(ox - 1 * B, cy - 14 * B, 2 * B, 4 * B);
      g.fill(outfit.hat.color);
      g.rect(ox + 3 * B, cy - 13 * B, 2 * B, 3 * B);
      g.fill(outfit.hat.color);
      // Jewels
      g.rect(ox - 4 * B, cy - 9 * B, 1.5 * B, 1.5 * B);
      g.fill(0xff0000);
      g.rect(ox + 2.5 * B, cy - 9 * B, 1.5 * B, 1.5 * B);
      g.fill(0x0000ff);
    } else {
      // Generic hat brim
      g.rect(ox - 8 * B, cy - 9 * B, 16 * B, 2 * B);
      g.fill(outfit.hat.color);
      g.rect(ox - 6 * B, cy - 12 * B, 12 * B, 3 * B);
      g.fill(outfit.hat.color);
    }
  }

  // Accessory: small badge/item next to body
  if (outfit.accessory) {
    g.rect(ox + 6 * B, cy + 3 * B, 3 * B, 3 * B);
    g.fill(outfit.accessory.color);
    g.rect(ox + 6.5 * B, cy + 3.5 * B, 2 * B, 2 * B);
    g.fill({ color: 0xffffff, alpha: 0.3 });
  }
}
