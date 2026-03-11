import type { CentralizedProjectile } from "@/types";

interface AdvancedProjectileState {
  position: CentralizedProjectile["position"];
  velocity: CentralizedProjectile["velocity"];
}

export const advanceProjectile = (
  projectile: CentralizedProjectile,
  delta: number,
): AdvancedProjectileState => {
  const acceleration = projectile.acceleration ?? { x: 0, y: 0, z: 0 };
  const nextVelocity = {
    x: projectile.velocity.x + acceleration.x * delta,
    y: projectile.velocity.y + acceleration.y * delta,
    z:
      (projectile.velocity.z ?? 0) + (acceleration.z ?? 0) * delta,
  };

  return {
    position: {
      x: projectile.position.x + nextVelocity.x * delta,
      y: projectile.position.y + nextVelocity.y * delta,
      z: projectile.position.z + nextVelocity.z * delta,
    },
    velocity: nextVelocity,
  };
};
