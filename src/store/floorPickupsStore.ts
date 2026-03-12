import type {
  StoreCreator,
  GameStore,
  FloorPickupsStore,
  FloorPickupInstance,
} from "../types";

export const createFloorPickupsStore: StoreCreator<FloorPickupsStore> = (
  set,
) => ({
  floorPickupsMap: new Map<string, FloorPickupInstance>(),

  addFloorPickup: (instance: FloorPickupInstance) =>
    set((state: GameStore) => {
      const newMap = new Map(state.floorPickupsMap);
      newMap.set(instance.id, instance);
      return { floorPickupsMap: newMap };
    }),

  removeFloorPickup: (id: string) =>
    set((state: GameStore) => {
      const newMap = new Map(state.floorPickupsMap);
      newMap.delete(id);
      return { floorPickupsMap: newMap };
    }),

  resetFloorPickups: () =>
    set({ floorPickupsMap: new Map<string, FloorPickupInstance>() }),
});
