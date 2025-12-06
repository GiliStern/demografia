import { FloorPickupId, type FloorPickupData } from "../../types";

export const FLOOR_PICKUPS: Record<FloorPickupId, FloorPickupData> = {
  [FloorPickupId.Hamin]: {
    id: FloorPickupId.Hamin,
    name_he: "חמין",
    description_he: "משיב מעט חיים.",
    healAmount: 30,
  },
  [FloorPickupId.Chest]: {
    id: FloorPickupId.Chest,
    name_he: "תיבה",
    description_he: "חיזוק אקראי (Placeholder).",
  },
};

