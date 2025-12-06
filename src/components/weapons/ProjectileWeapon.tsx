import { Projectile } from "../Projectile";
import type { ProjectileData, WeaponComponentProps } from "../../types";
import { useProjectileWeapon } from "../../utils/projectileWeapons";

export const ProjectileWeapon = ({ weaponId }: WeaponComponentProps) => {
  const { projectiles, spriteConfig, damage, removeProjectile } =
    useProjectileWeapon({
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
          onDespawn={() => removeProjectile(p.id)}
          damage={damage}
        />
      ))}
    </>
  );
};
