import { useMemo } from "react";
import { useXpOrbsStore } from "@/store/gameStore";
import { XpOrb } from "./XpOrb";
import type { XpOrbData } from "@/types";

export const XpOrbsManager = () => {
  const xpOrbsMap = useXpOrbsStore((state) => state.xpOrbsMap);
  const xpOrbs = useMemo(
    () => Array.from(xpOrbsMap.values()),
    [xpOrbsMap],
  );

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
