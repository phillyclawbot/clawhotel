"use client";

import { memo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { FurnitureItem } from "@/lib/rooms";
import * as THREE from "three";

function Table() {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.8, 0.08, 0.8]} />
        <meshStandardMaterial color="#8B4513" flatShading />
      </mesh>
      {[[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.25, z]}>
          <boxGeometry args={[0.06, 0.5, 0.06]} />
          <meshStandardMaterial color="#6B3410" flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Chair() {
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.4, 0.06, 0.4]} />
        <meshStandardMaterial color="#a0522d" flatShading />
      </mesh>
      <mesh position={[0, 0.6, -0.17]}>
        <boxGeometry args={[0.4, 0.45, 0.06]} />
        <meshStandardMaterial color="#8B4513" flatShading />
      </mesh>
      {[[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.16, z]}>
          <boxGeometry args={[0.05, 0.32, 0.05]} />
          <meshStandardMaterial color="#6B3410" flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Stove() {
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.7]} />
        <meshStandardMaterial color="#666666" flatShading />
      </mesh>
      {[[-0.15, -0.12], [0.15, -0.12], [-0.15, 0.12], [0.15, 0.12]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.81, z]}>
          <cylinderGeometry args={[0.1, 0.1, 0.02, 8]} />
          <meshStandardMaterial color="#333" flatShading />
        </mesh>
      ))}
      <mesh position={[0.35, 0.5, 0]}>
        <boxGeometry args={[0.04, 0.15, 0.04]} />
        <meshStandardMaterial color="#444" flatShading />
      </mesh>
    </group>
  );
}

function DJBooth() {
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.9, 0.7, 0.5]} />
        <meshStandardMaterial color="#1a1a2e" flatShading />
      </mesh>
      {[-0.2, 0.2].map((x, i) => (
        <mesh key={i} position={[x, 0.71, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.02, 12]} />
          <meshStandardMaterial color="#222" flatShading />
        </mesh>
      ))}
      <mesh position={[0, 0.55, 0.26]}>
        <boxGeometry args={[0.4, 0.2, 0.02]} />
        <meshStandardMaterial color="#1166ff" emissive="#1166ff" emissiveIntensity={0.5} flatShading />
      </mesh>
    </group>
  );
}

function DiscoBall() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.5;
  });
  return (
    <group position={[0, 2.5, 0]}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.6, 4]} />
        <meshStandardMaterial color="#888" flatShading />
      </mesh>
      <mesh ref={ref} castShadow>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.1} flatShading />
      </mesh>
      <pointLight color="#ffffff" intensity={0.4} distance={8} />
    </group>
  );
}

function Plant() {
  return (
    <group>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.15, 0.3, 6]} />
        <meshStandardMaterial color="#8B4513" flatShading />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <coneGeometry args={[0.25, 0.5, 6]} />
        <meshStandardMaterial color="#228B22" flatShading />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <coneGeometry args={[0.18, 0.35, 6]} />
        <meshStandardMaterial color="#2ca02c" flatShading />
      </mesh>
    </group>
  );
}

function ArcadeMachine() {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.6, 1.0, 0.5]} />
        <meshStandardMaterial color="#2d1b4e" flatShading />
      </mesh>
      <mesh position={[0, 0.7, 0.26]}>
        <boxGeometry args={[0.35, 0.3, 0.02]} />
        <meshStandardMaterial color="#33ff33" emissive="#33ff33" emissiveIntensity={0.4} flatShading />
      </mesh>
      <mesh position={[0, 0.35, 0.26]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#ff0000" flatShading />
      </mesh>
    </group>
  );
}

function Bookshelf() {
  const bookColors = ["#8B0000", "#006400", "#00008B", "#8B8B00", "#8B4513"];
  return (
    <group>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.7, 1.2, 0.3]} />
        <meshStandardMaterial color="#5C3317" flatShading />
      </mesh>
      {[0.9, 0.55, 0.25].map((y, row) =>
        [-0.2, -0.05, 0.1, 0.2].map((x, col) => (
          <mesh key={`${row}-${col}`} position={[x, y, 0.05]}>
            <boxGeometry args={[0.1, 0.2, 0.18]} />
            <meshStandardMaterial color={bookColors[(row * 4 + col) % bookColors.length]} flatShading />
          </mesh>
        ))
      )}
    </group>
  );
}

