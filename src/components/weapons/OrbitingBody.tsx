import { useRef, useState } from "react";
import type { MutableRefObject } from "react";
import {
  RigidBody,
  CuboidCollider,
  RapierRigidBody,
} from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import type { SpriteConfig } from "@/types";
import { type OrbitingOrb } from "@/hooks/weapons/useOrbitWeapon";
import { Sprite } from "../Sprite";
import { usePauseAwareFrame } from "@/hooks/game/usePauseAwareFrame";
import { getSpinningSpriteIndex } from "@/utils/entities/enemyAnimation";
import { getGameplayContext } from "@/simulation/gameplayContext";
import { getEnemyManager } from "@/simulation/enemyManager";

const ORBIT_COLLISION_RADIUS = 0.5;
const ORBIT_HIT_COOLDOWN = 0.3;

export interface OrbitingBodyProps {
  orb: OrbitingOrb;
  radius: number;
  baseAngle: MutableRefObject<number>;
  playerPosition: { x: number; y: number };
  damage: number;
  knockback: number;
  spriteConfig: SpriteConfig;
  shouldSpin?: boolean;
}

const computeOrbitPosition = (
  orb: OrbitingOrb,
  baseAngle: number,
  radius: number,
  playerPosition: { x: number; y: number },
) => {
  // Angle = per-orb offset plus shared base angle so all orbiters rotate together.
  const angle = orb.angleOffset + baseAngle;
  // Convert polar coordinates (angle, radius) around the player into world x/y.
  return {
    x: playerPosition.x + Math.cos(angle) * radius,
    y: playerPosition.y + Math.sin(angle) * radius,
  };
};

export const OrbitingBody = ({
  orb,
  radius,
  baseAngle,
  playerPosition,
  damage,
  knockback,
  spriteConfig,
  shouldSpin,
}: OrbitingBodyProps) => {
  const bodyRef = useRef<RapierRigidBody>(null);
  const positionRef = useRef<[number, number, number]>([0, 0, 0]);
  const lastHitByEnemyRef = useRef<Map<string, number>>(new Map());
  const lastHitByMeterRef = useRef<Map<string, number>>(new Map());
  const [spriteIndex, setSpriteIndex] = useState(spriteConfig.index);
  const lastFrameRef = useRef(spriteConfig.index);

  const shouldAnimate = shouldSpin && (spriteConfig.spriteFrameCount ?? 0) >= 2;

  useFrame((state) => {
    if (shouldAnimate) {
      const currentTime = state.clock.getElapsedTime();
      const frame = getSpinningSpriteIndex(currentTime);
      if (frame !== lastFrameRef.current) {
        lastFrameRef.current = frame;
        setSpriteIndex(frame);
      }
    }
  });

  usePauseAwareFrame(() => {
    // keep the kinematic body awake so orbiting continues while idle
    bodyRef.current?.wakeUp();
    const { x, y } = computeOrbitPosition(
      orb,
      baseAngle.current,
      radius,
      playerPosition,
    );
    positionRef.current = [x, y, 0];
    bodyRef.current?.setNextKinematicTranslation({ x, y, z: 0 });

    // Collision with enemies and meters (no physics bodies, so we check manually)
    const now = performance.now() / 1000;
    const tickCtx = getGameplayContext().getProjectileTickContext();
    const enemyPositions = getEnemyManager().getEnemyPositions();
    const meterPositions = tickCtx.getMeterPositions();
    const applyEnemyHit = tickCtx.applyEnemyHit;
    const onMeterHit = tickCtx.onMeterHit;

    for (const [enemyId, enemyPos] of enemyPositions) {
      const dx = enemyPos.x - x;
      const dy = enemyPos.y - y;
      const distSq = dx * dx + dy * dy;
      if (distSq > ORBIT_COLLISION_RADIUS * ORBIT_COLLISION_RADIUS) continue;

      const lastHit = lastHitByEnemyRef.current.get(enemyId) ?? 0;
      if (now - lastHit < ORBIT_HIT_COOLDOWN) continue;

      lastHitByEnemyRef.current.set(enemyId, now);

      const len = Math.sqrt(dx * dx + dy * dy);
      const hitDir = len > 0.01 ? { x: dx / len, y: dy / len } : { x: 1, y: 0 };

      applyEnemyHit({
        enemyId,
        damage,
        knockback,
        hitDir,
      });
    }

    for (const [meterId, meterPos] of meterPositions) {
      const dx = meterPos.x - x;
      const dy = meterPos.y - y;
      const distSq = dx * dx + dy * dy;
      if (distSq > ORBIT_COLLISION_RADIUS * ORBIT_COLLISION_RADIUS) continue;

      const lastHit = lastHitByMeterRef.current.get(meterId) ?? 0;
      if (now - lastHit < ORBIT_HIT_COOLDOWN) continue;

      lastHitByMeterRef.current.set(meterId, now);
      onMeterHit(meterId);
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      lockRotations
      sensor
      gravityScale={0}
      canSleep={false}
      userData={{ type: "projectile", id: orb.id, damage, owner: "player" }}
      position={positionRef.current}
    >
      <CuboidCollider args={[0.35, 0.35, 0.35]} />
      <Sprite
        textureUrl={spriteConfig.textureUrl}
        index={shouldAnimate ? spriteIndex : spriteConfig.index}
        scale={spriteConfig.scale}
        {...(spriteConfig.spriteFrameSize
          ? { spriteFrameSize: spriteConfig.spriteFrameSize }
          : {})}
      />
    </RigidBody>
  );
};
