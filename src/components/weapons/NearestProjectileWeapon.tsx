import { Projectile } from "../Projectile";
import type { ProjectileData, WeaponComponentProps } from "../../types";
import { useNearestProjectileWeapon } from "../../hooks/useNearestProjectileWeapon";

export const NearestProjectileWeapon = ({ weaponId }: WeaponComponentProps) => {
  const { projectiles, spriteConfig, damage, removeProjectile, shouldSpin } =
    useNearestProjectileWeapon({
      weaponId,
    });

  if (!spriteConfig) return null;

  return (
    <>
      {projectiles.map((p: ProjectileData) => (
        <Projectile
          key={p.id}
          {...p}
          spriteConfig={spriteConfig}
          shouldSpin={shouldSpin}
          onDespawn={() => removeProjectile(p.id)}
          damage={damage}
        />
      ))}
    </>
  );
};
