import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { ProjectileData } from "@/types";

interface StaggerState {
  pendingShots: MutableRefObject<ProjectileData[]>;
  nextStaggerTime: MutableRefObject<number | null>;
  staggerSeconds?: number;
}

interface EnqueueShotsParams extends StaggerState {
  shots: ProjectileData[];
  time: number;
}

interface ReleaseShotsParams extends StaggerState {
  time: number;
  setProjectiles: Dispatch<SetStateAction<ProjectileData[]>>;
}

const DEFAULT_STAGGER_SECONDS = 0.3;

export const enqueueStaggeredShots = ({
  shots,
  time,
  pendingShots,
  nextStaggerTime,
  staggerSeconds = DEFAULT_STAGGER_SECONDS,
}: EnqueueShotsParams): ProjectileData[] => {
  const [first, ...rest] = shots;
  const immediateShots: ProjectileData[] = [];

  if (first) {
    immediateShots.push(first);
  }

  if (rest.length > 0) {
    pendingShots.current.push(...rest);
    nextStaggerTime.current = time + staggerSeconds;
  } else {
    nextStaggerTime.current = null;
  }

  return immediateShots;
};

export const releaseStaggeredShots = ({
  time,
  pendingShots,
  nextStaggerTime,
  setProjectiles,
  staggerSeconds = DEFAULT_STAGGER_SECONDS,
}: ReleaseShotsParams): void => {
  while (
    pendingShots.current.length > 0 &&
    nextStaggerTime.current !== null &&
    time >= nextStaggerTime.current
  ) {
    const nextShot = pendingShots.current.shift();
    if (nextShot) {
      setProjectiles((prev) => [...prev, nextShot]);
    }
    nextStaggerTime.current =
      pendingShots.current.length > 0
        ? nextStaggerTime.current + staggerSeconds
        : null;
  }
};