function BarCounter() {
  return (
    <group>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.9, 0.9, 0.5]} />
        <meshStandardMaterial color="#5C3317" flatShading />
      </mesh>
      <mesh position={[0, 0.91, 0]}>
        <boxGeometry args={[0.95, 0.04, 0.55]} />
        <meshStandardMaterial color="#8B6914" flatShading />
      </mesh>
    </group>
  );
}

function BarStool() {
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.04, 8]} />
        <meshStandardMaterial color="#8B4513" flatShading />
      </mesh>
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.35, 6]} />
        <meshStandardMaterial color="#444" flatShading />
      </mesh>
    </group>
  );
}

function Speaker() {
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.4, 0.8, 0.35]} />
        <meshStandardMaterial color="#111" flatShading />
      </mesh>
      <mesh position={[0, 0.5, 0.18]}>
        <cylinderGeometry args={[0.12, 0.12, 0.02, 12]} />
        <meshStandardMaterial color="#222" flatShading />
      </mesh>
      <mesh position={[0, 0.3, 0.18]}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 8]} />
        <meshStandardMaterial color="#333" flatShading />
      </mesh>
    </group>
  );
}

function Counter() {
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.9, 0.8, 0.5]} />
        <meshStandardMaterial color="#c9a96e" flatShading />
      </mesh>
      <mesh position={[0, 0.81, 0]}>
        <boxGeometry args={[0.95, 0.04, 0.55]} />
        <meshStandardMaterial color="#d4b87a" flatShading />
      </mesh>
    </group>
  );
}

function Jukebox() {
  return (
    <group>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.5, 0.9, 0.4]} />
        <meshStandardMaterial color="#4a1a00" flatShading />
      </mesh>
      {[0.7, 0.55, 0.4].map((y, i) => (
        <mesh key={i} position={[0, y, 0.21]}>
          <boxGeometry args={[0.35, 0.08, 0.02]} />
          <meshStandardMaterial
            color={["#ff0000", "#ffff00", "#00ff00"][i]}
            emissive={["#ff0000", "#ffff00", "#00ff00"][i]}
            emissiveIntensity={0.3}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

function Bulletin() {
  return (
    <group>
      <mesh position={[0, 1.0, -0.05]} castShadow>
        <boxGeometry args={[0.7, 0.6, 0.05]} />
        <meshStandardMaterial color="#4a3520" flatShading />
      </mesh>
      {[[-0.15, 1.1], [0.1, 0.95], [-0.05, 1.05]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.0]}>
          <boxGeometry args={[0.15, 0.12, 0.01]} />
          <meshStandardMaterial color="#f5f5dc" flatShading />
        </mesh>
      ))}
    </group>
  );
}

function DancefloorTile() {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((state) => {
    if (ref.current) {
      const hue = (state.clock.elapsedTime * 0.2 + Math.random() * 0.01) % 1;
      ref.current.color.setHSL(hue, 0.6, 0.3);
      ref.current.emissive.setHSL(hue, 0.8, 0.15);
    }
  });
  return (
    <mesh position={[0, 0.08, 0]} receiveShadow>
      <boxGeometry args={[0.9, 0.02, 0.9]} />
      <meshStandardMaterial ref={ref} color="#440044" emissive="#220022" flatShading />
    </mesh>
  );
}

function Shelf() {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.8, 1.0, 0.35]} />
        <meshStandardMaterial color="#ddd" flatShading />
      </mesh>
      {[0.8, 0.5, 0.2].map((y, i) => (
        <mesh key={i} position={[0, y, 0.05]}>
          <boxGeometry args={[0.7, 0.15, 0.25]} />
          <meshStandardMaterial color={["#44aa44", "#aa4444", "#4444aa"][i]} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Checkout() {
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.5]} />
        <meshStandardMaterial color="#bbb" flatShading />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[0.3, 0.15, 0.25]} />
        <meshStandardMaterial color="#333" flatShading />
      </mesh>
    </group>
  );
}

function Fridge() {
  return (
    <group>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.6, 1.2, 0.5]} />
        <meshStandardMaterial color="#ccc" flatShading />
      </mesh>
      <mesh position={[0.25, 0.7, 0.26]}>
        <boxGeometry args={[0.04, 0.2, 0.02]} />
        <meshStandardMaterial color="#888" flatShading />
      </mesh>
    </group>
  );
}

function Sink() {
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.5]} />
        <meshStandardMaterial color="#bbb" flatShading />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[0.4, 0.15, 0.35]} />
        <meshStandardMaterial color="#999" flatShading />
      </mesh>
      <mesh position={[0, 0.95, -0.1]}>
        <cylinderGeometry args={[0.02, 0.02, 0.25, 6]} />
        <meshStandardMaterial color="#aaa" flatShading />
      </mesh>
    </group>
  );
}

