import { EnemyId, type WavesConfig } from "../../types";

export enum WaveId {
  Stage1 = "stage_1",
}

export const WAVES: WavesConfig = {
  [WaveId.Stage1]: [
    {
      time_start: 0,
      time_end: 60,
      enemies: [
        { id: EnemyId.StreetCats, spawn_interval: 1.0, max_active: 20 },
      ],
    },
    {
      time_start: 60,
      time_end: 120,
      enemies: [
        { id: EnemyId.StreetCats, spawn_interval: 1.5, max_active: 15 },
        { id: EnemyId.Hipster, spawn_interval: 2.0, max_active: 10 },
      ],
    },
    {
      time_start: 120,
      time_end: 180,
      enemies: [
        { id: EnemyId.Hipster, spawn_interval: 1.5, max_active: 20 },
        {
          id: EnemyId.ScooterSwarm,
          spawn_interval: 0.5,
          max_active: 30,
          group_spawn: true,
        },
      ],
    },
    {
      time_start: 180,
      time_end: 300,
      enemies: [
        { id: EnemyId.Tourist, spawn_interval: 2.0, max_active: 15 },
        { id: EnemyId.TiktokStar, spawn_interval: 3.0, max_active: 5 },
      ],
    },
  ],
};
