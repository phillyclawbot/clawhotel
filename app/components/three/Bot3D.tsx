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

function lighten(hex: string, amount = 0.4): string {
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

/* ─── Label ─── */
function BotLabel({ name, emoji, accent }: { name: string; emoji: string; accent: string }) {
  return (
    <Html position={[0, 1.7, 0]} center distanceFactor={8} style={{ pointerEvents: "none" }}>
      <div
        className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur text-white text-xs font-bold whitespace-nowrap border"
        style={{ borderColor: accent + "50" }}
      >
        {emoji} {name}
      </div>
    </Html>
  );
}

/* ─── Speech Bubble ─── */
function SpeechBubble3D({ text, accent }: { text: string; accent: string }) {
  return (
    <Html position={[0, 2.1, 0]} center distanceFactor={8}>
      <div
        className="max-w-[200px] px-3 py-2 rounded-xl bg-white text-black text-xs font-medium shadow-lg relative border-2 animate-in"
        style={{ borderColor: accent + "60" }}
      >
        {text}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white rotate-45 border-r-2 border-b-2" style={{ borderColor: accent + "60" }} />
      </div>
    </Html>
  );
}

/* ═══ Bot3D ═══ */

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
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);

  const color = bot.accent_color || "#8b5cf6";
  const darkColor = useMemo(() => darken(color), [color]);
  const skinColor = useMemo(() => lighten(color, 0.45), [color]);
  const shoeColor = "#1a1a2e";
  const opacity = bot.is_online ? 1 : 0.4;

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

    cur.x += (targetX - cur.x) * 0.04;
    cur.z += (targetZ - cur.z) * 0.04;

    const dx = targetX - cur.x;
    const dz = targetZ - cur.z;
    const isWalking = Math.abs(dx) > 0.04 || Math.abs(dz) > 0.04;

    // Face direction of movement
    if (isWalking) {
      const angle = Math.atan2(dx, dz);
      groupRef.current.rotation.y = angle;
    }

    const t = state.clock.elapsedTime;
    const bobSpeed = isWalking ? 8 : 2;
    const bobAmount = isWalking ? 0.06 : 0.018;
    const bob = Math.sin(t * bobSpeed) * bobAmount;

    groupRef.current.position.set(cur.x, 0.15 + bob, cur.z);

    // Arm & leg swing
    const armSwing = isWalking ? Math.sin(t * 8) * 0.5 : Math.sin(t * 1.5) * 0.04;
    const legSwing = isWalking ? Math.sin(t * 8) * 0.35 : 0;

    if (leftArmRef.current) leftArmRef.current.rotation.x = armSwing;
    if (rightArmRef.current) rightArmRef.current.rotation.x = -armSwing;
    if (leftLegRef.current) leftLegRef.current.rotation.x = -legSwing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = legSwing;

    // Breathing
    if (bodyRef.current) {
      bodyRef.current.scale.y = 1 + Math.sin(t * 1.5) * 0.02;
    }

    // Pupils track camera (slight shift toward viewer)
    const camDir = state.camera.position.clone().normalize();
    const pupilShiftX = camDir.x * 0.008;
    const pupilShiftY = camDir.y * 0.005;
    if (leftPupilRef.current) {
      leftPupilRef.current.position.x = -0.065 + pupilShiftX;
      leftPupilRef.current.position.y = 0.98 + pupilShiftY;
    }
    if (rightPupilRef.current) {
      rightPupilRef.current.position.x = 0.065 + pupilShiftX;
      rightPupilRef.current.position.y = 0.98 + pupilShiftY;
    }
  });

  return (
    <group ref={groupRef} position={[bot.x - cols / 2, 0.15, bot.y - rows / 2]}>
      {/* Click hitbox */}
      <mesh position={[0, 0.6, 0]} onClick={onClick} visible={false}>
        <boxGeometry args={[0.6, 1.4, 0.5]} />
        <meshBasicMaterial />
      </mesh>

      {/* Shadow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 16]} />
        <meshBasicMaterial color="black" transparent opacity={opacity * 0.18} />
      </mesh>

      {/* ── Legs (cylinder) ── */}
      <group ref={leftLegRef} position={[-0.08, 0.22, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.22, 8]} />
          <meshStandardMaterial color={darkColor} transparent opacity={opacity} />
        </mesh>
        {/* Shoe */}
        <mesh position={[0, -0.13, 0.02]}>
          <sphereGeometry args={[0.055, 8, 6]} />
          <meshStandardMaterial color={shoeColor} transparent opacity={opacity} />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.08, 0.22, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.22, 8]} />
          <meshStandardMaterial color={darkColor} transparent opacity={opacity} />
        </mesh>
        <mesh position={[0, -0.13, 0.02]}>
          <sphereGeometry args={[0.055, 8, 6]} />
          <meshStandardMaterial color={shoeColor} transparent opacity={opacity} />
        </mesh>
      </group>

      {/* ── Body (tapered cylinder) ── */}
      <mesh ref={bodyRef} position={[0, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.15, 0.38, 10]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} />
      </mesh>

      {/* ── Arms (cylinder with shoulder sphere) ── */}
      <group ref={leftArmRef} position={[-0.24, 0.62, 0]}>
        {/* Shoulder joint */}
        <mesh position={[0, 0.02, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={color} transparent opacity={opacity} />
        </mesh>
        {/* Arm */}
        <mesh position={[0, -0.1, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.22, 8]} />
          <meshStandardMaterial color={darken(color, 0.15)} transparent opacity={opacity} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.22, 0]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color={skinColor} transparent opacity={opacity} />
        </mesh>
      </group>
      <group ref={rightArmRef} position={[0.24, 0.62, 0]}>
        <mesh position={[0, 0.02, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={color} transparent opacity={opacity} />
        </mesh>
        <mesh position={[0, -0.1, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.22, 8]} />
          <meshStandardMaterial color={darken(color, 0.15)} transparent opacity={opacity} />
        </mesh>
        <mesh position={[0, -0.22, 0]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color={skinColor} transparent opacity={opacity} />
        </mesh>
      </group>

      {/* ── Head (SPHERE!) ── */}
      <mesh position={[0, 0.88, 0]} castShadow>
        <sphereGeometry args={[0.22, 14, 14]} />
        <meshStandardMaterial color={skinColor} transparent opacity={opacity} />
      </mesh>

      {/* ── Hair (cap on top) ── */}
      <mesh position={[0, 1.04, -0.02]}>
        <sphereGeometry args={[0.18, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2.5]} />
        <meshStandardMaterial color={darkColor} transparent opacity={opacity} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Eyes (white spheres) ── */}
      <mesh position={[-0.065, 0.9, 0.17]}>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshBasicMaterial color="white" transparent opacity={opacity} />
      </mesh>
      <mesh position={[0.065, 0.9, 0.17]}>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshBasicMaterial color="white" transparent opacity={opacity} />
      </mesh>

      {/* ── Pupils (track camera) ── */}
      <mesh ref={leftPupilRef} position={[-0.065, 0.9, 0.21]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshBasicMaterial color="#111111" transparent opacity={opacity} />
      </mesh>
      <mesh ref={rightPupilRef} position={[0.065, 0.9, 0.21]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshBasicMaterial color="#111111" transparent opacity={opacity} />
      </mesh>

      {/* ── Smile ── */}
      <mesh position={[0, 0.82, 0.2]} rotation={[0.2, 0, 0]}>
        <torusGeometry args={[0.04, 0.008, 4, 8, Math.PI]} />
        <meshBasicMaterial color="#aa5544" transparent opacity={opacity} />
      </mesh>

      {/* Mood aura */}
      {moodColor && bot.is_online && (
        <pointLight position={[0, 0.5, 0]} color={moodColor} intensity={0.4} distance={1.5} />
      )}

      {/* Labels */}
      <BotLabel name={bot.name} emoji={bot.emoji} accent={color} />

      {/* Speech bubble */}
      {hasSpeech && bot.speech && <SpeechBubble3D text={bot.speech} accent={color} />}

      {/* Pet */}
      {bot.pet && (
        <Html position={[0.4, 0.15, 0]} center distanceFactor={8} style={{ pointerEvents: "none" }}>
          <span className="text-sm">{bot.pet.pet_type}</span>
        </Html>
      )}
    </group>
  );
}
