// Input handling system

class InputManager {
  constructor() {
    this.keys = {};
    this.mousePosition = { x: 0, y: 0 };
    this.mouseButtons = {};
    this.touches = {};
    this.gamepadState = null;

    this.bindEvents();
  }

  bindEvents() {
    // Keyboard events
    document.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;

      // Prevent default for game keys
      if (this.isGameKey(e.code)) {
        e.preventDefault();
      }

      // Debug toggle
      if (e.code === "F3") {
        e.preventDefault();
        Debug.toggle();
      }

      // Fullscreen toggle
      if (e.code === "F11") {
        e.preventDefault();
        this.toggleFullscreen();
      }
    });

    document.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    // Mouse events
    document.addEventListener("mousemove", (e) => {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
    });

    document.addEventListener("mousedown", (e) => {
      this.mouseButtons[e.button] = true;
    });

    document.addEventListener("mouseup", (e) => {
      this.mouseButtons[e.button] = false;
    });

    // Touch events for mobile
    document.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        for (let touch of e.touches) {
          this.touches[touch.identifier] = {
            x: touch.clientX,
            y: touch.clientY,
            startX: touch.clientX,
            startY: touch.clientY,
          };
        }
      },
      { passive: false }
    );

    document.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        for (let touch of e.touches) {
          if (this.touches[touch.identifier]) {
            this.touches[touch.identifier].x = touch.clientX;
            this.touches[touch.identifier].y = touch.clientY;
          }
        }
      },
      { passive: false }
    );

    document.addEventListener(
      "touchend",
      (e) => {
        e.preventDefault();
        for (let touch of e.changedTouches) {
          delete this.touches[touch.identifier];
        }
      },
      { passive: false }
    );

    // Gamepad support
    window.addEventListener("gamepadconnected", (e) => {
      console.log("Gamepad connected:", e.gamepad.id);
    });

    window.addEventListener("gamepaddisconnected", (e) => {
      console.log("Gamepad disconnected:", e.gamepad.id);
    });

    // Prevent context menu
    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  }

  isGameKey(code) {
    const gameKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
      "Space",
      "Enter",
      "Escape",
    ];
    return gameKeys.includes(code);
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.log("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  // Keyboard input
  isKeyPressed(key) {
    return this.keys[key] || false;
  }

  isKeyJustPressed(key) {
    // This would need frame-based tracking for proper implementation
    return this.keys[key] || false;
  }

  // Mouse input
  getMousePosition() {
    return { ...this.mousePosition };
  }

  isMouseButtonPressed(button = 0) {
    return this.mouseButtons[button] || false;
  }

  // Touch input
  getTouches() {
    return Object.values(this.touches);
  }

  getPrimaryTouch() {
    const touches = this.getTouches();
    return touches.length > 0 ? touches[0] : null;
  }

  // Movement input (keyboard, gamepad, or virtual stick)
  getMovementInput() {
    let x = 0;
    let y = 0;

    // Keyboard input
    if (this.isKeyPressed("KeyA") || this.isKeyPressed("ArrowLeft")) {
      x -= 1;
    }
    if (this.isKeyPressed("KeyD") || this.isKeyPressed("ArrowRight")) {
      x += 1;
    }
    if (this.isKeyPressed("KeyW") || this.isKeyPressed("ArrowUp")) {
      y -= 1;
    }
    if (this.isKeyPressed("KeyS") || this.isKeyPressed("ArrowDown")) {
      y += 1;
    }

    // Gamepad input
    const gamepad = this.getGamepad();
    if (gamepad) {
      const leftStick = this.getGamepadStick(gamepad, 0);
      if (leftStick.magnitude > GAME_CONFIG.INPUT.DEADZONE) {
        x = leftStick.x;
        y = leftStick.y;
      }
    }

    // Touch input (virtual stick or screen touch)
    const touch = this.getPrimaryTouch();
    if (touch && this.isInGameplay()) {
      // Simple touch movement - touch relative to center moves player
      const canvas = document.getElementById("gameCanvas");
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = touch.x - centerX;
      const deltaY = touch.y - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > 50) {
        // Minimum distance to register movement
        x = deltaX / (rect.width / 4); // Scale to reasonable movement
        y = deltaY / (rect.height / 4);

        // Clamp to prevent too fast movement
        x = MathUtils.clamp(x, -1, 1);
        y = MathUtils.clamp(y, -1, 1);
      }
    }

    // Normalize diagonal movement
    const magnitude = Math.sqrt(x * x + y * y);
    if (magnitude > 1) {
      x /= magnitude;
      y /= magnitude;
    }

    // Debug log movement input
    // Noisy debug removed

    return new Vector2(x, y);
  }

  // Gamepad support
  getGamepad() {
    const gamepads = navigator.getGamepads();
    for (let gamepad of gamepads) {
      if (gamepad && gamepad.connected) {
        return gamepad;
      }
    }
    return null;
  }

  getGamepadStick(gamepad, stickIndex) {
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

  isGamepadButtonPressed(gamepad, buttonIndex) {
    return gamepad.buttons[buttonIndex] && gamepad.buttons[buttonIndex].pressed;
  }

  // Action inputs
  isActionPressed(action) {
    switch (action) {
      case "select":
      case "confirm":
        return (
          this.isKeyPressed("Enter") ||
          this.isKeyPressed("Space") ||
          this.isMouseButtonPressed(0) ||
          this.getTouches().length > 0
        );

      case "cancel":
      case "back":
        return this.isKeyPressed("Escape") || this.isMouseButtonPressed(1);

      case "pause":
        return this.isKeyPressed("Escape") || this.isKeyPressed("KeyP");

      default:
        return false;
    }
  }

  // Helper to check if we're in gameplay (vs menu)
  isInGameplay() {
    // This will be set by the game state manager
    return window.gameState && window.gameState.currentScreen === "gameplay";
  }

  // Update method to be called each frame
  update() {
    // Update gamepad state
    this.gamepadState = this.getGamepad();

    // Here we could track "just pressed" states by comparing with previous frame
    // For now, we'll keep it simple
  }

  // Clean up
  destroy() {
    // Remove event listeners if needed
    this.keys = {};
    this.mouseButtons = {};
    this.touches = {};
  }
}

