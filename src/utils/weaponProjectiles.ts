import type { ProjectileData, Position } from "@/types";

interface Velocity {
  x: number;
  y: number;
}

interface CommonProjectileParams {
  /** World position where the projectiles start. */
  position: Position;
  /** Damage dealt by each projectile instance. */
  damage: number;
  /** Lifespan of each projectile in milliseconds. */
  duration: number;
  /** Optional custom id generator; receives the projectile index. */
  idFactory?: (index: number) => string;
}

interface SpreadParams extends CommonProjectileParams {
  /** Number of projectiles to create in the spread. */
  amount: number;
  /** Base velocity before applying spread offsets. */
  baseVelocity: Velocity;
  /** Offset delta applied per projectile to create the spread. */
  spreadStep: number;
}

interface DirectionParams extends CommonProjectileParams {
  /** Unit-ish direction vectors for each projectile. */
  directions: Velocity[];
  /** Speed multiplier applied to each direction. */
  speed: number;
}

const defaultIdFactory = () => Math.random().toString();

export const normalizeDirection = (dir: Velocity): Velocity => {
  const length = Math.sqrt(dir.x * dir.x + dir.y * dir.y) || 1;
  return { x: dir.x / length, y: dir.y / length };
};

export const buildVelocity = (dir: Velocity, speed: number): Velocity => {
  const unit = normalizeDirection(dir);
  return { x: unit.x * speed, y: unit.y * speed };
};

export const createSpreadProjectiles = ({
  amount,
  baseVelocity,
  spreadStep,
  position,
  damage,
  duration,
  idFactory = defaultIdFactory,
}: SpreadParams): ProjectileData[] =>
  Array.from({ length: amount }).map((_, index) => {
    const offset = spreadStep * (index - (amount - 1) / 2);
    return {
      id: idFactory(index),
      position,
      velocity: { x: baseVelocity.x + offset, y: baseVelocity.y + offset },
      duration,
      damage,
    };
  });

export const createDirectionalProjectiles = ({
  directions,
  speed,
  position,
  damage,
  duration,
  idFactory = defaultIdFactory,
}: DirectionParams): ProjectileData[] =>
  directions.map((dir, index) => {
    const velocity = buildVelocity(dir, speed);
    return {
      id: idFactory(index),
      position,
      velocity,
      duration,
      damage,
    };
  });
