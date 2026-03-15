"use client";

import { memo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { FurnitureItem } from "@/lib/rooms";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════
   DETAILED FURNITURE — 5-15 meshes each, rounded geometry,
   proper materials. Animal Crossing meets Habbo Hotel.
   ═══════════════════════════════════════════════════════════ */

/* ─── Table ─── */
function Table() {
  return (
    <group>
      {/* Top — wide warm wood */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <boxGeometry args={[0.85, 0.07, 0.85]} />
        <meshStandardMaterial color="#a07830" roughness={0.6} />
      </mesh>
      {/* Edge bevel */}
      <mesh position={[0, 0.49, 0]}>
        <boxGeometry args={[0.88, 0.02, 0.88]} />
        <meshStandardMaterial color="#8B6914" roughness={0.7} />
      </mesh>
      {/* 4 cylinder legs */}
      {[[-0.33, -0.33], [0.33, -0.33], [-0.33, 0.33], [0.33, 0.33]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.24, z]} castShadow>
          <cylinderGeometry args={[0.035, 0.04, 0.48, 8]} />
          <meshStandardMaterial color="#5C4510" roughness={0.5} />
        </mesh>
      ))}
      {/* Plate on table */}
      <mesh position={[-0.15, 0.57, 0.1]}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 12]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.3} />
      </mesh>
      {/* Cup */}
      <mesh position={[0.18, 0.6, -0.1]}>
        <cylinderGeometry args={[0.04, 0.035, 0.08, 8]} />
        <meshStandardMaterial color="#cc6644" roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ─── Chair ─── */
