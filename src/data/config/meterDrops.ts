import { FloorPickupId } from "@/types";

export interface MeterDropEntry {
  pickupId: FloorPickupId;
  weight: number;
  minPlayerLevel?: number;
}

/**
 * Drop table for meter (light source) destruction.
 * Weights based on Vampire Survivors light source drops.
 * Luck increases chance for rarer drops (weights are scaled by luck for the roll).
 */
export const METER_DROP_TABLE: MeterDropEntry[] = [
  { pickupId: FloorPickupId.Coins, weight: 50, minPlayerLevel: 0 },
  { pickupId: FloorPickupId.Buchta, weight: 10, minPlayerLevel: 0 },
  {
    pickupId: FloorPickupId.MassiveWadOfCash,
    weight: 1,
    minPlayerLevel: 5,
  },
  { pickupId: FloorPickupId.Hamin, weight: 12, minPlayerLevel: 0 },
  { pickupId: FloorPickupId.Magnet, weight: 40, minPlayerLevel: 0 },
  // Later: Genocide, Recess, Blowtorch, KeyChallah
];

/**
 * Resolves which pickup drops from a destroyed meter.
 * Luck increases the effective weight of rarer items (higher weight = more common).
 * Formula: effectiveWeight = baseWeight * (1 + luckBonus) for rare items, or inverse for common.
 * Simple approach: Luck multiplies weights of items with weight <= threshold (rarer items).
 */
export function resolveMeterDrop(
  playerLevel: number,
  luck: number,
): FloorPickupId {
  const eligible = METER_DROP_TABLE.filter(
    (e) => (e.minPlayerLevel ?? 0) <= playerLevel,
  );
  if (eligible.length === 0) {
    return FloorPickupId.Coins;
  }

  // Luck bias: higher luck increases chance of lower-weight (rarer) items
  // Apply luck multiplier to weights: rare items get (1 + luck) factor
  const totalWeight = eligible.reduce((sum, e) => {
    const base = e.weight;
    const luckBonus = luck > 1 ? Math.min(luck - 1, 1) : 0;
    const effectiveWeight =
      base <= 10 ? base * (1 + luckBonus * 0.5) : base / (1 + luckBonus * 0.3);
    return sum + Math.max(0.1, effectiveWeight);
  }, 0);

  let r = Math.random() * totalWeight;
  for (const entry of eligible) {
    const base = entry.weight;
    const luckBonus = luck > 1 ? Math.min(luck - 1, 1) : 0;
    const effectiveWeight =
      base <= 10 ? base * (1 + luckBonus * 0.5) : base / (1 + luckBonus * 0.3);
    const w = Math.max(0.1, effectiveWeight);
    if (r < w) return entry.pickupId;
    r -= w;
  }
  return eligible[eligible.length - 1]?.pickupId ?? FloorPickupId.Coins;
}
