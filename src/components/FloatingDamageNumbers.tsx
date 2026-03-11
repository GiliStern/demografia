import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useGameStore } from "@/store/gameStore";
import { useSessionStore } from "@/store/sessionStore";

const FLOAT_SPEED = 1.5;
const LIFETIME_SEC = 1;

const DamageNumber = ({
  x,
  y,
  damage,
  createdAt,
}: {
  x: number;
  y: number;
  damage: number;
  createdAt: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const now = performance.now() / 1000;
    const elapsed = now - createdAt;
    const offsetY = elapsed * FLOAT_SPEED;
    groupRef.current.position.set(x, y + offsetY, 0);
  });

  return (
    <group ref={groupRef} position={[x, y, 0]}>
      <Html
        center
        style={{
          color: "red",
          fontSize: "14px",
          fontWeight: "medium",
          textShadow: "0 1px 2px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.5)",
          pointerEvents: "none",
          userSelect: "none",
          animation: "floatingDamageFade 1s forwards",
        }}
      >
        <span>{Math.round(damage)}</span>
      </Html>
    </group>
  );
};

export const FloatingDamageNumbers = () => {
  const entries = useGameStore((state) => state.floatingDamageEntries);
  const removeFloatingDamage = useGameStore(
    (state) => state.removeFloatingDamage,
  );
  const isRunning = useSessionStore((state) => state.isRunning);
  const isPaused = useSessionStore((state) => state.isPaused);

  useFrame(() => {
    if (isPaused || !isRunning) return;
    const now = performance.now() / 1000;
    for (const entry of entries) {
      if (now - entry.createdAt > LIFETIME_SEC) {
        removeFloatingDamage(entry.id);
      }
    }
  });

  if (!isRunning || entries.length === 0) return null;

  return (
    <>
      {entries.map((entry) => (
        <DamageNumber
          key={entry.id}
          x={entry.x}
          y={entry.y}
          damage={entry.damage}
          createdAt={entry.createdAt}
        />
      ))}
    </>
  );
};
