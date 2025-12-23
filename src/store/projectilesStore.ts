import type { StoreCreator, CentralizedProjectile } from "../types";

export interface ProjectilesStore {
  projectiles: Map<string, CentralizedProjectile>;

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
  set,
  get
) => ({
  projectiles: new Map(),

  addProjectile: (projectile) => {
    const projectiles = new Map(get().projectiles);
    projectiles.set(projectile.id, projectile);
    set({ projectiles });
  },

  removeProjectile: (id) => {
    const projectiles = new Map(get().projectiles);
    projectiles.delete(id);
    set({ projectiles });
  },

  addProjectiles: (newProjectiles) => {
    const projectiles = new Map(get().projectiles);
    for (const projectile of newProjectiles) {
      projectiles.set(projectile.id, projectile);
    }
    set({ projectiles });
  },

  clearProjectiles: () => {
    set({ projectiles: new Map() });
  },

  getProjectilesArray: () => {
    return Array.from(get().projectiles.values());
  },

  updateProjectile: (id, updates) => {
    const projectiles = new Map(get().projectiles);
    const existing = projectiles.get(id);
    if (existing) {
      projectiles.set(id, { ...existing, ...updates });
      set({ projectiles });
    }
  },

  updateProjectiles: (batchUpdates) => {
    const projectiles = new Map(get().projectiles);
    let changed = false;
    for (const { id, updates } of batchUpdates) {
      const existing = projectiles.get(id);
      if (existing) {
        projectiles.set(id, { ...existing, ...updates });
        changed = true;
      }
    }
    if (changed) {
      set({ projectiles });
    }
  },
});
