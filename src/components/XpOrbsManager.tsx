import { useGameStore } from "../hooks/useGameStore";
import { XpOrb } from "./XpOrb";

export const XpOrbsManager = () => {
  const xpOrbs = useGameStore((state) => state.xpOrbs);

  return (
    <>
      {xpOrbs.map((orb) => (
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

