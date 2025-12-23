import type { WeaponComponentProps } from "@/types";
import { useOrbitWeapon } from "@/hooks/weapons/useOrbitWeapon";
import { OrbitingBody } from "./OrbitingBody";

export const OrbitWeapon = ({ weaponId }: WeaponComponentProps) => {
  const {
    orbiters,
    spriteConfig,
    damage,
    radius,
    baseAngleRef,
    playerPosition,
  } = useOrbitWeapon({ weaponId });

  return (
    <>
      {orbiters.map((orb) => (
        <OrbitingBody
          key={orb.id}
          orb={orb}
          radius={radius}
          baseAngle={baseAngleRef}
          playerPosition={playerPosition}
          damage={damage}
          spriteConfig={spriteConfig}
        />
      ))}
    </>
  );
};