function Vault() {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.8, 1.0, 0.7]} />
        <meshStandardMaterial color="#666" metalness={0.6} roughness={0.3} flatShading />
      </mesh>
      <mesh position={[0, 0.5, 0.36]}>
        <cylinderGeometry args={[0.15, 0.15, 0.04, 16]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} flatShading />
      </mesh>
    </group>
  );
}

function SlotMachine() {
  return (
    <group>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.5, 0.9, 0.4]} />
        <meshStandardMaterial color="#cc0000" flatShading />
      </mesh>
      <mesh position={[0, 0.6, 0.21]}>
        <boxGeometry args={[0.35, 0.25, 0.02]} />
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.3} flatShading />
      </mesh>
      <mesh position={[0.3, 0.7, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.2, 6]} />
        <meshStandardMaterial color="#888" flatShading />
      </mesh>
      <mesh position={[0.3, 0.8, 0]}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial color="#ff0000" flatShading />
      </mesh>
    </group>
  );
}

function Weights() {
  return (
    <group>
      <mesh position={[0, 0.15, 0]} castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 6]} />
        <meshStandardMaterial color="#888" flatShading />
      </mesh>
      {[-0.25, 0.25].map((x, i) => (
        <mesh key={i} position={[x, 0.15, 0]}>
          <sphereGeometry args={[0.1, 6, 6]} />
          <meshStandardMaterial color="#333" flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Easel() {
  return (
    <group>
      {/* Legs */}
      <mesh position={[-0.15, 0.5, 0.1]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.04, 1.0, 0.04]} />
        <meshStandardMaterial color="#8B4513" flatShading />
      </mesh>
      <mesh position={[0.15, 0.5, 0.1]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.04, 1.0, 0.04]} />
        <meshStandardMaterial color="#8B4513" flatShading />
      </mesh>
      <mesh position={[0, 0.45, -0.15]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.04, 0.9, 0.04]} />
        <meshStandardMaterial color="#8B4513" flatShading />
      </mesh>
      {/* Canvas */}
      <mesh position={[0, 0.7, 0.08]} castShadow>
        <boxGeometry args={[0.45, 0.5, 0.03]} />
        <meshStandardMaterial color="#f5f5dc" flatShading />
      </mesh>
    </group>
  );
}

function RouletteTable() {
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.08, 12]} />
        <meshStandardMaterial color="#006400" flatShading />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.15, 0.4, 8]} />
        <meshStandardMaterial color="#4a2800" flatShading />
      </mesh>
    </group>
  );
}

function BlackjackTable() {
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.9, 0.08, 0.6]} />
        <meshStandardMaterial color="#006400" flatShading />
      </mesh>
      {[[-0.35, -0.2], [0.35, -0.2], [-0.35, 0.2], [0.35, 0.2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]}>
          <boxGeometry args={[0.06, 0.4, 0.06]} />
          <meshStandardMaterial color="#4a2800" flatShading />
        </mesh>
      ))}
    </group>
  );
}

function StagePlatform() {
  return (
    <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.95, 0.2, 0.95]} />
      <meshStandardMaterial color="#3d2b1f" flatShading />
    </mesh>
  );
}

function Microphone() {
  return (
    <group>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.015, 0.02, 1.0, 6]} />
        <meshStandardMaterial color="#888" flatShading />
      </mesh>
      <mesh position={[0, 1.0, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#333" flatShading />
      </mesh>
    </group>
  );
}

function LoungeChair() {
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.7, 0.15, 0.4]} />
        <meshStandardMaterial color="#ddd" flatShading />
      </mesh>
      <mesh position={[-0.25, 0.35, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.3, 0.15, 0.38]} />
        <meshStandardMaterial color="#ccc" flatShading />
      </mesh>
    </group>
  );
}

function NeonSign() {
  return (
    <group position={[0, 1.5, 0]}>
      <mesh>
        <boxGeometry args={[0.8, 0.3, 0.05]} />
        <meshStandardMaterial color="#ff0066" emissive="#ff0066" emissiveIntensity={0.8} flatShading />
      </mesh>
      <pointLight color="#ff0066" intensity={0.5} distance={4} />
    </group>
  );
}

