import type { MutableRefObject, ReactNode } from "react";
import type { MoveInput } from "@/types/hooks/controls";
import { MovementInputContext } from "./movementInputContext";

export const MovementInputProvider = ({
  inputRef,
  children,
}: {
  inputRef: MutableRefObject<MoveInput>;
  children: ReactNode;
}) => {
  return (
    <MovementInputContext.Provider value={inputRef}>
      {children}
    </MovementInputContext.Provider>
  );
};
