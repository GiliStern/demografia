import type { StoreCreator, CentralizedProjectile } from "../types";

export interface ProjectilesStore {
  projectileCount: number;

  // Add a projectile to the central pool
  addProjectile: (projectile: CentralizedProjectile) => void;

  // Remove a projectile by ID
  removeProjectile: (id: string) => void;

  // Batch add multiple projectiles (for weapons that fire volleys)
  addProjectiles: (projectiles: CentralizedProjectile[]) => void;

  // Clear all projectiles
  clearProjectiles: () => void;

  // Get all projectiles as array
  getProjectilesArray: () => CentralizedProjectile[];
  getProjectile: (id: string) => CentralizedProjectile | undefined;
  getProjectiles: () => ReadonlyMap<string, CentralizedProjectile>;

  // Update projectile position (for bouncing, homing, etc.)
  updateProjectile: (
    id: string,
    updates: Partial<CentralizedProjectile>
  ) => void;

  // Batch update multiple projectiles
  updateProjectiles: (
    updates: { id: string; updates: Partial<CentralizedProjectile> }[]
  ) => void;
}

export const createProjectilesStore: StoreCreator<ProjectilesStore> = (
  set
) => {
  const projectiles = new Map<string, CentralizedProjectile>();

  return {
    projectileCount: 0,

    addProjectile: (projectile) => {
      projectiles.set(projectile.id, projectile);
      set({ projectileCount: projectiles.size });
    },

    removeProjectile: (id) => {
      if (!projectiles.has(id)) return;
      projectiles.delete(id);
      set({ projectileCount: projectiles.size });
    },

    addProjectiles: (newProjectiles) => {
      for (const projectile of newProjectiles) {
        projectiles.set(projectile.id, projectile);
      }
      set({ projectileCount: projectiles.size });
    },

    clearProjectiles: () => {
      projectiles.clear();
      set({ projectileCount: 0 });
    },

    getProjectilesArray: () => {
      return Array.from(projectiles.values());
    },

    getProjectile: (id) => {
      return projectiles.get(id);
    },

    getProjectiles: () => {
      return projectiles;
    },

    updateProjectile: (id, updates) => {
      const existing = projectiles.get(id);
      if (existing) {
        projectiles.set(id, { ...existing, ...updates });
      }
    },

    updateProjectiles: (batchUpdates) => {
      for (const { id, updates } of batchUpdates) {
        const existing = projectiles.get(id);
        if (existing) {
          projectiles.set(id, { ...existing, ...updates });
        }
      }
    },
  };
};