function Fireplace() {
  return (
    <group>
      <mesh position={[0, 0.4, -0.1]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.4]} />
        <meshStandardMaterial color="#8B4513" flatShading />
      </mesh>
      <mesh position={[0, 0.3, 0.1]}>
        <boxGeometry args={[0.5, 0.4, 0.2]} />
        <meshStandardMaterial color="#111" flatShading />
      </mesh>
      <pointLight position={[0, 0.3, 0.2]} color="#ff6600" intensity={0.6} distance={4} />
    </group>
  );
}

function Globe() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.2;
  });
  return (
    <group>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.04, 0.1, 0.3, 6]} />
        <meshStandardMaterial color="#5C3317" flatShading />
      </mesh>
      <mesh ref={ref} position={[0, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#2266aa" flatShading />
      </mesh>
    </group>
  );
}

function Spotlight() {
  return (
    <group position={[0, 2.8, 0]}>
      <mesh>
        <cylinderGeometry args={[0.05, 0.12, 0.2, 8]} />
        <meshStandardMaterial color="#333" flatShading />
      </mesh>
      <pointLight color="#ffffcc" intensity={0.8} distance={6} />
    </group>
  );
}

function Curtain() {
  return (
    <mesh position={[0, 1.0, 0]} castShadow>
      <boxGeometry args={[0.3, 2.0, 0.1]} />
      <meshStandardMaterial color="#8B0000" flatShading />
    </mesh>
  );
}

function BenchPress() {
  return (
    <group>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.3, 0.1, 0.8]} />
        <meshStandardMaterial color="#333" flatShading />
      </mesh>
      {[-0.3, 0.3].map((z, i) => (
        <mesh key={i} position={[0, 0.5, z]}>
          <boxGeometry args={[0.04, 0.6, 0.04]} />
          <meshStandardMaterial color="#666" flatShading />
        </mesh>
      ))}
    </group>
  );
}

function StringLights() {
  return (
    <group position={[0, 2.2, 0]}>
      {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0, 0]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial
              color={["#ffcc00", "#ff6600", "#ff0066", "#6600ff"][i]}
              emissive={["#ffcc00", "#ff6600", "#ff0066", "#6600ff"][i]}
              emissiveIntensity={0.5}
              flatShading
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CactusPot() {
  return (
    <group>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.24, 6]} />
        <meshStandardMaterial color="#8B4513" flatShading />
      </mesh>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.5, 6]} />
        <meshStandardMaterial color="#228B22" flatShading />
      </mesh>
      <mesh position={[0.12, 0.5, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.2, 6]} />
        <meshStandardMaterial color="#228B22" flatShading />
      </mesh>
    </group>
  );
}

// Generic fallback for types without specific models
function GenericBox({ color = "#888" }: { color?: string }) {
  return (
    <mesh position={[0, 0.3, 0]} castShadow>
      <boxGeometry args={[0.6, 0.6, 0.5]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  );
}

const FURNITURE_MAP: Record<string, React.FC> = {
  table: Table,
  chair: Chair,
  stove: Stove,
  dj_booth: DJBooth,
  disco_ball: DiscoBall,
  plant: Plant,
  arcade: ArcadeMachine,
  bookshelf: Bookshelf,
  bar_counter: BarCounter,
  long_bar: BarCounter,
  bar_stool: BarStool,
  speaker: Speaker,
  counter: Counter,
  jukebox: Jukebox,
  bulletin: Bulletin,
  dancefloor: DancefloorTile,
  shelf: Shelf,
  checkout: Checkout,
  fridge: Fridge,
  sink: Sink,
  vault: Vault,
  slot_machine: SlotMachine,
  dumbbell_rack: Weights,
  bench_press: BenchPress,
  easel: Easel,
  roulette_table: RouletteTable,
  blackjack_table: BlackjackTable,
  stage_platform: StagePlatform,
  microphone: Microphone,
  lounge_chair: LoungeChair,
  neon_sign: NeonSign,
  fireplace: Fireplace,
  globe: Globe,
  spotlight: Spotlight,
  curtain: Curtain,
  string_lights: StringLights,
  cactus_pot: CactusPot,
  armchair: Chair,
  reading_desk: Table,
  audience_seat: Chair,
};

function Furniture3D({ item, cols, rows }: { item: FurnitureItem; cols: number; rows: number }) {
  const Component = FURNITURE_MAP[item.type] || (() => <GenericBox />);
  return (
    <group position={[item.tileX - cols / 2, 0.08, item.tileY - rows / 2]}>
      <Component />
    </group>
  );
}

export default memo(Furniture3D);
