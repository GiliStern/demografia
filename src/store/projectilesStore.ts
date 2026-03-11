import type { StoreCreator, CentralizedProjectile } from "../types";
import { getProjectileManager } from "../simulation/projectileManager";

export interface ProjectilesStore {
  addProjectile: (projectile: CentralizedProjectile) => void;
  removeProjectile: (id: string) => void;
  addProjectiles: (projectiles: CentralizedProjectile[]) => void;
  clearProjectiles: () => void;

  getProjectileCount: () => number;
  getProjectilesArray: () => CentralizedProjectile[];
  getProjectile: (id: string) => CentralizedProjectile | undefined;
  getProjectiles: () => ReadonlyMap<string, CentralizedProjectile>;
}

// set unused: projectile state lives in manager, not Zustand
export const createProjectilesStore: StoreCreator<ProjectilesStore> = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  set,
) => {
  const manager = getProjectileManager();

  return {
    addProjectile: (projectile) => {
      manager.addProjectile(projectile);
    },

    removeProjectile: (id) => {
      manager.removeProjectile(id);
    },

    addProjectiles: (newProjectiles) => {
      manager.addProjectiles(newProjectiles);
    },

    clearProjectiles: () => {
      manager.clearProjectiles();
    },

    getProjectileCount: () => manager.getCount(),

    getProjectilesArray: () => manager.getSnapshot(),

    getProjectile: (id) => manager.getProjectile(id),

    getProjectiles: () => manager.getMap(),
  };
};
