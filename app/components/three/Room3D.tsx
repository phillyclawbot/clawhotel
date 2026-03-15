"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { ROOMS, type RoomDef } from "@/lib/rooms";
import Furniture3D from "./Furniture3D";

function brighten(hex: number, factor = 1.5): string {
  const r = Math.min(255, Math.floor(((hex >> 16) & 0xff) * factor));
  const g = Math.min(255, Math.floor(((hex >> 8) & 0xff) * factor));
  const b = Math.min(255, Math.floor((hex & 0xff) * factor));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function darkenHex(hex: string, amount = 0.3): string {
  const c = new THREE.Color(hex);
  c.multiplyScalar(1 - amount);
  return "#" + c.getHexString();
}

function lightenHex(hex: string, amount = 0.3): string {
  const c = new THREE.Color(hex);
  c.lerp(new THREE.Color("#ffffff"), amount);
  return "#" + c.getHexString();
}

/* ─── Floor ─── */

function FloorTiles({ room, rows, cols }: { room: RoomDef; rows: number; cols: number }) {
  const colorA = brighten(room.floorColorA, 1.5);
  const colorB = brighten(room.floorColorB, 1.5);
  const sideA = darkenHex(colorA, 0.25);
  const sideB = darkenHex(colorB, 0.25);
  const isDisco = room.floorStyle === "disco";

  const tiles = useMemo(() => {
    const t: { x: number; z: number; color: string; sideColor: string }[] = [];
    for (let z = 0; z < rows; z++) {
      for (let x = 0; x < cols; x++) {
        const isA = (x + z) % 2 === 0;
        t.push({
          x: x - cols / 2,
          z: z - rows / 2,
          color: isA ? colorA : colorB,
          sideColor: isA ? sideA : sideB,
        });
      }
    }
    return t;
  }, [rows, cols, colorA, colorB, sideA, sideB]);

  return (
    <group>
      {tiles.map((tile, i) => (
        <FloorTile key={i} x={tile.x} z={tile.z} color={tile.color} sideColor={tile.sideColor} isDisco={isDisco} index={i} />
      ))}
    </group>
  );
}

function FloorTile({
  x, z, color, sideColor, isDisco, index,
}: {
  x: number; z: number; color: string; sideColor: string; isDisco: boolean; index: number;
}) {
  const topRef = useRef<THREE.MeshStandardMaterial>(null);
  const sideRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!isDisco) return;
    const t = state.clock.elapsedTime;
    const hue = (t * 0.15 + index * 0.05) % 1;
    if (topRef.current) {
      topRef.current.color.setHSL(hue, 0.7, 0.5);
      topRef.current.emissive.setHSL(hue, 0.9, 0.2);
    }
    if (sideRef.current) {
      sideRef.current.color.setHSL(hue, 0.5, 0.35);
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Top tile — 0.93 scale for visible gap */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[0.93, 0.12, 0.93]} />
        <meshStandardMaterial
          ref={topRef}
          color={color}
          metalness={0.05}
          roughness={0.7}
          emissive={isDisco ? "#330033" : "#000000"}
        />
      </mesh>
      {/* Side face — darker, gives depth */}
      <mesh position={[0, -0.01, 0]}>
        <boxGeometry args={[0.95, 0.02, 0.95]} />
        <meshStandardMaterial ref={sideRef} color={sideColor} />
      </mesh>
    </group>
  );
}

/* ─── Walls ─── */

