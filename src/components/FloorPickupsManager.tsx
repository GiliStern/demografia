import { useMemo } from "react";
import { useFloorPickupsStore } from "@/store/gameStore";
import { FloorPickup } from "./FloorPickup";

export const FloorPickupsManager = () => {
  const floorPickupsMap = useFloorPickupsStore(
    (state) => state.floorPickupsMap,
  );
  const instances = useMemo(
    () => Array.from(floorPickupsMap.values()),
    [floorPickupsMap],
  );

  return (
    <>
      {instances.map((instance) => (
        <FloorPickup key={instance.id} instance={instance} />
      ))}
    </>
  );
};
