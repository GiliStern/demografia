import { Enemy } from "./Enemy";
import { useWaveManager } from "../hooks/game/useWaveManager";

// Re-export for backward compatibility
export type { ActiveEnemy } from "../hooks/game/useWaveManager";

export const WaveManager = () => {
  const { enemies, removeEnemy } = useWaveManager();

  return (
    <>
      {enemies.map((e) => (
        <Enemy key={e.id} {...e} onDeath={() => removeEnemy(e.id)} />
      ))}
    </>
  );
};