function Walls({ room, rows, cols }: { room: RoomDef; rows: number; cols: number }) {
  if (room.noWalls) return null;

  const wallLeft = brighten(room.wallColorLeft, 1.4);
  const wallRight = brighten(room.wallColorRight, 1.4);
  const wallTop = brighten(room.wallColorTop, 1.5);
  const baseboardColor = darkenHex(wallLeft, 0.35);
  const crownColor = lightenHex(wallRight, 0.25);

  const wallHeight = 3.2;
  const wallThickness = 0.3;
  const halfCols = cols / 2;
  const halfRows = rows / 2;

  return (
    <>
      {/* ═══ BACK WALL (along X) ═══ */}
      <mesh position={[0, wallHeight / 2, -halfRows - wallThickness / 2]} receiveShadow>
        <boxGeometry args={[cols + wallThickness, wallHeight, wallThickness]} />
        <meshStandardMaterial color={wallRight} roughness={0.8} />
      </mesh>
      {/* Baseboard — back */}
      <mesh position={[0, 0.08, -halfRows + 0.02]}>
        <boxGeometry args={[cols, 0.16, 0.1]} />
        <meshStandardMaterial color={baseboardColor} />
      </mesh>
      {/* Crown molding — back */}
      <mesh position={[0, wallHeight + 0.04, -halfRows - wallThickness / 2]}>
        <boxGeometry args={[cols + wallThickness + 0.1, 0.1, wallThickness + 0.12]} />
        <meshStandardMaterial color={crownColor} />
      </mesh>
      {/* Window — back wall center */}
      <mesh position={[0, wallHeight * 0.58, -halfRows + 0.02]}>
        <boxGeometry args={[2.0, 1.4, 0.05]} />
        <meshStandardMaterial color="#b8d8f0" emissive="#99bbdd" emissiveIntensity={0.2} />
      </mesh>
      {/* Window frame — back */}
      {[[-1.05, 0], [1.05, 0], [0, 0.75], [0, -0.75]].map(([dx, dy], i) => (
        <mesh key={`bwf${i}`} position={[dx, wallHeight * 0.58 + dy, -halfRows + 0.03]}>
          <boxGeometry args={[i < 2 ? 0.07 : 2.1, i < 2 ? 1.5 : 0.07, 0.04]} />
          <meshStandardMaterial color={lightenHex(wallRight, 0.15)} />
        </mesh>
      ))}
      {/* Cross frame */}
      <mesh position={[0, wallHeight * 0.58, -halfRows + 0.035]}>
        <boxGeometry args={[0.04, 1.4, 0.03]} />
        <meshStandardMaterial color={lightenHex(wallRight, 0.15)} />
      </mesh>
      <mesh position={[0, wallHeight * 0.58, -halfRows + 0.035]}>
        <boxGeometry args={[2.0, 0.04, 0.03]} />
        <meshStandardMaterial color={lightenHex(wallRight, 0.15)} />
      </mesh>

      {/* ═══ LEFT WALL (along Z) ═══ */}
      <mesh position={[-halfCols - wallThickness / 2, wallHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[wallThickness, wallHeight, rows + wallThickness]} />
        <meshStandardMaterial color={wallLeft} roughness={0.8} />
      </mesh>
      {/* Baseboard — left */}
      <mesh position={[-halfCols + 0.02, 0.08, 0]}>
        <boxGeometry args={[0.1, 0.16, rows]} />
        <meshStandardMaterial color={baseboardColor} />
      </mesh>
      {/* Crown molding — left */}
      <mesh position={[-halfCols - wallThickness / 2, wallHeight + 0.04, 0]}>
        <boxGeometry args={[wallThickness + 0.12, 0.1, rows + wallThickness + 0.1]} />
        <meshStandardMaterial color={crownColor} />
      </mesh>
      {/* Window — left wall center */}
      <mesh position={[-halfCols + 0.02, wallHeight * 0.58, 0]}>
        <boxGeometry args={[0.05, 1.4, 2.0]} />
        <meshStandardMaterial color="#b8d8f0" emissive="#99bbdd" emissiveIntensity={0.2} />
      </mesh>
      {/* Window frame — left */}
      {[[0, 0, -1.05], [0, 0, 1.05], [0, 0.75, 0], [0, -0.75, 0]].map(([, dy, dz], i) => (
        <mesh key={`lwf${i}`} position={[-halfCols + 0.03, wallHeight * 0.58 + (dy ?? 0), dz ?? 0]}>
          <boxGeometry args={[0.04, i < 2 ? 0.07 : 1.5, i < 2 ? 1.5 : 0.07]} />
          <meshStandardMaterial color={lightenHex(wallLeft, 0.15)} />
        </mesh>
      ))}

      {/* ═══ TOP TRIM ═══ */}
      <mesh position={[0, wallHeight + 0.09, -halfRows - wallThickness / 2]}>
        <boxGeometry args={[cols + wallThickness + 0.2, 0.05, wallThickness + 0.16]} />
        <meshStandardMaterial color={wallTop} />
      </mesh>
      <mesh position={[-halfCols - wallThickness / 2, wallHeight + 0.09, 0]}>
        <boxGeometry args={[wallThickness + 0.16, 0.05, rows + wallThickness + 0.2]} />
        <meshStandardMaterial color={wallTop} />
      </mesh>
    </>
  );
}

/* ─── Particles ─── */

function RoomParticles({ roomId }: { roomId: string }) {
  switch (roomId) {
    case "kitchen":
      return <Sparkles count={20} scale={[6, 3, 5]} position={[0, 2, -3]} size={0.4} speed={0.3} opacity={0.3} color="#ffffff" />;
    case "dancefloor":
      return <Sparkles count={60} scale={[10, 4, 10]} size={0.8} speed={1.5} noise={1} color="#ff88cc" />;
    case "library":
      return <Sparkles count={15} scale={[8, 3, 8]} size={0.3} speed={0.1} opacity={0.3} color="#ffdd88" />;
    case "bar":
      return <Sparkles count={15} scale={[8, 2, 6]} size={0.3} speed={0.2} opacity={0.3} color="#ffcc66" />;
    case "casino":
      return <Sparkles count={40} scale={[10, 3, 10]} size={0.5} speed={0.5} color="#44ff88" />;
    case "rooftop":
      return <Sparkles count={100} scale={[18, 10, 16]} position={[0, 6, 0]} size={0.2} speed={0.05} opacity={0.7} color="#ffffff" />;
    case "theater":
      return <Sparkles count={20} scale={[8, 4, 8]} size={0.4} speed={0.3} opacity={0.4} color="#ffccaa" />;
    default:
      return null;
  }
}

/* ─── Sky Sphere ─── */

function SkySphere({ noWalls }: { noWalls?: boolean }) {
  return (
    <mesh>
      <sphereGeometry args={[60, 32, 32]} />
      <meshBasicMaterial color={noWalls ? "#88bbee" : "#c8ddf0"} side={THREE.BackSide} />
    </mesh>
  );
}

/* ─── Room3D ─── */

export default function Room3D({ roomId }: { roomId: string }) {
  const room = ROOMS[roomId];
  if (!room) return null;

  const grid = room.grid;
  const rows = grid.length;
  const cols = grid[0].length;

  return (
    <group>
      <SkySphere noWalls={room.noWalls} />
      <FloorTiles room={room} rows={rows} cols={cols} />
      <Walls room={room} rows={rows} cols={cols} />

      {room.furniture.map((f) => (
        <Furniture3D key={f.id} item={f} cols={cols} rows={rows} />
      ))}

      <RoomParticles roomId={roomId} />
    </group>
  );
}
