"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface BotData {
  id: string;
  name: string;
  emoji: string;
  accent_color: string;
  x: number;
  y: number;
  target_x: number;
  target_y: number;
  speech?: string;
  speech_at?: string;
  status?: string;
  is_online: boolean;
  mood?: string;
  level?: number;
  pet?: { pet_type: string; pet_name: string } | null;
  items?: { item_id: string; item_emoji: string }[];
}

function darken(hex: string, amount = 0.3): string {
  const c = new THREE.Color(hex);
  c.multiplyScalar(1 - amount);
  return "#" + c.getHexString();
}

function lighten(hex: string, amount = 0.3): string {
  const c = new THREE.Color(hex);
  c.lerp(new THREE.Color("#ffffff"), amount);
  return "#" + c.getHexString();
}

const MOOD_COLORS: Record<string, string> = {
  happy: "#ffcc00",
  focused: "#4488ff",
  tired: "#888888",
  hyped: "#ff4400",
  chill: "#44ddaa",
};

function BotLabel({ name, emoji, accent }: { name: string; emoji: string; accent: string }) {
  return (
    <Html position={[0, 1.5, 0]} center distanceFactor={8} style={{ pointerEvents: "none" }}>
      <div
        className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur text-white text-xs font-bold whitespace-nowrap border border-white/10"
        style={{ borderColor: accent + "40" }}
      >
        {emoji} {name}
      </div>
    </Html>
  );
}

function SpeechBubble3D({ text }: { text: string }) {
  return (
    <Html position={[0, 1.9, 0]} center distanceFactor={8}>
      <div className="max-w-[200px] px-3 py-2 rounded-xl bg-white text-black text-xs font-medium shadow-lg relative">
        {text}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
      </div>
    </Html>
  );
}