// Virtual touch controls for mobile
class TouchControls {
  constructor(canvas) {
    this.canvas = canvas;
    this.virtualStick = null;
    this.actionButtons = [];
    this.enabled = false;

    this.setupVirtualControls();
  }

  setupVirtualControls() {
    // Check if we're on a touch device
    this.enabled = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    if (!this.enabled) return;

    // Create virtual stick
    this.virtualStick = {
      center: { x: 100, y: window.innerHeight - 100 },
      radius: 50,
      knobRadius: 20,
      active: false,
      touchId: null,
      value: { x: 0, y: 0 },
    };

    // Create action buttons
    this.actionButtons = [
      {
        x: window.innerWidth - 80,
        y: window.innerHeight - 80,
        radius: 30,
        action: "pause",
        label: "⏸️",
        active: false,
        touchId: null,
      },
    ];
  }

  render(ctx) {
    if (!this.enabled) return;

    ctx.save();

    // Render virtual stick
    if (this.virtualStick) {
      const stick = this.virtualStick;

      // Stick base
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.beginPath();
      ctx.arc(stick.center.x, stick.center.y, stick.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Stick knob
      const knobX = stick.center.x + stick.value.x * stick.radius * 0.8;
      const knobY = stick.center.y + stick.value.y * stick.radius * 0.8;

      ctx.fillStyle = stick.active
        ? "rgba(255, 255, 255, 0.8)"
        : "rgba(255, 255, 255, 0.5)";
      ctx.beginPath();
      ctx.arc(knobX, knobY, stick.knobRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render action buttons
    for (const button of this.actionButtons) {
      ctx.fillStyle = button.active
        ? "rgba(255, 255, 255, 0.8)"
        : "rgba(255, 255, 255, 0.5)";
      ctx.beginPath();
      ctx.arc(button.x, button.y, button.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Button label
      ctx.fillStyle = "#000";
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(button.label, button.x, button.y);
    }

    ctx.restore();
  }

  handleTouch(touches, action) {
    if (!this.enabled) return;

    for (const touch of touches) {
      if (action === "start" || action === "move") {
        // Check virtual stick
        if (this.virtualStick && !this.virtualStick.active) {
          const distance = MathUtils.distance(
            touch.x,
            touch.y,
            this.virtualStick.center.x,
            this.virtualStick.center.y
          );

          if (distance <= this.virtualStick.radius) {
            this.virtualStick.active = true;
            this.virtualStick.touchId = touch.identifier;
          }
        }

        // Update virtual stick value
        if (
          this.virtualStick &&
          this.virtualStick.active &&
          this.virtualStick.touchId === touch.identifier
        ) {
          const deltaX = touch.x - this.virtualStick.center.x;
          const deltaY = touch.y - this.virtualStick.center.y;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          if (distance <= this.virtualStick.radius) {
            this.virtualStick.value.x = deltaX / this.virtualStick.radius;
            this.virtualStick.value.y = deltaY / this.virtualStick.radius;
          } else {
            // Clamp to edge
            this.virtualStick.value.x = deltaX / distance;
            this.virtualStick.value.y = deltaY / distance;
          }
        }

        // Check action buttons
        for (const button of this.actionButtons) {
          if (!button.active) {
            const distance = MathUtils.distance(
              touch.x,
              touch.y,
              button.x,
              button.y
            );
            if (distance <= button.radius) {
              button.active = true;
              button.touchId = touch.identifier;

              // Trigger action
              this.triggerAction(button.action);
            }
          }
        }
      }

      if (action === "end") {
        // Release virtual stick
        if (
          this.virtualStick &&
          this.virtualStick.touchId === touch.identifier
        ) {
          this.virtualStick.active = false;
          this.virtualStick.touchId = null;
          this.virtualStick.value.x = 0;
          this.virtualStick.value.y = 0;
        }

        // Release action buttons
        for (const button of this.actionButtons) {
          if (button.touchId === touch.identifier) {
            button.active = false;
            button.touchId = null;
          }
        }
      }
    }
  }

  triggerAction(action) {
    // Emit custom events that the game can listen to
    window.dispatchEvent(
      new CustomEvent("virtualAction", { detail: { action } })
    );
  }

  getStickValue() {
    return this.virtualStick ? { ...this.virtualStick.value } : { x: 0, y: 0 };
  }
}

// Export input manager
window.InputManager = InputManager;
window.TouchControls = TouchControls;
