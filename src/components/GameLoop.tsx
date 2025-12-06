import { useFrame } from "@react-three/fiber";
import { useGameStore } from "../hooks/useGameStore";

export const GameLoop = () => {
  const updateTimer = useGameStore((state) => state.updateTimer);
  useFrame((_state, delta) => {
    updateTimer(delta);
  });
  return null;
};
