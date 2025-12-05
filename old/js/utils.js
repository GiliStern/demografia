// Utility functions for the game

// Math utilities
const MathUtils = {
  // Linear interpolation
  lerp(a, b, t) {
    return a + (b - a) * t;
  },

  // Clamp value between min and max
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  // Distance between two points
  distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // Angle between two points
  angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  },

  // Normalize angle to 0-2π
  normalizeAngle(angle) {
    while (angle < 0) angle += Math.PI * 2;
    while (angle >= Math.PI * 2) angle -= Math.PI * 2;
    return angle;
  },

  // Random number between min and max
  random(min, max) {
    return Math.random() * (max - min) + min;
  },

  // Random integer between min and max (inclusive)
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Random choice from array
  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  },

  // Check if point is in circle
  pointInCircle(px, py, cx, cy, radius) {
    return this.distance(px, py, cx, cy) <= radius;
  },

  // Check if two circles overlap
  circlesOverlap(x1, y1, r1, x2, y2, r2) {
    return this.distance(x1, y1, x2, y2) <= r1 + r2;
  },
};

// Vector utilities
class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  static from(obj) {
    return new Vector2(obj.x, obj.y);
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  multiply(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  divide(scalar) {
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const mag = this.magnitude();
    if (mag > 0) {
      this.divide(mag);
    }
    return this;
  }

  distance(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }

  static add(v1, v2) {
    return new Vector2(v1.x + v2.x, v1.y + v2.y);
  }

  static subtract(v1, v2) {
    return new Vector2(v1.x - v2.x, v1.y - v2.y);
  }

  static multiply(v, scalar) {
    return new Vector2(v.x * scalar, v.y * scalar);
  }

  static distance(v1, v2) {
    return v1.distance(v2);
  }

  static fromAngle(angle, magnitude = 1) {
    return new Vector2(
      Math.cos(angle) * magnitude,
      Math.sin(angle) * magnitude
    );
  }
}

// Time utilities
const TimeUtils = {
  deltaTime: 0,
  lastTime: 0,
  totalTime: 0,

  update() {
    const now = performance.now();
    this.deltaTime = Math.min((now - this.lastTime) / 1000, 1 / 30); // Cap at 30fps minimum
    this.totalTime += this.deltaTime;
    this.lastTime = now;
  },

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  },
};

// Color utilities
const ColorUtils = {
  // Convert hex to RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },

  // Convert RGB to hex
  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },

  // Interpolate between two colors
  lerpColor(color1, color2, t) {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    if (!c1 || !c2) return color1;

    const r = Math.round(MathUtils.lerp(c1.r, c2.r, t));
    const g = Math.round(MathUtils.lerp(c1.g, c2.g, t));
    const b = Math.round(MathUtils.lerp(c1.b, c2.b, t));

    return this.rgbToHex(r, g, b);
  },

  // Add alpha to color
  addAlpha(color, alpha) {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  },
};

