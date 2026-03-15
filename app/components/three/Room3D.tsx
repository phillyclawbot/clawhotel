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

  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { matrices, colors } = useMemo(() => {
    const count = rows * cols;
    const m: THREE.Matrix4[] = [];
    const c: THREE.Color[] = [];
    for (let z = 0; z < rows; z++) {
      for (let x = 0; x < cols; x++) {
        const mat = new THREE.Matrix4();
        mat.setPosition(x - cols / 2, 0, z - rows / 2);
        m.push(mat);
        c.push(new THREE.Color((x + z) % 2 === 0 ? colorA : colorB));
      }
    }
    return { matrices: m, colors: c };
  }, [rows, cols, colorA, colorB]);

  const count = rows * cols;

  // Set instance matrices and colors
  useMemo(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    for (let i = 0; i < count; i++) {
      mesh.setMatrixAt(i, matrices[i]);
      mesh.setColorAt(i, colors[i]);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [matrices, colors, count]);

  // For disco floor, animate colors
  useFrame((state) => {
    if (room.floorStyle !== "disco" || !meshRef.current) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const hue = (t * 0.1 + i * 0.05) % 1;
      colors[i].setHSL(hue, 0.5, 0.2);
      meshRef.current.setColorAt(i, colors[i]);
    }
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} receiveShadow>
      <boxGeometry args={[0.95, 0.15, 0.95]} />
      <meshStandardMaterial flatShading vertexColors />
    </instancedMesh>
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
