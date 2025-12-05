import { useGameStore } from '../../store/gameStore';
import uiData from '../../data/ui.json';

export const MainMenu = () => {
  const { startGame } = useGameStore();

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
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      fontFamily: 'sans-serif',
      direction: 'rtl',
      zIndex: 100
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '40px', color: '#61dafb' }}>
        דמוגרפיה
      </h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '300px' }}>
        <button 
          onClick={() => startGame('sruLik')}
          style={{
            padding: '15px',
            fontSize: '24px',
            background: '#444',
            color: 'white',
            border: '2px solid #666',
            cursor: 'pointer',
            borderRadius: '8px'
          }}
        >
          {uiData.menu.play}
        </button>

        <button 
          disabled
          style={{
            padding: '15px',
            fontSize: '24px',
            background: '#222',
            color: '#666',
            border: '2px solid #333',
            cursor: 'not-allowed',
            borderRadius: '8px'
          }}
        >
          {uiData.menu.meta_shop} ({uiData.common.locked})
        </button>

        <button 
          disabled
          style={{
            padding: '15px',
            fontSize: '24px',
            background: '#222',
            color: '#666',
            border: '2px solid #333',
            cursor: 'not-allowed',
            borderRadius: '8px'
          }}
        >
          {uiData.menu.settings} ({uiData.common.locked})
        </button>
      </div>

      <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: '#666' }}>
        {uiData.menu.version} 0.1.0
      </div>
    </div>
  );
};