// UI coordinate utilities
const UIUtils = {
  // Convert relative coordinates to screen coordinates
  relativeToScreen(
    relX,
    relY,
    containerWidth = window.innerWidth,
    containerHeight = window.innerHeight
  ) {
    return {
      x: relX * containerWidth,
      y: relY * containerHeight,
    };
  },

  // Convert screen coordinates to relative coordinates
  screenToRelative(
    screenX,
    screenY,
    containerWidth = window.innerWidth,
    containerHeight = window.innerHeight
  ) {
    return {
      x: screenX / containerWidth,
      y: screenY / containerHeight,
    };
  },

  // Get anchor offset for positioning
  getAnchorOffset(anchor, width, height) {
    const offsets = {
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

    return offsets[anchor] || offsets["center"];
  },
};

// Animation utilities
class Tween {
  constructor(
    from,
    to,
    duration,
    onUpdate,
    onComplete = null,
    easing = "linear"
  ) {
    this.from = from;
    this.to = to;
    this.duration = duration;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
    this.easing = easing;
    this.time = 0;
    this.completed = false;
  }

  update(deltaTime) {
    if (this.completed) return false;

    this.time += deltaTime;
    const progress = MathUtils.clamp(this.time / this.duration, 0, 1);
    const easedProgress = this.applyEasing(progress);

    const value = MathUtils.lerp(this.from, this.to, easedProgress);
    this.onUpdate(value);

    if (progress >= 1) {
      this.completed = true;
      if (this.onComplete) {
        this.onComplete();
      }
      return false;
    }

    return true;
  }

  applyEasing(t) {
    switch (this.easing) {
      case "easeIn":
        return t * t;
      case "easeOut":
        return 1 - (1 - t) * (1 - t);
      case "easeInOut":
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      case "bounce":
        return (
          1 -
          Math.abs(Math.sin(((13 * Math.PI) / 2) * t)) * Math.pow(2, -10 * t)
        );
      default:
        return t; // linear
    }
  }
}

// Tween manager
const TweenManager = {
  tweens: [],

  add(tween) {
    this.tweens.push(tween);
    return tween;
  },

  update(deltaTime) {
    this.tweens = this.tweens.filter((tween) => tween.update(deltaTime));
  },

  clear() {
    this.tweens = [];
  },

  // Helper functions to create common tweens
  to(from, to, duration, onUpdate, onComplete = null, easing = "linear") {
    const tween = new Tween(from, to, duration, onUpdate, onComplete, easing);
    this.add(tween);
    return tween;
  },
};

// Screen effects
const ScreenEffects = {
  shakeTime: 0,
  shakeIntensity: 0,
  maxIntensity: 10,

  shake(intensity = 5, duration = 0.1) {
    this.shakeIntensity = Math.min(intensity, this.maxIntensity);
    this.shakeTime = duration;
  },

  update(deltaTime) {
    if (this.shakeTime > 0) {
      this.shakeTime -= deltaTime;
      if (this.shakeTime <= 0) {
        this.shakeIntensity = 0;
      }
    }
  },

  getShakeOffset() {
    if (this.shakeTime <= 0) return { x: 0, y: 0 };

    return {
      x: (Math.random() - 0.5) * this.shakeIntensity,
      y: (Math.random() - 0.5) * this.shakeIntensity,
    };
  },
};

// Performance monitoring
const Performance = {
  frameCount: 0,
  fps: 0,
  fpsUpdateTime: 0,

  update(deltaTime) {
    this.frameCount++;
    this.fpsUpdateTime += deltaTime;

    if (this.fpsUpdateTime >= 1) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = 0;
    }
  },

  getFPS() {
    return this.fps;
  },
};

// Debug utilities
const Debug = {
  enabled: false,

  toggle() {
    this.enabled = !this.enabled;
    const debugInfo = document.getElementById("debugInfo");
    if (debugInfo) {
      debugInfo.classList.toggle("debug-hidden", !this.enabled);
    }
  },

  log(...args) {
    if (this.enabled) {
      console.log(...args);
    }
  },

  updateDisplay(gameState) {
    if (!this.enabled) return;

    const debugInfo = document.getElementById("debugInfo");
    if (!debugInfo) return;

    debugInfo.innerHTML = `
            <div>FPS: ${Performance.getFPS()}</div>
            <div>Delta: ${(TimeUtils.deltaTime * 1000).toFixed(2)}ms</div>
            <div>Time: ${TimeUtils.formatTime(TimeUtils.totalTime)}</div>
            ${
              gameState
                ? `
                <div>State: ${gameState.currentScreen}</div>
                <div>Entities: ${
                  gameState.entities ? gameState.entities.length : 0
                }</div>
                <div>Player Pos: ${
                  gameState.player
                    ? `(${Math.round(gameState.player.x)}, ${Math.round(
                        gameState.player.y
                      )})`
                    : "N/A"
                }</div>
            `
                : ""
            }
        `;
  },
};

// Export utilities
window.MathUtils = MathUtils;
window.Vector2 = Vector2;
window.TimeUtils = TimeUtils;
window.ColorUtils = ColorUtils;
window.UIUtils = UIUtils;
window.Tween = Tween;
window.TweenManager = TweenManager;
window.ScreenEffects = ScreenEffects;
window.Performance = Performance;
window.Debug = Debug;
