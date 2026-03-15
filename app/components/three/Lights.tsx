"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ROOM_LIGHTS: Record<string, { color: string; intensity: number; position: [number, number, number] }[]> = {
  kitchen: [{ color: "#ff8844", intensity: 0.6, position: [1, 2, 1] }],
  dancefloor: [
    { color: "#ff44aa", intensity: 0.4, position: [-2, 2, 0] },
    { color: "#44aaff", intensity: 0.4, position: [2, 2, 0] },
    { color: "#44ff88", intensity: 0.4, position: [0, 2, 2] },
  ],
  bar: [{ color: "#ffaa44", intensity: 0.4, position: [0, 1.5, -2] }],
  bank: [{ color: "#aaccff", intensity: 0.3, position: [0, 3, 0] }],
  library: [{ color: "#ffcc66", intensity: 0.5, position: [-3, 1.5, 0] }],
  casino: [
    { color: "#00ff44", intensity: 0.3, position: [0, 1, 0] },
    { color: "#ff2222", intensity: 0.2, position: [3, 2, -2] },
  ],
  theater: [{ color: "#ffffff", intensity: 0.6, position: [0, 4, -3] }],
  rooftop: [{ color: "#88aaff", intensity: 0.3, position: [0, 5, 0] }],
};

export default function Lights({ roomId }: { roomId?: string }) {
  const discoRef = useRef<THREE.PointLight[]>([]);

  useFrame((state) => {
    if (roomId === "dancefloor") {
      const t = state.clock.elapsedTime;
      discoRef.current.forEach((light, i) => {
        if (light) {
          const hue = ((t * 0.3 + i * 0.33) % 1);
          light.color.setHSL(hue, 0.8, 0.5);
        }
      });
    }
  });

  const roomLights = roomId ? ROOM_LIGHTS[roomId] || [] : [];

  return (
    <>
      {/* Soft ambient fill */}
      <ambientLight intensity={0.4} color="#b8c4ff" />

      {/* Main directional (sun) — casts shadows */}
      <directionalLight
        position={[8, 12, 8]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        color="#fff5e6"
      />

      {/* Warm fill from below-right */}
      <pointLight position={[5, 1, 5]} intensity={0.3} color="#ffaa55" distance={15} />

      {/* Cool accent from left */}
      <pointLight position={[-5, 3, -3]} intensity={0.15} color="#6688ff" distance={12} />

      {/* Room-specific lights */}
      {roomLights.map((light, i) => (
        <pointLight
          key={i}
          ref={(el: THREE.PointLight | null) => {
            if (el && roomId === "dancefloor") {
              discoRef.current[i] = el;
            }
          }}
          position={light.position}
          intensity={light.intensity}
          color={light.color}
          distance={10}
        />
      ))}
    </>
  );
}