export default function Bot3D({
  bot,
  onClick,
  cols,
  rows,
}: {
  bot: BotData;
  onClick: () => void;
  cols: number;
  rows: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const posRef = useRef({ x: bot.x - cols / 2, z: bot.y - rows / 2 });
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);

  const color = bot.accent_color || "#8b5cf6";
  const darkColor = useMemo(() => darken(color), [color]);
  const lightColor = useMemo(() => lighten(color), [color]);
  const skinColor = "#FDBCB4";

  // Check if speech is recent (within 5 minutes)
  const hasSpeech = useMemo(() => {
    if (!bot.speech || !bot.speech_at) return false;
    const age = Date.now() - new Date(bot.speech_at).getTime();
    return age < 5 * 60 * 1000;
  }, [bot.speech, bot.speech_at]);

  const moodColor = bot.mood ? MOOD_COLORS[bot.mood] : undefined;

  useFrame((state) => {
    if (!groupRef.current) return;

    const targetX = bot.x - cols / 2;
    const targetZ = bot.y - rows / 2;
    const cur = posRef.current;

    // Lerp position
    cur.x += (targetX - cur.x) * 0.03;
    cur.z += (targetZ - cur.z) * 0.03;

    const dx = targetX - cur.x;
    const dz = targetZ - cur.z;
    const isWalking = Math.abs(dx) > 0.05 || Math.abs(dz) > 0.05;

    // Face movement direction
    if (isWalking) {
      const angle = Math.atan2(dx, dz);
      groupRef.current.rotation.y = angle;
    }

    const t = state.clock.elapsedTime;

    // Bob while walking or gentle idle bob
    const bobSpeed = isWalking ? 8 : 2;
    const bobAmount = isWalking ? 0.06 : 0.02;
    const bob = Math.sin(t * bobSpeed) * bobAmount;

    groupRef.current.position.set(cur.x, 0.15 + bob, cur.z);

    // Arm/leg swing when walking
    const swing = isWalking ? Math.sin(t * 8) * 0.4 : 0;
    if (leftArmRef.current) leftArmRef.current.rotation.x = swing;
    if (rightArmRef.current) rightArmRef.current.rotation.x = -swing;
    if (leftLegRef.current) leftLegRef.current.rotation.x = -swing * 0.6;
    if (rightLegRef.current) rightLegRef.current.rotation.x = swing * 0.6;

    // Breathing
    if (bodyRef.current) {
      bodyRef.current.scale.y = 1 + Math.sin(t * 1.5) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[bot.x - cols / 2, 0.15, bot.y - rows / 2]}>
      {/* Click hitbox */}
      <mesh position={[0, 0.55, 0]} onClick={onClick} visible={false}>
        <boxGeometry args={[0.6, 1.3, 0.5]} />
        <meshBasicMaterial />
      </mesh>

      {/* Shadow on ground */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.25, 16]} />
        <meshBasicMaterial color="black" transparent opacity={bot.is_online ? 0.2 : 0.1} />
      </mesh>

      {/* Legs */}
      <mesh ref={leftLegRef} position={[-0.09, 0.22, 0]} castShadow>
        <boxGeometry args={[0.11, 0.36, 0.11]} />
        <meshStandardMaterial color={darkColor} flatShading transparent opacity={bot.is_online ? 1 : 0.4} />
      </mesh>
      <mesh ref={rightLegRef} position={[0.09, 0.22, 0]} castShadow>
        <boxGeometry args={[0.11, 0.36, 0.11]} />
        <meshStandardMaterial color={darkColor} flatShading transparent opacity={bot.is_online ? 1 : 0.4} />
      </mesh>

      {/* Shoes */}
      <mesh position={[-0.09, 0.04, 0.02]}>
        <boxGeometry args={[0.12, 0.06, 0.15]} />
        <meshStandardMaterial color="#1a1a2e" flatShading transparent opacity={bot.is_online ? 1 : 0.4} />
      </mesh>
      <mesh position={[0.09, 0.04, 0.02]}>
        <boxGeometry args={[0.12, 0.06, 0.15]} />
        <meshStandardMaterial color="#1a1a2e" flatShading transparent opacity={bot.is_online ? 1 : 0.4} />
      </mesh>

      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.36, 0.4, 0.22]} />
        <meshStandardMaterial color={color} flatShading transparent opacity={bot.is_online ? 1 : 0.4} />
      </mesh>

      {/* Arms */}
      <mesh ref={leftArmRef} position={[-0.25, 0.58, 0]} castShadow>
        <boxGeometry args={[0.09, 0.32, 0.09]} />
        <meshStandardMaterial color={color} flatShading transparent opacity={bot.is_online ? 1 : 0.4} />
      </mesh>
      <mesh ref={rightArmRef} position={[0.25, 0.58, 0]} castShadow>
        <boxGeometry args={[0.09, 0.32, 0.09]} />
        <meshStandardMaterial color={color} flatShading transparent opacity={bot.is_online ? 1 : 0.4} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.97, 0]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.26]} />
        <meshStandardMaterial color={skinColor} flatShading transparent opacity={bot.is_online ? 1 : 0.4} />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 1.14, 0]}>
        <boxGeometry args={[0.32, 0.06, 0.28]} />
        <meshStandardMaterial color={darkColor} flatShading transparent opacity={bot.is_online ? 1 : 0.4} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.07, 0.99, 0.14]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color="white" transparent opacity={bot.is_online ? 1 : 0.4} />
      </mesh>
      <mesh position={[0.07, 0.99, 0.14]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color="white" transparent opacity={bot.is_online ? 1 : 0.4} />
      </mesh>
      {/* Pupils */}
      <mesh position={[-0.07, 0.99, 0.175]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color="#111" transparent opacity={bot.is_online ? 1 : 0.4} />
      </mesh>
      <mesh position={[0.07, 0.99, 0.175]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color="#111" transparent opacity={bot.is_online ? 1 : 0.4} />
      </mesh>

      {/* Mood aura */}
      {moodColor && bot.is_online && (
        <pointLight position={[0, 0.3, 0]} color={moodColor} intensity={0.4} distance={1.5} />
      )}

      {/* Labels */}
      <BotLabel name={bot.name} emoji={bot.emoji} accent={color} />

      {/* Speech bubble */}
      {hasSpeech && bot.speech && <SpeechBubble3D text={bot.speech} />}

      {/* Pet */}
      {bot.pet && (
        <Html position={[0.4, 0.2, 0]} center distanceFactor={8} style={{ pointerEvents: "none" }}>
          <span className="text-sm">{bot.pet.pet_type}</span>
        </Html>
      )}
    </group>
  );
}
