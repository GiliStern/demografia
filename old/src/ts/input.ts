import { Vector2, MathUtils } from './utils';
import { GAME_CONFIG } from './config';

class InputManagerTS {
  private keys: Record<string, boolean> = {};
  private mousePosition = { x: 0, y: 0 };
  private mouseButtons: Record<number, boolean> = {};
  private touches: Record<number, { x: number; y: number; startX: number; startY: number; identifier?: number }> = {};
  private gamepadState: Gamepad | null = null;

  constructor() {
    this.bindEvents();
  }

  private bindEvents(): void {
    // Keyboard
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (this.isGameKey(e.code)) e.preventDefault();

      if (e.code === 'F3') {
        e.preventDefault();
        (window as any).Debug?.toggle?.();
      }
      if (e.code === 'F11') {
        e.preventDefault();
        this.toggleFullscreen();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Mouse
    document.addEventListener('mousemove', (e) => {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
    });
    document.addEventListener('mousedown', (e) => {
      this.mouseButtons[e.button] = true;
    });
    document.addEventListener('mouseup', (e) => {
      this.mouseButtons[e.button] = false;
    });

    // Touch
    document.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        for (const touch of Array.from(e.touches)) {
          this.touches[touch.identifier] = {
            x: touch.clientX,
            y: touch.clientY,
            startX: touch.clientX,
            startY: touch.clientY,
            identifier: touch.identifier,
          };
        }
      },
      { passive: false }
    );

    document.addEventListener(
      'touchmove',
      (e) => {
        e.preventDefault();
        for (const touch of Array.from(e.touches)) {
          const t = this.touches[touch.identifier];
          if (t) {
            t.x = touch.clientX;
            t.y = touch.clientY;
          }
        }
      },
      { passive: false }
    );

    document.addEventListener(
      'touchend',
      (e) => {
        e.preventDefault();
        for (const touch of Array.from(e.changedTouches)) {
          delete this.touches[touch.identifier];
        }
      },
      { passive: false }
    );

    // Gamepad
    window.addEventListener('gamepadconnected', (e) => {
      console.log('Gamepad connected:', (e as GamepadEvent).gamepad.id);
    });
    window.addEventListener('gamepaddisconnected', (e) => {
      console.log('Gamepad disconnected:', (e as GamepadEvent).gamepad.id);
    });

    // Block context menu
    document.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private isGameKey(code: string): boolean {
    const gameKeys = [
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'KeyW',
      'KeyA',
      'KeyS',
      'KeyD',
      'Space',
      'Enter',
      'Escape',
    ];
    return gameKeys.includes(code);
  }

  private toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => undefined);
    } else {
      document.exitFullscreen();
    }
  }

  // Public API
  isKeyPressed(key: string): boolean {
    return Boolean(this.keys[key]);
  }

  isKeyJustPressed(key: string): boolean {
    return Boolean(this.keys[key]);
  }

  getMousePosition(): { x: number; y: number } {
    return { ...this.mousePosition };
  }

  isMouseButtonPressed(button = 0): boolean {
    return Boolean(this.mouseButtons[button]);
  }

  getTouches(): Array<{ x: number; y: number; startX: number; startY: number; identifier?: number }> {
    return Object.values(this.touches);
  }

  getPrimaryTouch(): { x: number; y: number; startX: number; startY: number; identifier?: number } | null {
    const touches = this.getTouches();
    return touches.length > 0 ? touches[0] : null;
  }

  getMovementInput(): Vector2 {
    let x = 0;
    let y = 0;

    // Keyboard
    if (this.isKeyPressed('KeyA') || this.isKeyPressed('ArrowLeft')) x -= 1;
    if (this.isKeyPressed('KeyD') || this.isKeyPressed('ArrowRight')) x += 1;
    if (this.isKeyPressed('KeyW') || this.isKeyPressed('ArrowUp')) y -= 1;
    if (this.isKeyPressed('KeyS') || this.isKeyPressed('ArrowDown')) y += 1;

    // Gamepad
    const gamepad = this.getGamepad();
    if (gamepad) {
      const leftStick = this.getGamepadStick(gamepad, 0);
      if (leftStick.magnitude > GAME_CONFIG.INPUT.DEADZONE) {
        x = leftStick.x;
        y = leftStick.y;
      }
    }

    // Touch: relative to canvas center
    const touch = this.getPrimaryTouch();
    if (touch && this.isInGameplay()) {
      const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement | null;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = touch.x - centerX;
        const deltaY = touch.y - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (distance > 50) {
          x = MathUtils.clamp(deltaX / (rect.width / 4), -1, 1);
          y = MathUtils.clamp(deltaY / (rect.height / 4), -1, 1);
        }
      }
    }

    // Normalize
    const magnitude = Math.sqrt(x * x + y * y);
    if (magnitude > 1) {
      x /= magnitude;
      y /= magnitude;
    }
    return new Vector2(x, y);
  }

  getGamepad(): Gamepad | null {
    const pads = navigator.getGamepads?.() || [];
    for (const pad of pads) if (pad && pad.connected) return pad;
    return null;
  }

  getGamepadStick(gamepad: Gamepad, stickIndex: number): { x: number; y: number; magnitude: number } {
    const xIndex = stickIndex * 2;
    const yIndex = stickIndex * 2 + 1;
    const x = gamepad.axes[xIndex] || 0;
    const y = gamepad.axes[yIndex] || 0;
    return {
      x: Math.abs(x) > GAME_CONFIG.INPUT.DEADZONE ? x : 0,
      y: Math.abs(y) > GAME_CONFIG.INPUT.DEADZONE ? y : 0,
      magnitude: Math.sqrt(x * x + y * y),
    };
  }

  isGamepadButtonPressed(gamepad: Gamepad, buttonIndex: number): boolean {
    const button = gamepad.buttons[buttonIndex];
    return Boolean(button && button.pressed);
  }

  isActionPressed(action: 'select' | 'confirm' | 'cancel' | 'back' | 'pause'): boolean {
    switch (action) {
      case 'select':
      case 'confirm':
        return (
          this.isKeyPressed('Enter') ||
          this.isKeyPressed('Space') ||
          this.isMouseButtonPressed(0) ||
          this.getTouches().length > 0
        );
      case 'cancel':
      case 'back':
        return this.isKeyPressed('Escape') || this.isMouseButtonPressed(1);
      case 'pause':
        return this.isKeyPressed('Escape') || this.isKeyPressed('KeyP');
      default:
        return false;
    }
  }

  isInGameplay(): boolean {
    return Boolean((window as any).gameState && (window as any).gameState.currentScreen === 'gameplay');
  }

  update(): void {
    this.gamepadState = this.getGamepad();
  }

  destroy(): void {
    this.keys = {};
    this.mouseButtons = {};
    this.touches = {};
  }
}

