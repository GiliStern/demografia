import { useEffect, useRef } from 'react';

export const useKeyboardControls = () => {
  const inputRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const keys = new Set<string>();
    
    const handleKey = (e: KeyboardEvent, isDown: boolean) => {
      if (isDown) keys.add(e.key);
      else keys.delete(e.key);
      
      const up = keys.has('ArrowUp') || keys.has('w') || keys.has('W');
      const down = keys.has('ArrowDown') || keys.has('s') || keys.has('S');
      const left = keys.has('ArrowLeft') || keys.has('a') || keys.has('A');
      const right = keys.has('ArrowRight') || keys.has('d') || keys.has('D');
      
      inputRef.current = {
        x: (right ? 1 : 0) - (left ? 1 : 0),
        y: (up ? 1 : 0) - (down ? 1 : 0),
      };
    };

    const onKeyDown = (e: KeyboardEvent) => handleKey(e, true);
    const onKeyUp = (e: KeyboardEvent) => handleKey(e, false);

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  return inputRef;
};