function Chair() {
  return (
    <group>
      {/* Seat */}
      <mesh position={[0, 0.36, 0]} castShadow>
        <boxGeometry args={[0.42, 0.05, 0.42]} />
        <meshStandardMaterial color="#a0522d" roughness={0.6} />
      </mesh>
      {/* Back — tilted 5° */}
      <mesh position={[0, 0.62, -0.19]} rotation={[0.09, 0, 0]} castShadow>
        <boxGeometry args={[0.42, 0.5, 0.05]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} />
      </mesh>
      {/* 4 cylinder legs */}
      {[[-0.16, -0.16], [0.16, -0.16], [-0.16, 0.16], [0.16, 0.16]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.17, z]}>
          <cylinderGeometry args={[0.025, 0.03, 0.34, 6]} />
          <meshStandardMaterial color="#6B3410" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Stove/Oven ─── */
function Stove() {
  const glowRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((state) => {
    if (glowRef.current) {
      glowRef.current.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
    }
  });
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.82, 0.84, 0.7]} />
        <meshStandardMaterial color="#999999" metalness={0.2} roughness={0.5} />
      </mesh>
      {/* Front panel */}
      <mesh position={[0, 0.35, 0.36]}>
        <boxGeometry args={[0.74, 0.5, 0.02]} />
        <meshStandardMaterial color="#777777" metalness={0.15} roughness={0.6} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, 0.55, 0.38]}>
        <cylinderGeometry args={[0.015, 0.015, 0.4, 6]} />
        <meshStandardMaterial color="#cccccc" metalness={0.5} roughness={0.2} />
      </mesh>
      {/* 4 burner rings */}
      {[[-0.18, -0.14], [0.18, -0.14], [-0.18, 0.14], [0.18, 0.14]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.85, z]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.08, 0.015, 6, 16]} />
          <meshStandardMaterial color={i === 0 ? "#ff4400" : "#444444"} emissive={i === 0 ? "#ff4400" : "#000000"} ref={i === 0 ? glowRef : undefined} emissiveIntensity={i === 0 ? 0.4 : 0} />
        </mesh>
      ))}
      {/* 4 knobs */}
      {[-0.2, -0.07, 0.07, 0.2].map((x, i) => (
        <mesh key={`k${i}`} position={[x, 0.68, 0.37]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Fridge ─── */
function Fridge() {
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0.62, 0]} castShadow>
        <boxGeometry args={[0.62, 1.24, 0.55]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.4} />
      </mesh>
      {/* Door divider */}
      <mesh position={[0, 0.75, 0.28]}>
        <boxGeometry args={[0.58, 0.02, 0.01]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
      {/* Handle — top door */}
      <mesh position={[0.26, 0.95, 0.29]}>
        <cylinderGeometry args={[0.015, 0.015, 0.22, 6]} />
        <meshStandardMaterial color="#cccccc" metalness={0.5} roughness={0.2} />
      </mesh>
      {/* Handle — bottom door */}
      <mesh position={[0.26, 0.5, 0.29]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 6]} />
        <meshStandardMaterial color="#cccccc" metalness={0.5} roughness={0.2} />
      </mesh>
      {/* Top edge */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[0.64, 0.02, 0.57]} />
        <meshStandardMaterial color="#dddddd" />
      </mesh>
    </group>
  );
}

/* ─── Prep Counter ─── */
function PrepCounter() {
  return (
    <group>
      {/* Base cabinet */}
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[0.9, 0.76, 0.55]} />
        <meshStandardMaterial color="#f5f5f0" roughness={0.5} />
      </mesh>
      {/* Wood top */}
      <mesh position={[0, 0.77, 0]}>
        <boxGeometry args={[0.95, 0.04, 0.58]} />
        <meshStandardMaterial color="#c4a060" roughness={0.5} />
      </mesh>
      {/* Cutting board */}
      <mesh position={[-0.15, 0.8, 0]}>
        <boxGeometry args={[0.25, 0.02, 0.18]} />
        <meshStandardMaterial color="#6b4c2a" roughness={0.7} />
      </mesh>
      {/* Bowl */}
      <mesh position={[0.2, 0.84, 0.05]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[0.08, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ─── Sink ─── */
function Sink() {
  return (
    <group>
      {/* Cabinet */}
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[0.65, 0.76, 0.55]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.5} />
      </mesh>
      {/* Counter top */}
      <mesh position={[0, 0.77, 0]}>
        <boxGeometry args={[0.7, 0.04, 0.58]} />
        <meshStandardMaterial color="#dddddd" roughness={0.4} metalness={0.05} />
      </mesh>
      {/* Basin */}
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[0.35, 0.12, 0.3]} />
        <meshStandardMaterial color="#888888" metalness={0.2} roughness={0.4} />
      </mesh>
      {/* Faucet base */}
      <mesh position={[0, 0.85, -0.18]}>
        <cylinderGeometry args={[0.025, 0.025, 0.15, 8]} />
        <meshStandardMaterial color="#cccccc" metalness={0.5} roughness={0.2} />
      </mesh>
      {/* Faucet spout */}
      <mesh position={[0, 0.92, -0.08]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.18, 6]} />
        <meshStandardMaterial color="#cccccc" metalness={0.5} roughness={0.2} />
      </mesh>
      {/* Faucet head */}
      <mesh position={[0, 0.88, 0.02]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#bbbbbb" metalness={0.4} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ─── Pot Rack ─── */
function PotRack() {
  return (
    <group>
      {/* Two vertical poles */}
      <mesh position={[-0.25, 0.7, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.4, 6]} />
        <meshStandardMaterial color="#888888" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0.25, 0.7, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.4, 6]} />
        <meshStandardMaterial color="#888888" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Horizontal bar */}
      <mesh position={[0, 1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.5, 6]} />
        <meshStandardMaterial color="#888888" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* 3 hanging pots */}
      {[-0.15, 0, 0.15].map((x, i) => (
        <group key={i} position={[x, 1.0 - i * 0.05, 0]}>
          <mesh rotation={[Math.PI, 0, 0]}>
            <sphereGeometry args={[0.08 + i * 0.01, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#b87333" metalness={0.3} roughness={0.5} side={THREE.DoubleSide} />
          </mesh>
          {/* Handle */}
          <mesh position={[0, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.01, 0.01, 0.12, 4]} />
            <meshStandardMaterial color="#996633" metalness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── DJ Booth ─── */
function DJBooth() {
  return (
    <group>
      {/* Console body — angled */}
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[0.95, 0.76, 0.55]} />
        <meshStandardMaterial color="#222233" roughness={0.6} />
      </mesh>
      {/* Angled top panel */}
      <mesh position={[0, 0.77, -0.02]} rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[0.9, 0.04, 0.5]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} />
      </mesh>
      {/* 2 turntables */}
      {[-0.22, 0.22].map((x, i) => (
        <group key={i}>
          <mesh position={[x, 0.8, -0.02]}>
            <cylinderGeometry args={[0.13, 0.13, 0.02, 16]} />
            <meshStandardMaterial color="#111111" roughness={0.3} />
          </mesh>
          {/* Needle dot */}
          <mesh position={[x + 0.06, 0.82, -0.02]}>
            <sphereGeometry args={[0.015, 6, 6]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
      {/* Center screen */}
      <mesh position={[0, 0.82, 0.15]}>
        <boxGeometry args={[0.22, 0.12, 0.02]} />
        <meshStandardMaterial color="#00ffaa" emissive="#00ffaa" emissiveIntensity={0.5} />
      </mesh>
      {/* Small fader rows */}
      {[-0.08, -0.03, 0.02, 0.07].map((x, i) => (
        <mesh key={`f${i}`} position={[x, 0.81, 0.04]}>
          <boxGeometry args={[0.02, 0.015, 0.06]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Speaker ─── */
function Speaker() {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.42, 0.84, 0.38]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      {/* Main cone */}
      <mesh position={[0, 0.5, 0.2]}>
        <cylinderGeometry args={[0.13, 0.13, 0.03, 16]} />
        <meshStandardMaterial color="#333333" roughness={0.4} />
      </mesh>
      {/* Cone ring */}
      <mesh position={[0, 0.5, 0.21]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.13, 0.01, 6, 16]} />
        <meshStandardMaterial color="#555555" emissive="#222222" emissiveIntensity={0.3} />
      </mesh>
      {/* Tweeter */}
      <mesh position={[0, 0.7, 0.2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 12]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} />
      </mesh>
      {/* Logo/brand dot */}
      <mesh position={[0, 0.28, 0.2]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

/* ─── Disco Ball ─── */
function DiscoBall() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.5;
  });
  return (
    <group position={[0, 2.8, 0]}>
      {/* Hanging wire */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.8, 4]} />
        <meshStandardMaterial color="#888888" metalness={0.3} />
      </mesh>
      {/* Ball */}
      <mesh ref={ref} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#ddddee" metalness={0.9} roughness={0.05} />
      </mesh>
      {/* Light from disco ball */}
      <pointLight color="#ffffff" intensity={0.5} distance={10} />
    </group>
  );
}

/* ─── Plant / Tree ─── */
function Plant() {
  return (
    <group>
      {/* Pot */}
      <mesh position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.13, 0.28, 8]} />
        <meshStandardMaterial color="#cc6633" roughness={0.7} />
      </mesh>
      {/* Pot rim */}
      <mesh position={[0, 0.29, 0]}>
        <cylinderGeometry args={[0.19, 0.19, 0.03, 8]} />
        <meshStandardMaterial color="#bb5522" roughness={0.7} />
      </mesh>
      {/* Dirt */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.02, 8]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.9} />
      </mesh>
      {/* Leaf clusters */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#44aa44" roughness={0.8} />
      </mesh>
      <mesh position={[-0.08, 0.6, 0.05]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#55bb55" roughness={0.8} />
      </mesh>
      <mesh position={[0.06, 0.62, -0.05]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#338833" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#55cc55" roughness={0.8} />
      </mesh>
    </group>
  );
}

/* ─── Arcade Machine ─── */
function ArcadeMachine() {
  const screenRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((state) => {
    if (screenRef.current) {
      const t = state.clock.elapsedTime;
      screenRef.current.emissiveIntensity = 0.3 + Math.sin(t * 2) * 0.1;
    }
  });
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.6, 1.1, 0.5]} />
        <meshStandardMaterial color="#4422aa" roughness={0.6} />
      </mesh>
      {/* Screen bezel */}
      <mesh position={[0, 0.75, 0.26]}>
        <boxGeometry args={[0.42, 0.35, 0.02]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0.75, 0.275]}>
        <boxGeometry args={[0.36, 0.28, 0.01]} />
        <meshStandardMaterial ref={screenRef} color="#00ccff" emissive="#00ccff" emissiveIntensity={0.3} />
      </mesh>
      {/* Control panel */}
      <mesh position={[0, 0.45, 0.26]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.42, 0.15, 0.02]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      {/* Joystick */}
      <mesh position={[-0.08, 0.48, 0.28]}>
        <cylinderGeometry args={[0.015, 0.015, 0.1, 6]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[-0.08, 0.54, 0.28]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      {/* Buttons */}
      {[0.04, 0.1].map((x, i) => (
        <mesh key={i} position={[x, 0.48, 0.27]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial color={i === 0 ? "#ff4444" : "#44ff44"} />
        </mesh>
      ))}
      {/* Coin slot */}
      <mesh position={[0.22, 0.4, 0.26]}>
        <boxGeometry args={[0.03, 0.06, 0.02]} />
        <meshStandardMaterial color="#888888" metalness={0.3} />
      </mesh>
      {/* Marquee top */}
      <mesh position={[0, 1.05, 0.15]}>
        <boxGeometry args={[0.5, 0.08, 0.25]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

/* ─── Bookshelf ─── */
function Bookshelf() {
  const bookColors = ["#cc2222", "#226622", "#2222aa", "#aa8800", "#884488", "#cc6622"];
  return (
    <group>
      {/* Frame */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <boxGeometry args={[0.75, 1.3, 0.32]} />
        <meshStandardMaterial color="#4a3520" roughness={0.7} />
      </mesh>
      {/* 4 shelves */}
      {[0.2, 0.5, 0.8, 1.1].map((y, row) => (
        <group key={`shelf${row}`}>
          <mesh position={[0, y, 0.02]}>
            <boxGeometry args={[0.68, 0.03, 0.26]} />
            <meshStandardMaterial color="#5a4530" roughness={0.6} />
          </mesh>
          {/* Books on shelf */}
          {Array.from({ length: 5 }, (_, col) => {
            const h = 0.14 + Math.sin(row * 5 + col * 3) * 0.05;
            const lean = (col === 2 || col === 4) ? 0.1 : 0;
            return (
              <mesh key={`b${row}-${col}`} position={[-0.25 + col * 0.12, y + h / 2 + 0.02, 0.02]} rotation={[0, 0, lean]}>
                <boxGeometry args={[0.08, h, 0.2]} />
                <meshStandardMaterial color={bookColors[(row * 5 + col) % bookColors.length]} roughness={0.8} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}

/* ─── Bar Counter ─── */
function BarCounter() {
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.92, 0.9, 0.52]} />
        <meshStandardMaterial color="#3d1c02" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Top surface — lighter */}
      <mesh position={[0, 0.91, 0]}>
        <boxGeometry args={[0.96, 0.04, 0.56]} />
        <meshStandardMaterial color="#6b4420" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Front plank detail */}
      {[-0.2, 0, 0.2].map((x, i) => (
        <mesh key={i} position={[x, 0.45, 0.27]}>
          <boxGeometry args={[0.18, 0.82, 0.01]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#4a2810" : "#3d1c02"} roughness={0.7} />
        </mesh>
      ))}
      {/* Bottle on counter */}
      <mesh position={[0.25, 1.05, -0.05]}>
        <cylinderGeometry args={[0.03, 0.035, 0.2, 8]} />
        <meshStandardMaterial color="#228844" roughness={0.3} />
      </mesh>
      <mesh position={[0.25, 1.17, -0.05]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#228844" roughness={0.3} />
      </mesh>
      {/* Tip jar */}
      <mesh position={[-0.25, 0.98, 0.1]}>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 8]} />
        <meshStandardMaterial color="#dddddd" transparent opacity={0.5} roughness={0.1} />
      </mesh>
    </group>
  );
}

/* ─── Bar Stool ─── */
function BarStool() {
  return (
    <group>
      {/* Seat — round leather */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.06, 12]} />
        <meshStandardMaterial color="#cc3333" roughness={0.5} />
      </mesh>
      {/* Seat cushion top */}
      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.02, 12]} />
        <meshStandardMaterial color="#dd4444" roughness={0.6} />
      </mesh>
      {/* Central pole */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 0.4, 6]} />
        <meshStandardMaterial color="#cccccc" metalness={0.5} roughness={0.2} />
      </mesh>
      {/* Foot ring */}
      <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.012, 6, 16]} />
        <meshStandardMaterial color="#bbbbbb" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.03, 12]} />
        <meshStandardMaterial color="#cccccc" metalness={0.5} roughness={0.2} />
      </mesh>
    </group>
  );
}

/* ─── Jukebox ─── */
function Jukebox() {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.48, 0]} castShadow>
        <boxGeometry args={[0.55, 0.96, 0.42]} />
        <meshStandardMaterial color="#4a1a00" roughness={0.5} />
      </mesh>
      {/* Chrome dome top */}
      <mesh position={[0, 1.0, 0]}>
        <sphereGeometry args={[0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#dddddd" metalness={0.6} roughness={0.2} side={THREE.DoubleSide} />
      </mesh>
      {/* Rainbow strips */}
      {[0.72, 0.58, 0.44, 0.30].map((y, i) => (
        <mesh key={i} position={[0, y, 0.22]}>
          <boxGeometry args={[0.4, 0.08, 0.02]} />
          <meshStandardMaterial
            color={["#ff2222", "#ffaa00", "#22ff22", "#2288ff"][i]}
            emissive={["#ff2222", "#ffaa00", "#22ff22", "#2288ff"][i]}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
      {/* Gold trim */}
      <mesh position={[0, 0.88, 0.22]}>
        <boxGeometry args={[0.5, 0.03, 0.02]} />
        <meshStandardMaterial color="#ddaa44" emissive="#ddaa44" emissiveIntensity={0.2} metalness={0.3} />
      </mesh>
      {/* Speakers on sides */}
      {[-0.28, 0.28].map((x, i) => (
        <mesh key={`sp${i}`} position={[x, 0.55, 0.02]}>
          <cylinderGeometry args={[0.06, 0.06, 0.02, 10]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Bulletin Board ─── */
function Bulletin() {
  return (
    <group>
      {/* Board */}
      <mesh position={[0, 1.0, -0.08]} castShadow>
        <boxGeometry args={[0.75, 0.65, 0.06]} />
        <meshStandardMaterial color="#5a4020" roughness={0.8} />
      </mesh>
      {/* Cork surface */}
      <mesh position={[0, 1.0, -0.04]}>
        <boxGeometry args={[0.68, 0.58, 0.02]} />
        <meshStandardMaterial color="#c4a060" roughness={0.9} />
      </mesh>
      {/* Notes pinned */}
      {[[-0.18, 1.12], [0.12, 0.98], [-0.08, 1.02], [0.2, 1.1]].map(([x, y], i) => (
        <group key={i}>
          <mesh position={[x, y, -0.02]}>
            <boxGeometry args={[0.14, 0.11, 0.005]} />
            <meshStandardMaterial color={["#f5f5dc", "#ffdddd", "#ddffdd", "#ddeeff"][i]} />
          </mesh>
          {/* Pin */}
          <mesh position={[x, y + 0.04, -0.015]}>
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshStandardMaterial color={["#ff0000", "#0000ff", "#ff8800", "#00aa00"][i]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── Dancefloor Tile ─── */
function DancefloorTile() {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((state) => {
    if (ref.current) {
      const hue = (state.clock.elapsedTime * 0.2 + Math.random() * 0.01) % 1;
      ref.current.color.setHSL(hue, 0.7, 0.4);
      ref.current.emissive.setHSL(hue, 0.9, 0.2);
    }
  });
  return (
    <mesh position={[0, 0.08, 0]} receiveShadow>
      <boxGeometry args={[0.92, 0.03, 0.92]} />
      <meshStandardMaterial ref={ref} color="#550055" emissive="#330033" />
    </mesh>
  );
}

/* ─── Shelf ─── */
function Shelf() {
  return (
    <group>
      {/* Frame */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.8, 1.1, 0.35]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.5} />
      </mesh>
      {/* Products on shelves */}
      {[0.85, 0.55, 0.25].map((y, row) => (
        <group key={row}>
          <mesh position={[0, y, 0.05]}>
            <boxGeometry args={[0.72, 0.03, 0.28]} />
            <meshStandardMaterial color="#dddddd" />
          </mesh>
          {Array.from({ length: 4 }, (_, col) => (
            <mesh key={`p${row}-${col}`} position={[-0.22 + col * 0.15, y + 0.07, 0.05]}>
              <boxGeometry args={[0.1, 0.1, 0.08]} />
              <meshStandardMaterial color={["#ff6666", "#66bb66", "#6688ff", "#ffaa44"][col]} roughness={0.6} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ─── Checkout Counter ─── */
function Checkout() {
  return (
    <group>
      {/* Counter body */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.85, 0.84, 0.55]} />
        <meshStandardMaterial color="#cccccc" roughness={0.5} />
      </mesh>
      {/* Counter top */}
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[0.9, 0.04, 0.58]} />
        <meshStandardMaterial color="#dddddd" roughness={0.4} />
      </mesh>
      {/* Cash register */}
      <mesh position={[0.15, 0.95, -0.05]}>
        <boxGeometry args={[0.25, 0.15, 0.2]} />
        <meshStandardMaterial color="#333333" roughness={0.5} />
      </mesh>
      {/* Register screen */}
      <mesh position={[0.15, 1.0, 0.06]}>
        <boxGeometry args={[0.15, 0.06, 0.01]} />
        <meshStandardMaterial color="#44ff44" emissive="#44ff44" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

/* ─── Counter (Reception) ─── */
function Counter() {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.92, 0.84, 0.55]} />
        <meshStandardMaterial color="#c9a96e" roughness={0.5} />
      </mesh>
      {/* Top surface */}
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[0.96, 0.04, 0.58]} />
        <meshStandardMaterial color="#d4b87a" roughness={0.4} />
      </mesh>
      {/* Bell */}
      <mesh position={[0.25, 0.92, 0.1]}>
        <sphereGeometry args={[0.04, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#ddcc44" metalness={0.5} roughness={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.25, 0.92, 0.1]}>
        <cylinderGeometry args={[0.05, 0.05, 0.01, 12]} />
        <meshStandardMaterial color="#ccbb33" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Computer/screen */}
      <mesh position={[-0.15, 1.0, -0.1]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.25, 0.18, 0.02]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[-0.15, 1.0, -0.09]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.22, 0.15, 0.01]} />
        <meshStandardMaterial color="#4488cc" emissive="#4488cc" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

/* ─── Vault / Safe ─── */
function Vault() {
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.85, 1.1, 0.75]} />
        <meshStandardMaterial color="#555555" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Door face */}
      <mesh position={[0, 0.55, 0.38]}>
        <boxGeometry args={[0.78, 1.0, 0.02]} />
        <meshStandardMaterial color="#666666" metalness={0.35} roughness={0.35} />
      </mesh>
      {/* Large handle wheel */}
      <mesh position={[0, 0.55, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.02, 8, 20]} />
        <meshStandardMaterial color="#d4a833" metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Dial */}
      <mesh position={[0, 0.3, 0.4]}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 12]} />
        <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Corner rivets */}
      {[[-0.35, 0.95], [0.35, 0.95], [-0.35, 0.15], [0.35, 0.15]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.39]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#888888" metalness={0.4} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Slot Machine ─── */
function SlotMachine() {
  const screenRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((state) => {
    if (screenRef.current) {
      const hue = (state.clock.elapsedTime * 0.5) % 1;
      screenRef.current.emissive.setHSL(hue, 0.8, 0.2);
    }
  });
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.48, 0]} castShadow>
        <boxGeometry args={[0.52, 0.96, 0.42]} />
        <meshStandardMaterial color="#cc2222" roughness={0.5} />
      </mesh>
      {/* Gold trim top */}
      <mesh position={[0, 0.97, 0]}>
        <boxGeometry args={[0.55, 0.04, 0.45]} />
        <meshStandardMaterial color="#ddaa33" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Screen area */}
      <mesh position={[0, 0.65, 0.22]}>
        <boxGeometry args={[0.38, 0.22, 0.02]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* 3 reels */}
      {[-0.1, 0, 0.1].map((x, i) => (
        <mesh key={i} position={[x, 0.65, 0.235]}>
          <boxGeometry args={[0.09, 0.16, 0.01]} />
          <meshStandardMaterial ref={i === 1 ? screenRef : undefined} color={["#ff6600", "#ffff00", "#ff0066"][i]} emissive={["#ff6600", "#ffff00", "#ff0066"][i]} emissiveIntensity={0.3} />
        </mesh>
      ))}
      {/* Lever */}
      <mesh position={[0.3, 0.65, 0.1]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.25, 6]} />
        <meshStandardMaterial color="#cccccc" metalness={0.5} roughness={0.2} />
      </mesh>
      <mesh position={[0.3, 0.8, 0.05]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      {/* Coin tray */}
      <mesh position={[0, 0.05, 0.15]}>
        <boxGeometry args={[0.35, 0.08, 0.12]} />
        <meshStandardMaterial color="#ddaa33" metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ─── Fireplace ─── */
function Fireplace() {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 0.6 + Math.sin(state.clock.elapsedTime * 5) * 0.2 + Math.sin(state.clock.elapsedTime * 3.7) * 0.1;
    }
  });
  return (
    <group>
      {/* Surround */}
      <mesh position={[0, 0.45, -0.12]} castShadow>
        <boxGeometry args={[0.9, 0.9, 0.45]} />
        <meshStandardMaterial color="#999988" roughness={0.8} />
      </mesh>
      {/* Mantle */}
      <mesh position={[0, 0.92, -0.1]}>
        <boxGeometry args={[1.0, 0.06, 0.5]} />
        <meshStandardMaterial color="#887766" roughness={0.7} />
      </mesh>
      {/* Opening */}
      <mesh position={[0, 0.3, 0.08]}>
        <boxGeometry args={[0.55, 0.5, 0.3]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      {/* Fire meshes */}
      {[[-0.08, 0.22], [0.05, 0.26], [0.0, 0.18]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.1]}>
          <sphereGeometry args={[0.06 + i * 0.01, 6, 6]} />
          <meshStandardMaterial color={["#ff6600", "#ffaa00", "#ff4400"][i]} emissive={["#ff6600", "#ffaa00", "#ff4400"][i]} emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* Light */}
      <pointLight ref={lightRef} position={[0, 0.3, 0.15]} color="#ff6600" intensity={0.6} distance={5} />
    </group>
  );
}

/* ─── Globe ─── */
function Globe() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.15; });
  return (
    <group>
      {/* Stand */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.04, 0.1, 0.3, 8]} />
        <meshStandardMaterial color="#5C3317" roughness={0.6} />
      </mesh>
      {/* Ring */}
      <mesh position={[0, 0.5, 0]} rotation={[0.3, 0, 0]}>
        <torusGeometry args={[0.22, 0.01, 6, 20]} />
        <meshStandardMaterial color="#bbaa44" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Globe sphere */}
      <mesh ref={ref} position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#2266aa" roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ─── Easel ─── */
function Easel() {
  return (
    <group>
      {/* A-frame legs */}
      <mesh position={[-0.15, 0.5, 0.08]} rotation={[0.1, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.0, 6]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} />
      </mesh>
      <mesh position={[0.15, 0.5, 0.08]} rotation={[0.1, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.0, 6]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.45, -0.18]} rotation={[-0.3, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.9, 6]} />
        <meshStandardMaterial color="#8B4513" roughness={0.6} />
      </mesh>
      {/* Cross bar */}
      <mesh position={[0, 0.6, 0.06]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.32, 6]} />
        <meshStandardMaterial color="#7a3d10" roughness={0.6} />
      </mesh>
      {/* Canvas */}
      <mesh position={[0, 0.72, 0.06]} castShadow>
        <boxGeometry args={[0.45, 0.55, 0.025]} />
        <meshStandardMaterial color="#f5f0e0" roughness={0.5} />
      </mesh>
      {/* Paint smudges */}
      {[[-0.1, 0.78, "#ff4444"], [0.08, 0.65, "#4488ff"], [0.0, 0.72, "#44cc44"]].map(([x, y, c], i) => (
        <mesh key={i} position={[Number(x), Number(y), 0.08]} rotation={[0, 0, i * 0.5]}>
          <circleGeometry args={[0.04, 8]} />
          <meshStandardMaterial color={c as string} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Roulette Table ─── */
function RouletteTable() {
  const wheelRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => { if (wheelRef.current) wheelRef.current.rotation.y += delta * 0.3; });
  return (
    <group>
      {/* Green felt top */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.48, 0.48, 0.08, 16]} />
        <meshStandardMaterial color="#006400" roughness={0.7} />
      </mesh>
      {/* Pedestal */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 0.4, 10]} />
        <meshStandardMaterial color="#4a2800" roughness={0.6} />
      </mesh>
      {/* Wheel */}
      <mesh ref={wheelRef} position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.03, 16]} />
        <meshStandardMaterial color="#333333" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Rim */}
      <mesh position={[0, 0.46, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.45, 0.02, 6, 24]} />
        <meshStandardMaterial color="#5a3a10" roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ─── Blackjack Table ─── */
function BlackjackTable() {
  return (
    <group>
      {/* Green felt top */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.95, 0.08, 0.65]} />
        <meshStandardMaterial color="#006400" roughness={0.7} />
      </mesh>
      {/* Felt edge (semi-circle front) */}
      <mesh position={[0, 0.42, 0.15]}>
        <cylinderGeometry args={[0.32, 0.32, 0.08, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#005500" roughness={0.7} />
      </mesh>
      {/* 4 legs */}
      {[[-0.38, -0.25], [0.38, -0.25], [-0.38, 0.25], [0.38, 0.25]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]}>
          <cylinderGeometry args={[0.03, 0.04, 0.38, 6]} />
          <meshStandardMaterial color="#4a2800" roughness={0.6} />
        </mesh>
      ))}
      {/* Dealer line */}
      <mesh position={[0, 0.47, -0.05]}>
        <boxGeometry args={[0.7, 0.005, 0.01]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

/* ─── Stage Platform ─── */
function StagePlatform() {
  return (
    <group>
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.24, 0.95]} />
        <meshStandardMaterial color="#5a3d20" roughness={0.6} />
      </mesh>
      {/* Front edge highlight */}
      <mesh position={[0, 0.245, 0.46]}>
        <boxGeometry args={[0.95, 0.01, 0.03]} />
        <meshStandardMaterial color="#ffcc44" emissive="#ffcc44" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

/* ─── Microphone ─── */
function Microphone() {
  return (
    <group>
      {/* Stand */}
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.015, 0.025, 1.05, 6]} />
        <meshStandardMaterial color="#888888" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.03, 10]} />
        <meshStandardMaterial color="#444444" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Mic head */}
      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.055, 10, 10]} />
        <meshStandardMaterial color="#333333" roughness={0.5} />
      </mesh>
      {/* Grille ring */}
      <mesh position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.04, 0.008, 6, 12]} />
        <meshStandardMaterial color="#666666" metalness={0.3} />
      </mesh>
    </group>
  );
}

/* ─── Audience Seat / Lounge Chair ─── */
function AudienceSeat() {
  return (
    <group>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.42, 0.06, 0.42]} />
        <meshStandardMaterial color="#cc4444" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.48, -0.18]}>
        <boxGeometry args={[0.42, 0.42, 0.05]} />
        <meshStandardMaterial color="#bb3333" roughness={0.6} />
      </mesh>
      {/* Legs */}
      {[[-0.16, -0.16], [0.16, -0.16], [-0.16, 0.16], [0.16, 0.16]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.11, z]}>
          <cylinderGeometry args={[0.02, 0.02, 0.22, 6]} />
          <meshStandardMaterial color="#444444" metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function LoungeChair() {
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.7, 0.16, 0.45]} />
        <meshStandardMaterial color="#eeeeee" roughness={0.5} />
      </mesh>
      <mesh position={[-0.28, 0.35, 0]} rotation={[0, 0, 0.25]}>
        <boxGeometry args={[0.25, 0.14, 0.42]} />
        <meshStandardMaterial color="#dddddd" roughness={0.5} />
      </mesh>
      {/* Pillow */}
      <mesh position={[-0.2, 0.32, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#ffaa88" roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ─── Neon Sign ─── */
function NeonSign() {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
    }
  });
  return (
    <group position={[0, 1.6, 0]}>
      {/* Backing */}
      <mesh>
        <boxGeometry args={[0.9, 0.35, 0.06]} />
        <meshStandardMaterial color="#222222" roughness={0.7} />
      </mesh>
      {/* Neon tube */}
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[0.7, 0.15, 0.02]} />
        <meshStandardMaterial ref={ref} color="#ff0066" emissive="#ff0066" emissiveIntensity={0.6} />
      </mesh>
      <pointLight color="#ff0066" intensity={0.5} distance={5} />
    </group>
  );
}

