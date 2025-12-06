import { Projectile } from "../Projectile";
import type { ProjectileData, WeaponComponentProps } from "../../types";
import { useProjectileWeapon } from "../../hooks/useProjectileWeapon";

export const ProjectileWeapon = ({ weaponId }: WeaponComponentProps) => {
  const { projectiles, spriteConfig, damage, removeProjectile, shouldSpin } =
    useProjectileWeapon({
      weaponId,
    });

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
