import Phaser from "phaser";
import type { Vector2Like } from "../types";
import { PHASER_INPUT } from "../config";

export class TouchJoystick {
  private base: Phaser.GameObjects.Arc;
  private knob: Phaser.GameObjects.Arc;
  private vector: Vector2Like = { x: 0, y: 0 };
  private activePointerId: number | null = null;
  private visible = false;

  constructor(private scene: Phaser.Scene) {
    const margin = PHASER_INPUT.JOYSTICK_MARGIN;
    this.base = scene.add.circle(margin, scene.scale.height - margin, PHASER_INPUT.JOYSTICK_BASE_RADIUS, 0x333333, 0.35);
    this.knob = scene.add.circle(margin, scene.scale.height - margin, PHASER_INPUT.JOYSTICK_KNOB_RADIUS, 0x777777, 0.6);
    this.base.setScrollFactor(0).setDepth(1000).setVisible(false);
    this.knob.setScrollFactor(0).setDepth(1001).setVisible(false);

    scene.scale.on("resize", this.handleResize);
    scene.input.on("pointerdown", this.onPointerDown);
    scene.input.on("pointermove", this.onPointerMove);
    scene.input.on("pointerup", this.onPointerUp);
    scene.input.on("pointerupoutside", this.onPointerUp);
  }

  destroy(): void {
    this.scene.input.off("pointerdown", this.onPointerDown);
    this.scene.input.off("pointermove", this.onPointerMove);
    this.scene.input.off("pointerup", this.onPointerUp);
    this.scene.input.off("pointerupoutside", this.onPointerUp);
    this.scene.scale.off("resize", this.handleResize);
    this.base.destroy();
    this.knob.destroy();
  }

  isVisible(): boolean {
    return this.visible;
  }

  getVector(): Vector2Like {
    return this.vector;
  }

  // Arrow-function properties so `this` is always the instance, making them
  // safe to pass directly to Phaser's event emitter without a context arg.
  private readonly onPointerDown = (pointer: Phaser.Input.Pointer): void => {
    if (!pointer.wasTouch) return;
    if (this.activePointerId !== null) return;
    this.activePointerId = pointer.id;
    this.visible = true;
    this.base.setVisible(true);
    this.knob.setVisible(true);
    this.updateKnob(pointer.x, pointer.y);
  };

  private readonly onPointerMove = (pointer: Phaser.Input.Pointer): void => {
    if (this.activePointerId !== pointer.id) return;
    this.updateKnob(pointer.x, pointer.y);
  };

  private readonly onPointerUp = (pointer: Phaser.Input.Pointer): void => {
    if (this.activePointerId !== pointer.id) return;
    this.activePointerId = null;
    this.vector = { x: 0, y: 0 };
    this.visible = false;
    this.base.setVisible(false);
    this.knob.setVisible(false);
    this.knob.setPosition(this.base.x, this.base.y);
  };

  private readonly handleResize = (gameSize: Phaser.Structs.Size): void => {
    const margin = PHASER_INPUT.JOYSTICK_MARGIN;
    this.base.setPosition(margin, gameSize.height - margin);
    this.knob.setPosition(margin, gameSize.height - margin);
  };

  private updateKnob(worldX: number, worldY: number): void {
    const dx = worldX - this.base.x;
    const dy = worldY - this.base.y;
    const len = Math.hypot(dx, dy);
    const max = PHASER_INPUT.JOYSTICK_BASE_RADIUS;

    const clamped = len > max ? max / len : 1;
    const cx = dx * clamped;
    const cy = dy * clamped;
    this.knob.setPosition(this.base.x + cx, this.base.y + cy);

    const normalizedX = Phaser.Math.Clamp(cx / max, -1, 1);
    const normalizedY = Phaser.Math.Clamp(cy / max, -1, 1);
    this.vector = {
      x: Math.abs(normalizedX) < PHASER_INPUT.JOYSTICK_DEAD_ZONE ? 0 : normalizedX,
      y: Math.abs(normalizedY) < PHASER_INPUT.JOYSTICK_DEAD_ZONE ? 0 : -normalizedY,
    };
  }
}
