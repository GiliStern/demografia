export interface Vec2 {
  x: number;
  y: number;
}

export const distanceSq = (a: Vec2, b: Vec2) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
};

export const distance = (a: Vec2, b: Vec2) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const normalize = (v: Vec2): Vec2 => {
  const len = Math.hypot(v.x, v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
};

export const nearestEnemyDirection = (
  playerPos: Vec2,
  enemies: Record<string, Vec2> | ReadonlyMap<string, Vec2>,
): Vec2 | null => {
  let bestPos: Vec2 | null = null;
  let bestDist = Number.POSITIVE_INFINITY;

  if (enemies instanceof Map) {
    for (const pos of enemies.values()) {
      const d = distanceSq(playerPos, pos as Vec2);
      if (d < bestDist) {
        bestDist = d;
        bestPos = pos as Vec2;
      }
    }
  } else {
    for (const pos of Object.values(enemies)) {
      const d = distanceSq(playerPos, pos as Vec2);
      if (d < bestDist) {
        bestDist = d;
        bestPos = pos as Vec2;
      }
    }
  }

  if (!bestPos) return null;
  const dir = normalize({
    x: bestPos.x - playerPos.x,
    y: bestPos.y - playerPos.y,
  });
  return dir;
};

export const reflectInBounds = (
  pos: Vec2,
  vel: Vec2,
  playerPos: Vec2,
  halfWidth: number,
  halfHeight: number,
): Vec2 => {
  const nextVel = { ...vel };
  const rightBound = playerPos.x + halfWidth;
  const leftBound = playerPos.x - halfWidth;
  const topBound = playerPos.y + halfHeight;
  const bottomBound = playerPos.y - halfHeight;

  if (pos.x > rightBound && vel.x > 0) nextVel.x *= -1;
  if (pos.x < leftBound && vel.x < 0) nextVel.x *= -1;
  if (pos.y > topBound && vel.y > 0) nextVel.y *= -1;
  if (pos.y < bottomBound && vel.y < 0) nextVel.y *= -1;
  return nextVel;
};

export const radialDirections = (count: number): Vec2[] => {
  if (count <= 0) return [];
  const dirs: Vec2[] = [];
  const step = (Math.PI * 2) / count;
  for (let i = 0; i < count; i++) {
    const angle = step * i;
    dirs.push({ x: Math.cos(angle), y: Math.sin(angle) });
  }
  return dirs;
};
