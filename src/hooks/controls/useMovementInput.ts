import { useContext, type MutableRefObject } from "react";
import type { MoveInput } from "@/types/hooks/controls";
import { MovementInputContext } from "./movementInputContext";

export const useMovementInput = (): MutableRefObject<MoveInput> => {
  const context = useContext(MovementInputContext);
  if (!context) {
    throw new Error("useMovementInput must be used within MovementInputProvider");
  }

  return context;
};
