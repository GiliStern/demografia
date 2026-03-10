import { createContext, type MutableRefObject } from "react";
import type { MoveInput } from "@/types/hooks/controls";

export const MovementInputContext =
  createContext<MutableRefObject<MoveInput> | null>(null);