/* ─── Curtain ─── */
function Curtain() {
  return (
    <group>
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.35, 2.2, 0.12]} />
        <meshStandardMaterial color="#8B0000" roughness={0.8} />
      </mesh>
      {/* Folds */}
      {[-0.08, 0.08].map((x, i) => (
        <mesh key={i} position={[x, 1.1, 0.07]}>
          <boxGeometry args={[0.04, 2.1, 0.03]} />
          <meshStandardMaterial color="#700000" roughness={0.8} />
        </mesh>
      ))}
      {/* Tie */}
      <mesh position={[0, 0.5, 0.08]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#ddaa44" metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ─── Spotlight ─── */
function Spotlight() {
  return (
    <group position={[0, 3.0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.05, 0.12, 0.2, 8]} />
        <meshStandardMaterial color="#333333" metalness={0.3} roughness={0.4} />
      </mesh>
      <pointLight color="#ffffcc" intensity={0.8} distance={8} />
    </group>
  );
}

/* ─── String Lights ─── */
function StringLights() {
  return (
    <group position={[0, 2.4, 0]}>
      {/* Wire */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.005, 0.005, 0.8, 4]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      {/* Bulbs */}
      {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
        <group key={i}>
          <mesh position={[x, -0.05, 0]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial
              color={["#ffcc00", "#ff6600", "#ff0066", "#6600ff"][i]}
              emissive={["#ffcc00", "#ff6600", "#ff0066", "#6600ff"][i]}
              emissiveIntensity={0.5}
            />
          </mesh>
          {/* Wire to bulb */}
          <mesh position={[x, -0.02, 0]}>
            <cylinderGeometry args={[0.003, 0.003, 0.06, 4]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── Cactus Pot ─── */
function CactusPot() {
  return (
    <group>
      {/* Pot */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.24, 8]} />
        <meshStandardMaterial color="#cc6633" roughness={0.7} />
      </mesh>
      {/* Main body */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.4, 8]} />
        <meshStandardMaterial color="#228B22" roughness={0.7} />
      </mesh>
      {/* Arm */}
      <mesh position={[0.1, 0.5, 0]} rotation={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.04, 0.045, 0.2, 6]} />
        <meshStandardMaterial color="#228B22" roughness={0.7} />
      </mesh>
      {/* Small arm */}
      <mesh position={[-0.06, 0.55, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.03, 0.035, 0.12, 6]} />
        <meshStandardMaterial color="#2a9b2a" roughness={0.7} />
      </mesh>
    </group>
  );
}

/* ─── Weights / Dumbbell Rack ─── */
function Weights() {
  return (
    <group>
      {/* Rack frame */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.35]} />
        <meshStandardMaterial color="#555555" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Shelves */}
      {[0.65, 0.4, 0.15].map((y, row) => (
        <group key={row}>
          <mesh position={[0, y, 0.05]}>
            <boxGeometry args={[0.72, 0.03, 0.28]} />
            <meshStandardMaterial color="#444444" metalness={0.2} />
          </mesh>
          {/* Dumbbells */}
          {[-0.2, 0, 0.2].map((x, i) => (
            <group key={`d${row}-${i}`} position={[x, y + 0.06, 0.05]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.015, 0.015, 0.15, 6]} />
                <meshStandardMaterial color="#888888" metalness={0.4} />
              </mesh>
              {[-0.08, 0.08].map((ox, j) => (
                <mesh key={j} position={[ox, 0, 0]}>
                  <sphereGeometry args={[0.03 + row * 0.008, 8, 8]} />
                  <meshStandardMaterial color="#222222" roughness={0.5} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ─── Bench Press ─── */
function BenchPress() {
  return (
    <group>
      {/* Bench pad */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.3, 0.08, 0.8]} />
        <meshStandardMaterial color="#222222" roughness={0.5} />
      </mesh>
      {/* Legs */}
      {[[-0.12, -0.3], [0.12, -0.3], [-0.12, 0.3], [0.12, 0.3]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.12, z]}>
          <cylinderGeometry args={[0.02, 0.02, 0.24, 6]} />
          <meshStandardMaterial color="#666666" metalness={0.3} />
        </mesh>
      ))}
      {/* Uprights */}
      {[-0.25, 0.25].map((z, i) => (
        <mesh key={`u${i}`} position={[0, 0.52, z]}>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 6]} />
          <meshStandardMaterial color="#666666" metalness={0.3} roughness={0.4} />
        </mesh>
      ))}
      {/* Bar */}
      <mesh position={[0, 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.7, 6]} />
        <meshStandardMaterial color="#888888" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Plates */}
      {[-0.32, 0.32].map((x, i) => (
        <mesh key={`p${i}`} position={[x, 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.04, 10]} />
          <meshStandardMaterial color="#222222" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Generic Fallback ─── */
function GenericBox({ color = "#888" }: { color?: string }) {
  return (
    <mesh position={[0, 0.3, 0]} castShadow>
      <boxGeometry args={[0.6, 0.6, 0.5]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

/* ═══ Furniture Map ═══ */

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
  prep_counter: PrepCounter,
  pot_rack: PotRack,
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
  armchair: LoungeChair,
  reading_desk: Table,
  audience_seat: AudienceSeat,
};

/* ═══ Main Furniture3D Component ═══ */

function Furniture3D({ item, cols, rows }: { item: FurnitureItem; cols: number; rows: number }) {
  const Component = FURNITURE_MAP[item.type] || (() => <GenericBox />);
  return (
    <group position={[item.tileX - cols / 2, 0.08, item.tileY - rows / 2]}>
      <Component />
    </group>
  );
}

export default memo(Furniture3D);
