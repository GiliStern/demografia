import { useGameStore } from "@/store/gameStore";
import { XpOrb } from "./XpOrb";
import type { XpOrbData } from "@/types";

export const XpOrbsManager = () => {
  const xpOrbs = useGameStore((state) => state.xpOrbs);

  return (
    <>
      {xpOrbs.map((orb: XpOrbData) => (
        <XpOrb
          key={orb.id}
          id={orb.id}
          position={[orb.position.x, orb.position.y, 0]}
          xpValue={orb.xpValue}
        />
      ))}
    </>
  );
};