class TouchControlsTS {
  private canvas: HTMLCanvasElement | null;
  private virtualStick: | null | {
    center: { x: number; y: number };
    radius: number;
    knobRadius: number;
    active: boolean;
    touchId: number | null;
    value: { x: number; y: number };
  } = null;
  private actionButtons: Array<{
    x: number; y: number; radius: number; action: string; label: string; active: boolean; touchId: number | null;
  }> = [];
  private enabled = false;

  constructor(canvas: HTMLCanvasElement | null) {
    this.canvas = canvas;
    this.setupVirtualControls();
  }

  private setupVirtualControls(): void {
    this.enabled = 'ontouchstart' in window || (navigator as any).maxTouchPoints > 0;
    if (!this.enabled) return;
    this.virtualStick = {
      center: { x: 100, y: window.innerHeight - 100 },
      radius: 50,
      knobRadius: 20,
      active: false,
      touchId: null,
      value: { x: 0, y: 0 },
    };
    this.actionButtons = [
      { x: window.innerWidth - 80, y: window.innerHeight - 80, radius: 30, action: 'pause', label: '⏸️', active: false, touchId: null },
    ];
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.enabled) return;
    ctx.save();
    if (this.virtualStick) {
      const stick = this.virtualStick;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(stick.center.x, stick.center.y, stick.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      const knobX = stick.center.x + stick.value.x * stick.radius * 0.8;
      const knobY = stick.center.y + stick.value.y * stick.radius * 0.8;
      ctx.fillStyle = stick.active ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(knobX, knobY, stick.knobRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const button of this.actionButtons) {
      ctx.fillStyle = button.active ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(button.x, button.y, button.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#000';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(button.label, button.x, button.y);
    }
    ctx.restore();
  }

  handleTouch(
    touches: Array<{ x: number; y: number; identifier?: number }>,
    action: 'start' | 'move' | 'end'
  ): void {
    if (!this.enabled) return;
    for (const touch of touches) {
      if (action === 'start' || action === 'move') {
        if (this.virtualStick && !this.virtualStick.active) {
          const distance = MathUtils.distance(
            touch.x,
            touch.y,
            this.virtualStick.center.x,
            this.virtualStick.center.y
          );
          if (distance <= this.virtualStick.radius) {
            this.virtualStick.active = true;
            this.virtualStick.touchId = touch.identifier ?? null;
          }
        }
        if (
          this.virtualStick &&
          this.virtualStick.active &&
          this.virtualStick.touchId === (touch.identifier ?? null)
        ) {
          const deltaX = touch.x - this.virtualStick.center.x;
          const deltaY = touch.y - this.virtualStick.center.y;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          if (distance <= this.virtualStick.radius) {
            this.virtualStick.value.x = deltaX / this.virtualStick.radius;
            this.virtualStick.value.y = deltaY / this.virtualStick.radius;
          } else {
            this.virtualStick.value.x = deltaX / distance;
            this.virtualStick.value.y = deltaY / distance;
          }
        }
        for (const button of this.actionButtons) {
          if (!button.active) {
            const distance = MathUtils.distance(touch.x, touch.y, button.x, button.y);
            if (distance <= button.radius) {
              button.active = true;
              button.touchId = touch.identifier ?? null;
              this.triggerAction(button.action);
            }
          }
        }
      }
      if (action === 'end') {
        if (this.virtualStick && this.virtualStick.touchId === (touch.identifier ?? null)) {
          this.virtualStick.active = false;
          this.virtualStick.touchId = null;
          this.virtualStick.value.x = 0;
          this.virtualStick.value.y = 0;
        }
        for (const button of this.actionButtons) {
          if (button.touchId === (touch.identifier ?? null)) {
            button.active = false;
            button.touchId = null;
          }
        }
      }
    }
  }

  triggerAction(action: string): void {
    window.dispatchEvent(new CustomEvent('virtualAction', { detail: { action } }));
  }

  getStickValue(): { x: number; y: number } {
    return this.virtualStick ? { ...this.virtualStick.value } : { x: 0, y: 0 };
  }
}

declare global {
  interface Window {
    InputManager: typeof InputManagerTS;
    TouchControls: typeof TouchControlsTS;
  }
}

(window as any).InputManager = InputManagerTS;
(window as any).TouchControls = TouchControlsTS;

export {};


