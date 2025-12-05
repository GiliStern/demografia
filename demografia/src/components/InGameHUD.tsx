import { useGameStore } from '../store/gameStore';
import uiData from '../data/ui.json';

export const InGameHUD = () => {
  const { 
    currentHealth, 
    playerStats, 
    level, 
    gold, 
    xp, 
    nextLevelXp, 
    runTimer, 
    activeWeapons 
  } = useGameStore();

  // Format timer mm:ss
  const minutes = Math.floor(runTimer / 60).toString().padStart(2, '0');
  const seconds = Math.floor(runTimer % 60).toString().padStart(2, '0');
  
  const healthPercent = (currentHealth / playerStats.maxHealth) * 100;
  const xpPercent = (xp / nextLevelXp) * 100;

  return (
    <div className="hud-container" style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      fontFamily: 'sans-serif',
      color: 'white',
      padding: '20px',
      boxSizing: 'border-box',
      direction: 'rtl'
    }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Level & XP */}
        <div style={{ width: '30%' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {uiData.common.level}: {level}
            </div>
            <div style={{ 
                width: '100%', 
                height: '10px', 
                background: '#444', 
                border: '2px solid white',
                marginTop: '5px'
            }}>
                <div style={{ 
                    width: `${xpPercent}%`, 
                    height: '100%', 
                    background: '#4f4',
                    transition: 'width 0.2s'
                }} />
            </div>
        </div>

        {/* Timer */}
        <div style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'monospace' }}>
            {minutes}:{seconds}
        </div>

        {/* Gold */}
        <div style={{ width: '30%', textAlign: 'left', fontSize: '24px', color: 'gold' }}>
            {uiData.common.gold}: {gold}
        </div>
      </div>

      {/* Health Bar */}
      <div style={{ 
          position: 'absolute', 
          bottom: '20px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          width: '400px',
          height: '20px',
          background: '#444',
          border: '2px solid white'
      }}>
          <div style={{ 
              width: `${healthPercent}%`, 
              height: '100%', 
              background: '#f44',
              transition: 'width 0.2s'
          }} />
          <div style={{ 
              position: 'absolute', 
              top: '-25px', 
              width: '100%', 
              textAlign: 'center',
              fontWeight: 'bold'
          }}>
              {Math.ceil(currentHealth)} / {playerStats.maxHealth}
          </div>
      </div>

      {/* Weapons List */}
      <div style={{
          position: 'absolute',
          top: '100px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
      }}>
          {activeWeapons.map((weaponId) => (
             <div key={weaponId} style={{ 
                 width: '40px', 
                 height: '40px', 
                 background: '#333', 
                 border: '1px solid white',
                 display: 'flex',
                 justifyContent: 'center',
                 alignItems: 'center'
             }}>
                 {/* Placeholder for weapon icon */}
                 <span style={{ fontSize: '10px' }}>{weaponId.substring(0, 2)}</span>
             </div> 
          ))}
      </div>

    </div>
  );
};

