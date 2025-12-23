import type { EnemyUserData } from "@/types";

export const isEnemyUserData = (value: unknown): value is EnemyUserData => {
  if (typeof value !== "object" || value === null) return false;
  if (!("type" in value)) return false;
  return value.type === "enemy";
};

