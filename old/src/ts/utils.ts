 

// Math utilities
export const MathUtils = {
  lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  },
  clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  },
  distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },
  angle(x1: number, y1: number, x2: number, y2: number): number {
    return Math.atan2(y2 - y1, x2 - x1);
  },
  normalizeAngle(angle: number): number {
    while (angle < 0) angle += Math.PI * 2;
    while (angle >= Math.PI * 2) angle -= Math.PI * 2;
    return angle;
  },
  random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  },
  randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  },
  pointInCircle(px: number, py: number, cx: number, cy: number, radius: number): boolean {
    return this.distance(px, py, cx, cy) <= radius;
  },
  circlesOverlap(
    x1: number,
    y1: number,
    r1: number,
    x2: number,
    y2: number,
    r2: number
  ): boolean {
    return this.distance(x1, y1, x2, y2) <= r1 + r2;
  },
};

// Vector utilities
export class Vector2 {
  x: number;
  y: number;
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  static from(obj: { x: number; y: number }): Vector2 {
    return new Vector2(obj.x, obj.y);
  }
  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }
  set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }
  add(v: Vector2): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }
  subtract(v: Vector2): this {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }
  multiply(s: number): this {
    this.x *= s;
    this.y *= s;
    return this;
  }
  divide(s: number): this {
    this.x /= s;
    this.y /= s;
    return this;
  }
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  normalize(): this {
    const mag = this.magnitude();
    if (mag > 0) this.divide(mag);
    return this;
  }
  distance(v: Vector2): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  angle(): number {
    return Math.atan2(this.y, this.x);
  }
  static add(v1: Vector2, v2: Vector2): Vector2 {
    return new Vector2(v1.x + v2.x, v1.y + v2.y);
  }
  static subtract(v1: Vector2, v2: Vector2): Vector2 {
    return new Vector2(v1.x - v2.x, v1.y - v2.y);
  }
  static multiply(v: Vector2, s: number): Vector2 {
    return new Vector2(v.x * s, v.y * s);
  }
  static distance(v1: Vector2, v2: Vector2): number {
    return v1.distance(v2);
  }
  static fromAngle(angle: number, magnitude = 1): Vector2 {
    return new Vector2(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
  }
}

// Time utilities
export const TimeUtils = {
  deltaTime: 0,
  lastTime: 0,
  totalTime: 0,
  update(): void {
    const now = performance.now();
    this.deltaTime = Math.min((now - this.lastTime) / 1000, 1 / 30);
    this.totalTime += this.deltaTime;
    this.lastTime = now;
  },
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },
};

// Color utilities
export const ColorUtils = {
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
      : null;
  },
  rgbToHex(r: number, g: number, b: number): string {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },
  lerpColor(color1: string, color2: string, t: number): string {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    if (!c1 || !c2) return color1;
    const r = Math.round(MathUtils.lerp(c1.r, c2.r, t));
    const g = Math.round(MathUtils.lerp(c1.g, c2.g, t));
    const b = Math.round(MathUtils.lerp(c1.b, c2.b, t));
    return this.rgbToHex(r, g, b);
  },
  addAlpha(color: string, alpha: number): string {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  },
};

// UI coordinate utilities
export const UIUtils = {
  relativeToScreen(
    relX: number,
    relY: number,
    containerWidth: number = window.innerWidth,
    containerHeight: number = window.innerHeight
  ): { x: number; y: number } {
    return { x: relX * containerWidth, y: relY * containerHeight };
  },
  screenToRelative(
    screenX: number,
    screenY: number,
    containerWidth: number = window.innerWidth,
    containerHeight: number = window.innerHeight
  ): { x: number; y: number } {
    return { x: screenX / containerWidth, y: screenY / containerHeight };
  },
  getAnchorOffset(
    anchor: string,
    width: number,
    height: number
  ): { x: number; y: number } {
    const offsets: Record<string, { x: number; y: number }> = {
      center: { x: -width / 2, y: -height / 2 },
      center_left: { x: 0, y: -height / 2 },
      center_right: { x: -width, y: -height / 2 },
      top_left: { x: 0, y: 0 },
      top_center: { x: -width / 2, y: 0 },
      top_right: { x: -width, y: 0 },
      bottom_left: { x: 0, y: -height },
      bottom_center: { x: -width / 2, y: -height },
      bottom_right: { x: -width, y: -height },
    };
    return offsets[anchor] || offsets['center'];
  },
};

