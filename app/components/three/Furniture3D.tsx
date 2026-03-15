"use client";

import { memo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Clone } from "@react-three/drei";
import type { FurnitureItem } from "@/lib/rooms";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════
   GLB FURNITURE — Kenney low-poly models from public/models/
   ═══════════════════════════════════════════════════════════ */

interface ModelMapping {
  model: string;
  scale: number;
  rotationY?: number;
}

const FURNITURE_MODEL_MAP: Record<string, ModelMapping> = {
  // Kitchen
  stove: { model: "kitchenStove", scale: 1.0 },
  prep_counter: { model: "kitchenCabinet", scale: 1.0 },
  fridge: { model: "kitchenFridgeLarge", scale: 1.0 },
  sink: { model: "kitchenSink", scale: 1.0 },
  pot_rack: { model: "hoodModern", scale: 1.0 },

  // Seating
  chair: { model: "chairCushion", scale: 1.0 },
  table: { model: "table", scale: 1.0 },

  // Bar
  long_bar: { model: "kitchenBar", scale: 1.2 },
  bar_counter: { model: "kitchenBarEnd", scale: 1.0 },
  bar_stool: { model: "stoolBar", scale: 1.0 },
  tip_jar: { model: "kitchenBlender", scale: 0.6 },
  bottle_shelf: { model: "bookcaseOpen", scale: 0.8 },
  chalkboard: { model: "televisionVintage", scale: 0.8 },

  // Tech/Entertainment
  arcade: { model: "televisionVintage", scale: 1.2 },
  jukebox: { model: "radio", scale: 1.5 },
  dj_booth: { model: "desk", scale: 1.0 },
  speaker: { model: "speaker", scale: 1.0 },
  bulletin: { model: "televisionModern", scale: 0.8 },
  computer_screen: { model: "computerScreen", scale: 1.0 },

  // Living
  counter: { model: "kitchenCabinet", scale: 1.0 },
  plant: { model: "pottedPlant", scale: 1.2 },
  shelf: { model: "bookcaseOpen", scale: 1.0 },
  display_case: { model: "bookcaseClosedDoors", scale: 1.0 },
  entrance_mat: { model: "rugRectangle", scale: 1.5 },
  basket_pile: { model: "books", scale: 0.8 },

  // Library
  bookshelf: { model: "bookcaseClosedWide", scale: 1.0 },
  reading_desk: { model: "desk", scale: 1.0 },
  armchair: { model: "loungeChair", scale: 1.0 },
  globe: { model: "lampRoundTable", scale: 0.8 },
  fireplace: { model: "televisionVintage", scale: 1.5 },

  // Bank
  teller: { model: "desk", scale: 1.0 },
  vault: { model: "bookcaseClosedDoors", scale: 1.5 },
  security_desk: { model: "deskCorner", scale: 1.0 },
  safe_boxes: { model: "bookcaseClosed", scale: 1.0 },
  cash_register: { model: "computerScreen", scale: 0.6 },

  // Gym
  dumbbell_rack: { model: "bookcaseOpenLow", scale: 1.0 },
  bench_press: { model: "bench", scale: 1.0 },
  mirror_wall: { model: "televisionModern", scale: 1.5 },
  water_cooler: { model: "kitchenFridge", scale: 0.6 },
  pullup_bar: { model: "coatRackStanding", scale: 1.2 },
  poster: { model: "televisionModern", scale: 0.6 },

  // Art Studio
  easel: { model: "coatRackStanding", scale: 1.0 },
  palette: { model: "books", scale: 0.8 },
  sculpture: { model: "pottedPlant", scale: 1.0 },
  paint_table: { model: "sideTable", scale: 1.0 },
  portfolio: { model: "books", scale: 0.6 },

  // Casino
  roulette_table: { model: "tableRound", scale: 1.2 },
  slot_machine: { model: "televisionVintage", scale: 1.0 },
  blackjack_table: { model: "tableCoffee", scale: 1.3 },
  neon_sign: { model: "televisionModern", scale: 0.8 },
  chip_stack: { model: "books", scale: 0.5 },

  // Theater
  stage_platform: { model: "floorFull", scale: 2.0 },
  spotlight: { model: "lampSquareFloor", scale: 1.2 },
  audience_seat: { model: "chairCushion", scale: 0.9 },
  microphone: { model: "lampRoundFloor", scale: 0.6 },
  footlights: { model: "lampSquareFloor", scale: 0.5 },
  curtain: { model: "bookcaseClosedWide", scale: 1.5 },

  // Rooftop
  lounge_chair: { model: "loungeChair", scale: 1.0 },
  bar_cart: { model: "sideTableDrawers", scale: 0.8 },
  string_lights: { model: "lampSquareFloor", scale: 0.5 },
  cactus_pot: { model: "plantSmall1", scale: 1.0 },
  city_skyline: { model: "bookcaseClosedWide", scale: 2.0 },

  // Store
  checkout: { model: "kitchenBar", scale: 1.0 },
  rope_barrier: { model: "coatRackStanding", scale: 0.8 },
  coin_stack: { model: "books", scale: 0.5 },

  // Bedroom
  bed: { model: "bedSingle", scale: 1.0 },
  desk_personal: { model: "desk", scale: 0.9 },
  lamp_personal: { model: "lampRoundTable", scale: 1.0 },
  rug_personal: { model: "rugRound", scale: 1.5 },
};

/* ─── Disco floor tile — special animated case ─── */

function DiscoTile({ x, z, index }: { x: number; z: number; index: number }) {
  const ref = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const hue = (t * 0.3 + index * 0.15) % 1;
    ref.current.color.setHSL(hue, 0.8, 0.45);
    ref.current.emissive.setHSL(hue, 1.0, 0.15);
  });

  return (
    <mesh position={[x, 0.08, z]}>
      <boxGeometry args={[0.9, 0.04, 0.9]} />
      <meshStandardMaterial ref={ref} color="#ff00ff" emissive="#330033" metalness={0.3} roughness={0.4} />
    </mesh>
  );
}

/* ─── GLB model loader ─── */

function FurnitureGLB({
  model,
  position,
  scale,
  rotationY,
}: {
  model: string;
  position: [number, number, number];
  scale: number;
  rotationY: number;
}) {
  const { scene } = useGLTF(`/models/${model}.glb`);

  return (
    <Clone
      object={scene}
      position={position}
      rotation={[0, rotationY, 0]}
      scale={scale * 1.8}
      castShadow
      receiveShadow
    />
  );
}

/* ─── Disco ball — keep as primitive (no GLB match) ─── */

function DiscoBall({ x, z }: { x: number; z: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.5;
  });

  return (
    <group position={[x, 2.5, z]}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* String */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.6, 4]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
    </group>
  );
}

/* ─── Main component ─── */

function Furniture3D({ item, cols, rows }: { item: FurnitureItem; cols: number; rows: number }) {
  const x = item.tileX - cols / 2;
  const z = item.tileY - rows / 2;

  // Special cases that stay as primitives
  if (item.type === "dancefloor") {
    return <DiscoTile x={x} z={z} index={item.tileX * 7 + item.tileY} />;
  }

  if (item.type === "disco_ball") {
    return <DiscoBall x={x} z={z} />;
  }

  const mapping = FURNITURE_MODEL_MAP[item.type];
  if (!mapping) return null;

  return (
    <FurnitureGLB
      model={mapping.model}
      position={[x, 0.075, z]}
      scale={mapping.scale}
      rotationY={mapping.rotationY || 0}
    />
  );
}

export default memo(Furniture3D);
