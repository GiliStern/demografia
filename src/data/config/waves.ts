import { EnemyId, type WavesConfig } from "../../types";

export enum WaveId {
  TelAviv = "tel_aviv",
}

export const WAVES: WavesConfig = {
  [WaveId.TelAviv]: [
    {
      time_start: 0,
      time_end: 30,
      enemies: [
        { id: EnemyId.StreetCats, spawn_interval: 1.0, max_active: 20 },
      ],
    },
    {
      time_start: 30,
      time_end: 120,
      enemies: [
        { id: EnemyId.StreetCats, spawn_interval: 1.0, max_active: 15 },
        { id: EnemyId.Hipster, spawn_interval: 2.5, max_active: 6 },
      ],
    },
    {
      time_start: 120,
      time_end: 240,
      enemies: [
        { id: EnemyId.StreetCats, spawn_interval: 1.0, max_active: 20 },
        { id: EnemyId.Hipster, spawn_interval: 1.5, max_active: 20 },
        {
          id: EnemyId.ScooterSwarm,
          spawn_interval: 0.5,
          max_active: 10,
          group_spawn: true,
        },
      ],
    },
    {
      time_start: 240,
      time_end: 360,
      enemies: [
        { id: EnemyId.StreetCats, spawn_interval: 1.0, max_active: 20 },
        { id: EnemyId.TiktokStar, spawn_interval: 3.0, max_active: 5 },
      ],
    },
    {
      time_start: 360,
      time_end: 480,
      enemies: [
        { id: EnemyId.StreetCats, spawn_interval: 1.0, max_active: 20 },
        { id: EnemyId.Tourist, spawn_interval: 2.0, max_active: 15 },
        { id: EnemyId.TiktokStar, spawn_interval: 3.0, max_active: 5 },
      ],
    },
  ],
};
