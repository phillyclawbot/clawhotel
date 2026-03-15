"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ROOM_LIGHTS: Record<string, { color: string; intensity: number; position: [number, number, number] }[]> = {
  kitchen: [
    { color: "#ff8844", intensity: 0.5, position: [1, 2, 1] },
    { color: "#ffaa66", intensity: 0.3, position: [-2, 1.5, -1] },
  ],
  dancefloor: [
    { color: "#ff44aa", intensity: 0.6, position: [-3, 2.5, 0] },
    { color: "#44aaff", intensity: 0.6, position: [3, 2.5, 0] },
    { color: "#44ff88", intensity: 0.6, position: [0, 2.5, 3] },
  ],
  bar: [
    { color: "#ffaa44", intensity: 0.45, position: [0, 1.5, -2] },
    { color: "#ffaa44", intensity: 0.35, position: [-3, 1.5, 0] },
    { color: "#ff8833", intensity: 0.25, position: [3, 1.2, 2] },
  ],
  bank: [{ color: "#ddeeff", intensity: 0.5, position: [0, 3.5, 0] }],
  library: [
    { color: "#ffcc44", intensity: 0.5, position: [-3, 1.5, 0] },
    { color: "#ffcc44", intensity: 0.35, position: [3, 1.5, -2] },
  ],
  casino: [
    { color: "#00ff44", intensity: 0.4, position: [0, 1.2, 0] },
    { color: "#ff2222", intensity: 0.35, position: [4, 2, -3] },
    { color: "#ffaa00", intensity: 0.25, position: [-3, 1.5, 2] },
  ],
  theater: [
    { color: "#ffffcc", intensity: 0.8, position: [0, 4, -3] },
    { color: "#ffddaa", intensity: 0.4, position: [-2, 3, 0] },
  ],
  rooftop: [
    { color: "#ffcc88", intensity: 0.4, position: [-4, 2, 0] },
    { color: "#ffcc88", intensity: 0.4, position: [4, 2, 0] },
    { color: "#ffaa66", intensity: 0.3, position: [0, 1.5, 3] },
  ],
  gym: [
    { color: "#ffffff", intensity: 0.4, position: [0, 3.5, 0] },
    { color: "#eeeeff", intensity: 0.25, position: [-3, 3, 0] },
  ],
  studio: [
    { color: "#ffcc44", intensity: 0.45, position: [0, 2.5, 0] },
    { color: "#ffffff", intensity: 0.3, position: [2, 2, -2] },
  ],
  store: [
    { color: "#ffffff", intensity: 0.4, position: [0, 3, 0] },
  ],
};

export default function Lights({ roomId }: { roomId?: string }) {
  const discoRef = useRef<THREE.PointLight[]>([]);

  useFrame((state) => {
    if (roomId === "dancefloor") {
      const t = state.clock.elapsedTime;
      discoRef.current.forEach((light, i) => {
        if (light) {
          const hue = (t * 0.3 + i * 0.33) % 1;
          light.color.setHSL(hue, 0.8, 0.5);
        }
      });
    }
  });

  const roomLights = roomId ? ROOM_LIGHTS[roomId] || [] : [];

  return (
    <>
      {/* Warm ambient fill — BRIGHT */}
      <ambientLight intensity={0.7} color="#ffeedd" />

      {/* Main directional (sun) — warm white */}
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={60}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        color="#fff8e8"
      />

      {/* Hemisphere — sky blue top, warm ground */}
      <hemisphereLight args={["#87ceeb", "#f0e6d3", 0.4]} />

      {/* Warm fill from front-right */}
      <pointLight position={[8, 3, 8]} intensity={0.3} color="#ffaa55" distance={25} />

      {/* Cool accent from back-left */}
      <pointLight position={[-8, 4, -6]} intensity={0.15} color="#88aaff" distance={20} />

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
          distance={14}
        />
      ))}
    </>
  );
}
