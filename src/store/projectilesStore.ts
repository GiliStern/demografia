import type { StoreCreator, CentralizedProjectile } from "../types";
import { getProjectileManager } from "../simulation/projectileManager";

export interface ProjectilesStore {
  projectileCount: number;

  addProjectile: (projectile: CentralizedProjectile) => void;
  removeProjectile: (id: string) => void;
  addProjectiles: (projectiles: CentralizedProjectile[]) => void;
  clearProjectiles: () => void;
  syncProjectileCount: () => void;

  getProjectilesArray: () => CentralizedProjectile[];
  getProjectile: (id: string) => CentralizedProjectile | undefined;
  getProjectiles: () => ReadonlyMap<string, CentralizedProjectile>;
}

export const createProjectilesStore: StoreCreator<ProjectilesStore> = (
  set
) => {
  const manager = getProjectileManager();

  return {
    projectileCount: 0,

    addProjectile: (projectile) => {
      manager.addProjectile(projectile);
      set({ projectileCount: manager.getCount() });
    },

    removeProjectile: (id) => {
      manager.removeProjectile(id);
      set({ projectileCount: manager.getCount() });
    },

    addProjectiles: (newProjectiles) => {
      manager.addProjectiles(newProjectiles);
      set({ projectileCount: manager.getCount() });
    },

    clearProjectiles: () => {
      manager.clearProjectiles();
      set({ projectileCount: 0 });
    },

    syncProjectileCount: () => {
      set({ projectileCount: manager.getCount() });
    },

    getProjectilesArray: () => manager.getSnapshot(),

    getProjectile: (id) => manager.getProjectile(id),

    getProjectiles: () => {
      const snapshot = manager.getSnapshot();
      return new Map(snapshot.map((p) => [p.id, p])) as ReadonlyMap<
        string,
        CentralizedProjectile
      >;
    },
  };
};
