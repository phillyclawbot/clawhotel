"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { ROOMS, type RoomDef } from "@/lib/rooms";
import Furniture3D from "./Furniture3D";

function numToHex(n: number): string {
  return "#" + n.toString(16).padStart(6, "0");
}

function FloorTiles({ room, rows, cols }: { room: RoomDef; rows: number; cols: number }) {
  const colorA = numToHex(room.floorColorA);
  const colorB = numToHex(room.floorColorB);
  const isDisco = room.floorStyle === "disco";

  const tiles = useMemo(() => {
    const t: { x: number; z: number; color: string }[] = [];
    for (let z = 0; z < rows; z++) {
      for (let x = 0; x < cols; x++) {
        t.push({
          x: x - cols / 2,
          z: z - rows / 2,
          color: (x + z) % 2 === 0 ? colorA : colorB,
        });
      }
    }
    return t;
  }, [rows, cols, colorA, colorB]);

  return (
    <group>
      {tiles.map((tile, i) => (
        <FloorTile key={i} x={tile.x} z={tile.z} color={tile.color} isDisco={isDisco} index={i} />
      ))}
    </group>
  );
}

function FloorTile({ x, z, color, isDisco, index }: { x: number; z: number; color: string; isDisco: boolean; index: number }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!isDisco || !matRef.current) return;
    const t = state.clock.elapsedTime;
    const hue = (t * 0.1 + index * 0.05) % 1;
    matRef.current.color.setHSL(hue, 0.5, 0.2);
  });

  return (
    <mesh position={[x, 0, z]} receiveShadow>
      <boxGeometry args={[0.95, 0.15, 0.95]} />
      <meshStandardMaterial ref={matRef} color={color} flatShading />
    </mesh>
  );
}

function Walls({ room, rows, cols }: { room: RoomDef; rows: number; cols: number }) {
  if (room.noWalls) return null;

  const wallLeft = numToHex(room.wallColorLeft);
  const wallRight = numToHex(room.wallColorRight);

  return (
    <>
      {/* Back wall (along X) */}
      <mesh position={[0, 1.5, -rows / 2 - 0.1]} receiveShadow>
        <boxGeometry args={[cols, 3, 0.2]} />
        <meshStandardMaterial color={wallRight} flatShading />
      </mesh>

      {/* Left wall (along Z) */}
      <mesh position={[-cols / 2 - 0.1, 1.5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 3, rows]} />
        <meshStandardMaterial color={wallLeft} flatShading />
      </mesh>

      {/* Wall top trim - back */}
      <mesh position={[0, 3.05, -rows / 2 - 0.1]}>
        <boxGeometry args={[cols + 0.2, 0.1, 0.25]} />
        <meshStandardMaterial color={numToHex(room.wallColorTop)} flatShading />
      </mesh>

      {/* Wall top trim - left */}
      <mesh position={[-cols / 2 - 0.1, 3.05, 0]}>
        <boxGeometry args={[0.25, 0.1, rows + 0.2]} />
        <meshStandardMaterial color={numToHex(room.wallColorTop)} flatShading />
      </mesh>
    </>
  );
}

function RoomParticles({ roomId }: { roomId: string }) {
  switch (roomId) {
    case "kitchen":
      return <Sparkles count={20} scale={[4, 3, 4]} position={[0, 2, -3]} size={0.4} speed={0.3} opacity={0.3} color="#ffffff" />;
    case "dancefloor":
      return <Sparkles count={40} scale={[8, 4, 8]} size={0.6} speed={1.5} noise={1} color="#ff44aa" />;
    case "library":
      return <Sparkles count={15} scale={[8, 3, 8]} size={0.2} speed={0.1} opacity={0.2} color="#ffcc66" />;
    case "bar":
      return <Sparkles count={10} scale={[6, 2, 6]} size={0.3} speed={0.2} opacity={0.25} color="#ffaa44" />;
    case "casino":
      return <Sparkles count={25} scale={[8, 3, 8]} size={0.4} speed={0.5} color="#00ff44" />;
    case "rooftop":
      return <Sparkles count={60} scale={[15, 10, 15]} position={[0, 6, 0]} size={0.15} speed={0.05} opacity={0.6} color="#ffffff" />;
    default:
      return null;
  }
}

export default function Room3D({ roomId }: { roomId: string }) {
  const room = ROOMS[roomId];
  if (!room) return null;

  const grid = room.grid;
  const rows = grid.length;
  const cols = grid[0].length;

  return (
    <group>
      <FloorTiles room={room} rows={rows} cols={cols} />
      <Walls room={room} rows={rows} cols={cols} />

      {room.furniture.map((f) => (
        <Furniture3D key={f.id} item={f} cols={cols} rows={rows} />
      ))}

      <RoomParticles roomId={roomId} />
    </group>
  );
}
