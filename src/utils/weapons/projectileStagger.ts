import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { ProjectileData } from "@/types";

interface StaggerState {
  pendingShots: MutableRefObject<number[]>;
  nextStaggerTime: MutableRefObject<number | null>;
  staggerSeconds?: number;
}

interface EnqueueShotsParams extends StaggerState {
  amount: number;
  time: number;
}

export interface EnqueueShotsResult {
  immediateIndex: number | null;
  pendingIndices: number[];
}

interface ReleaseShotsParams extends StaggerState {
  time: number;
  produceShot: (index: number) => ProjectileData;
  setProjectiles: Dispatch<SetStateAction<ProjectileData[]>>;
}

const DEFAULT_STAGGER_SECONDS = 0.3;

export const enqueueStaggeredShots = ({
  amount,
  time,
  pendingShots,
  nextStaggerTime,
  staggerSeconds = DEFAULT_STAGGER_SECONDS,
}: EnqueueShotsParams): EnqueueShotsResult => {
  if (amount <= 0) {
    return { immediateIndex: null, pendingIndices: [] };
  }

  const immediateIndex = 0;
  const pendingIndices = Array.from({ length: amount - 1 }, (_, i) => i + 1);

  if (pendingIndices.length > 0) {
    pendingShots.current.push(...pendingIndices);
    nextStaggerTime.current = time + staggerSeconds;
  } else {
    nextStaggerTime.current = null;
  }

  return { immediateIndex, pendingIndices };
};

export const releaseStaggeredShots = ({
  time,
  pendingShots,
  nextStaggerTime,
  produceShot,
  setProjectiles,
  staggerSeconds = DEFAULT_STAGGER_SECONDS,
}: ReleaseShotsParams): void => {
  while (
    pendingShots.current.length > 0 &&
    nextStaggerTime.current !== null &&
    time >= nextStaggerTime.current
  ) {
    const index = pendingShots.current.shift();
    if (index !== undefined) {
      const shot = produceShot(index);
      setProjectiles([shot]);
    }
    nextStaggerTime.current =
      pendingShots.current.length > 0
        ? nextStaggerTime.current + staggerSeconds
        : null;
  }
};
