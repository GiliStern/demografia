/**
 * Meter Manager
 *
 * Object-pooled destructible parking meters (light sources).
 * Spawn/cull driven by MetersManager component; collision handled in projectile tick.
 */

import { generatePrefixedId } from "@/utils/common/idGenerator";
import { METER_CONFIG } from "@/data/config/meters";

export interface MeterPosition {
  x: number;
  y: number;
}

export interface MeterRuntimeState {
  id: string;
  position: MeterPosition;
  active: boolean;
}

export interface MeterManager {
  spawnMeter(position: MeterPosition): string;
  destroyMeter(id: string): MeterPosition | null;
  getMeterPositions(): ReadonlyMap<string, MeterPosition>;
  getSnapshot(): MeterRuntimeState[];
  getCount(): number;
  clearAll(): void;
}

const MAX_METERS = 10;

export function createMeterManager(): MeterManager {
  const pool: MeterRuntimeState[] = [];
  const active = new Map<string, MeterRuntimeState>();

  function getOrCreateFromPool(): MeterRuntimeState {
    const recycled = pool.pop();
    if (recycled) {
      recycled.active = true;
      return recycled;
    }
    return {
      id: generatePrefixedId("meter"),
      position: { x: 0, y: 0 },
      active: true,
    };
  }

  return {
    spawnMeter(position) {
      if (active.size >= MAX_METERS) return "";

      const meter = getOrCreateFromPool();
      meter.position = { ...position };
      active.set(meter.id, meter);
      return meter.id;
    },

    destroyMeter(id) {
      const meter = active.get(id);
      if (!meter) return null;

      active.delete(id);
      const pos = { ...meter.position };
      meter.active = false;
      pool.push(meter);
      return pos;
    },

    getMeterPositions() {
      const map = new Map<string, MeterPosition>();
      for (const [id, m] of active) {
        map.set(id, m.position);
      }
      return map;
    },

    getSnapshot() {
      return Array.from(active.values());
    },

    getCount() {
      return active.size;
    },

    clearAll() {
      for (const m of active.values()) {
        m.active = false;
        pool.push(m);
      }
      active.clear();
    },
  };
}

let globalManager: MeterManager | null = null;

export function getMeterManager(): MeterManager {
  return (globalManager ??= createMeterManager());
}

export function resetMeterManager(): void {
  if (globalManager) {
    globalManager.clearAll();
  }
}

export { METER_CONFIG };