export class Tween {
  time = 0;
  completed = false;
  constructor(
    public from: number,
    public to: number,
    public duration: number,
    public onUpdate: (value: number) => void,
    public onComplete: (() => void) | null = null,
    public easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce' = 'linear'
  ) {}
  update(deltaTime: number): boolean {
    if (this.completed) return false;
    this.time += deltaTime;
    const progress = MathUtils.clamp(this.time / this.duration, 0, 1);
    const eased = this.applyEasing(progress);
    this.onUpdate(MathUtils.lerp(this.from, this.to, eased));
    if (progress >= 1) {
      this.completed = true;
      this.onComplete?.();
      return false;
    }
    return true;
  }
  private applyEasing(t: number): number {
    switch (this.easing) {
      case 'easeIn':
        return t * t;
      case 'easeOut':
        return 1 - (1 - t) * (1 - t);
      case 'easeInOut':
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      case 'bounce':
        return 1 - Math.abs(Math.sin(((13 * Math.PI) / 2) * t)) * Math.pow(2, -10 * t);
      default:
        return t;
    }
  }
}

export const TweenManager = {
  tweens: [] as Tween[],
  add(tween: Tween): Tween {
    this.tweens.push(tween);
    return tween;
  },
  update(deltaTime: number): void {
    this.tweens = this.tweens.filter((t) => t.update(deltaTime));
  },
  clear(): void {
    this.tweens = [];
  },
  to(
    from: number,
    to: number,
    duration: number,
    onUpdate: (value: number) => void,
    onComplete: (() => void) | null = null,
    easing: Tween['easing'] = 'linear'
  ): Tween {
    const tween = new Tween(from, to, duration, onUpdate, onComplete, easing);
    this.add(tween);
    return tween;
  },
};

export const ScreenEffects = {
  shakeTime: 0,
  shakeIntensity: 0,
  maxIntensity: 10,
  shake(intensity = 5, duration = 0.1): void {
    this.shakeIntensity = Math.min(intensity, this.maxIntensity);
    this.shakeTime = duration;
  },
  update(deltaTime: number): void {
    if (this.shakeTime > 0) {
      this.shakeTime -= deltaTime;
      if (this.shakeTime <= 0) this.shakeIntensity = 0;
    }
  },
  getShakeOffset(): { x: number; y: number } {
    if (this.shakeTime <= 0) return { x: 0, y: 0 };
    return { x: (Math.random() - 0.5) * this.shakeIntensity, y: (Math.random() - 0.5) * this.shakeIntensity };
  },
};

export const Performance = {
  frameCount: 0,
  fps: 0,
  fpsUpdateTime: 0,
  update(deltaTime: number): void {
    this.frameCount++;
    this.fpsUpdateTime += deltaTime;
    if (this.fpsUpdateTime >= 1) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = 0;
    }
  },
  getFPS(): number {
    return this.fps;
  },
};

export const Debug = {
  enabled: false,
  toggle(): void {
    this.enabled = !this.enabled;
    const debugInfo = document.getElementById('debugInfo');
    if (debugInfo) debugInfo.classList.toggle('debug-hidden', !this.enabled);
  },
  log: (...args: any[]): void => {
    if (Debug.enabled) console.log(...args);
  },
  updateDisplay(gameState?: any): void {
    if (!this.enabled) return;
    const debugInfo = document.getElementById('debugInfo');
    if (!debugInfo) return;
    debugInfo.innerHTML = `
      <div>FPS: ${Performance.getFPS()}</div>
      <div>Delta: ${(TimeUtils.deltaTime * 1000).toFixed(2)}ms</div>
      <div>Time: ${TimeUtils.formatTime(TimeUtils.totalTime)}</div>
      ${
        gameState
          ? `<div>State: ${gameState.currentScreen}</div>
             <div>Entities: ${gameState.entities ? gameState.entities.length : 0}</div>
             <div>Player Pos: ${
               gameState.player ? `(${Math.round(gameState.player.x)}, ${Math.round(gameState.player.y)})` : 'N/A'
             }</div>`
          : ''
      }
    `;
  },
};

// Attach to window for legacy JS compatibility during migration
declare global {
  interface Window {
    MathUtils: typeof MathUtils;
    Vector2: typeof Vector2;
    TimeUtils: typeof TimeUtils;
    ColorUtils: typeof ColorUtils;
    UIUtils: typeof UIUtils;
    Tween: typeof Tween;
    TweenManager: typeof TweenManager;
    ScreenEffects: typeof ScreenEffects;
    Performance: typeof Performance;
    Debug: typeof Debug;
  }
}

(window as any).MathUtils = MathUtils;
(window as any).Vector2 = Vector2;
(window as any).TimeUtils = TimeUtils;
(window as any).ColorUtils = ColorUtils;
(window as any).UIUtils = UIUtils;
(window as any).Tween = Tween;
(window as any).TweenManager = TweenManager;
(window as any).ScreenEffects = ScreenEffects;
(window as any).Performance = Performance;
(window as any).Debug = Debug;



