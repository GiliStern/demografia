import type { WavesConfig } from "../../types";

export const WAVES: WavesConfig = {
  stage_1: [
    {
      time_start: 0,
      time_end: 60,
      enemies: [{ id: "street_cats", spawn_interval: 1.0, max_active: 20 }],
    },
    {
      time_start: 60,
      time_end: 120,
      enemies: [
        { id: "street_cats", spawn_interval: 1.5, max_active: 15 },
        { id: "hipster", spawn_interval: 2.0, max_active: 10 },
      ],
    },
    {
      time_start: 120,
      time_end: 180,
      enemies: [
        { id: "hipster", spawn_interval: 1.5, max_active: 20 },
        {
          id: "scooter_swarm",
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
        { id: "tourist", spawn_interval: 2.0, max_active: 15 },
        { id: "tiktok_star", spawn_interval: 3.0, max_active: 5 },
      ],
    },
  ],
};

