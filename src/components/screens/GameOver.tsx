import { useGameStore } from '../../store/gameStore';
import { UI_STRINGS } from '../../data/config/ui';

export const GameOver = () => {
  const { runTimer, gold, killCount, endGame } = useGameStore();

  const minutes = Math.floor(runTimer / 60).toString().padStart(2, '0');
  const seconds = Math.floor(runTimer % 60).toString().padStart(2, '0');

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'rgba(50,0,0,0.9)',
      color: 'white',
      fontFamily: 'sans-serif',
      direction: 'rtl',
      zIndex: 100
    }}>
      <h1 style={{ fontSize: '64px', marginBottom: '20px', color: '#ff4444' }}>
        הפסדת!
      </h1>
      
      <div style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center' }}>
        <div>{UI_STRINGS.common.time}: {minutes}:{seconds}</div>
        <div>{UI_STRINGS.common.gold}: {gold}</div>
        <div>הריגות: {killCount}</div>
      </div>

      <button 
        onClick={() => window.location.reload()} 
        style={{
          padding: '15px 40px',
          fontSize: '24px',
          background: '#444',
          color: 'white',
          border: '2px solid white',
          cursor: 'pointer',
          borderRadius: '8px'
        }}
      >
        {UI_STRINGS.common.main_menu}
      </button>
    </div>
  );
};

