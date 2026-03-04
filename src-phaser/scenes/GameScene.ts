import Phaser from "phaser";
import { ENEMIES } from "@/data/config/enemies";
import { WEAPONS } from "@/data/config/weaponsConfig";
import { WAVES, WaveId } from "@/data/config/waves";
import { CHARACTERS } from "@/data/config/characters";
import { VIEWPORT_CONFIG } from "@/data/config/viewportConfig";
import { sprites } from "@/assets/assetPaths";
import { buildVelocity, createDirectionalProjectiles, createSpreadProjectiles } from "@/utils/weapons/weaponProjectiles";
import { buildWeaponRuntime } from "@/utils/weapons/weaponLifecycle";
import { nearestEnemyDirection, radialDirections, reflectInBounds } from "@/utils/weapons/weaponMath";
import { KeyboardInput } from "../core/input/KeyboardInput";
import { TouchJoystick } from "../core/input/TouchJoystick";
import { buildEnemyId, runtimeState, weaponBehaviorType } from "../core/state/RuntimeState";
import type { PhaserEnemy, Vector2Like } from "../core/types";
import { ANIMATIONS_BY_CATEGORY } from "@/data/config/animationMaps";
import { AnimationCategory, AnimationType, AnimationVariant, PauseReason } from "@/types";
import { buildSheetKey } from "../core/rendering/spriteSheet";
import { PHASER_BG, PHASER_GAMEPLAY, PHASER_SPRITES } from "../core/config";

export class GameScene extends Phaser.Scene {
  static key = "GameScene";

  private keyboardInput!: KeyboardInput;
  private joystick!: TouchJoystick;
  private playerSprite!: Phaser.GameObjects.Sprite;
  private background!: Phaser.GameObjects.TileSprite;
  private bgTileScale = 1;
  private playerSpeed = 4;
  private playerLooksUp = false;
  private elapsedSeconds = 0;

  private enemySprites = new Map<string, Phaser.GameObjects.Sprite>();
  private projectileSprites = new Map<string, Phaser.GameObjects.Sprite>();
  private orbSprites = new Map<string, Phaser.GameObjects.Sprite>();
  private enemySpritePool: Phaser.GameObjects.Sprite[] = [];
  private projectileSpritePool: Phaser.GameObjects.Sprite[] = [];
  private orbSpritePool: Phaser.GameObjects.Sprite[] = [];

  constructor() {
    super(GameScene.key);
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#111111");
    this.cameras.main.setZoom(VIEWPORT_CONFIG.CAMERA_ZOOM);
    this.keyboardInput = new KeyboardInput(this);
    this.joystick = new TouchJoystick(this);
    this.background = this.add
      .tileSprite(0, 0, this.scale.width, this.scale.height, "bg-tel-aviv-loop")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-50);

    // Calibrate tile size so one visible loop matches the old world-unit feel.
    const bgTextureImage = this.textures.get("bg-tel-aviv-loop").getSourceImage() as
      | HTMLImageElement
      | undefined;
    if (bgTextureImage?.width) {
      const desiredTilePixels = VIEWPORT_CONFIG.CAMERA_ZOOM * PHASER_BG.GRID_UNIT_SIZE;
      this.bgTileScale = desiredTilePixels / bgTextureImage.width;
      this.background.setTileScale(this.bgTileScale, this.bgTileScale);
    }

    this.scale.on("resize", (size: Phaser.Structs.Size) => {
      this.background.setSize(size.width, size.height);
    });

    const playerConfig = this.getPlayerSpriteConfig();
    const playerSheetKey = buildSheetKey(
      playerConfig.textureUrl,
      playerConfig.spriteFrameSize ?? 32,
    );
    this.playerSprite = this.add
      .sprite(0, 0, playerSheetKey, playerConfig.index)
      .setDisplaySize(playerConfig.scale, playerConfig.scale)
      .setDepth(10);

    this.input.keyboard?.on("keydown-ESC", () => {
      if (!runtimeState.game.isRunning || runtimeState.game.isGameOver) return;
      runtimeState.game.togglePause();
      if (runtimeState.game.isPaused && runtimeState.game.pauseReason === PauseReason.Manual) {
        this.scene.launch("MainMenuScene");
        this.scene.pause();
        this.scene.pause("HudScene");
      }
    });
  }

  update(_time: number, deltaMs: number): void {
    const delta = deltaMs / 1000;
    const game = runtimeState.game;
    this.elapsedSeconds += delta;
    if (!game.isRunning || game.isGameOver || (game.isPaused && game.pauseReason !== PauseReason.Manual)) return;

    game.updateTimer(delta);
    this.playerSpeed = game.getEffectivePlayerStats().moveSpeed;
    this.updatePlayer(delta);
    this.updateWaves();
    this.updateEnemies(delta);
    this.updateWeapons();
    this.updateProjectiles(delta);
    this.updateOrbs(delta);
    this.handleCollisions(deltaMs);
    this.syncVisuals();
    this.cameras.main.centerOn(game.player.position.x, game.player.position.y);
    this.syncBackground(game.player.position);

    if (game.isGameOver) {
      this.scene.stop("HudScene");
      this.scene.start("GameOverScene");
    }
  }

  private updatePlayer(delta: number): void {
    const keyboard = this.keyboardInput.getDirection();
    const touch = this.joystick.getVector();
    const input = touch.x !== 0 || touch.y !== 0 ? touch : keyboard;
    const len = Math.hypot(input.x, input.y) || 1;

    const velocity = {
      x: (input.x / len) * this.playerSpeed,
      y: (input.y / len) * this.playerSpeed,
    };

    if (input.x !== 0 || input.y !== 0) {
      runtimeState.game.setPlayerDirection(input.x, input.y);
      if (input.y > 0) this.playerLooksUp = true;
      if (input.y < 0) this.playerLooksUp = false;
      runtimeState.game.setPlayerPosition(
        runtimeState.game.player.position.x + velocity.x * delta,
        runtimeState.game.player.position.y - velocity.y * delta,
      );
    }
    const pos = runtimeState.game.player.position;
    this.playerSprite.setPosition(pos.x, pos.y);
    this.playerSprite.setFlipX(runtimeState.game.player.facingLeft);
    this.playerSprite.setFrame(this.getPlayerAnimationFrame(input.x !== 0 || input.y !== 0));
  }

  private updateWaves(): void {
    const game = runtimeState.game;
    const currentWave = (WAVES[WaveId.TelAviv] ?? []).find(
      (wave) => game.runTimer >= wave.time_start && game.runTimer < wave.time_end,
    );
    if (!currentWave) return;

    const view = this.getViewBounds();
    const cullDistance = Math.max(view.halfWidth, view.halfHeight) * PHASER_GAMEPLAY.ENEMY_CULL_MULTIPLIER;
    for (const [enemyId, enemy] of runtimeState.enemies) {
      const dist = Phaser.Math.Distance.Between(
        enemy.position.x,
        enemy.position.y,
        game.player.position.x,
        game.player.position.y,
      );
      if (dist > cullDistance) runtimeState.removeEnemy(enemyId);
    }

    currentWave.enemies.forEach((config) => {
      const tracker = runtimeState.spawnTracker[config.id] ?? { lastSpawn: 0 };
      const activeCount = Array.from(runtimeState.enemies.values()).filter((e) => e.typeId === config.id).length;
      if (activeCount >= config.max_active) return;
      if (game.runTimer - tracker.lastSpawn < config.spawn_interval) return;
      const enemyData = ENEMIES[config.id];
      const pos = this.randomSpawnOutsideView();
      const enemy: PhaserEnemy = {
        id: buildEnemyId(config.id),
        typeId: config.id,
        position: pos,
        hp: enemyData.stats.hp,
        speed: enemyData.stats.speed,
        damage: enemyData.stats.damage,
        xpDrop: enemyData.stats.xpDrop,
        collisionRadius: Math.max(
        PHASER_GAMEPLAY.ENEMY_COLLISION_RADIUS_MIN,
        enemyData.sprite_config.scale * PHASER_GAMEPLAY.ENEMY_COLLISION_RADIUS_SCALE,
      ),
      };
      runtimeState.spawnEnemy(enemy);
      runtimeState.spawnTracker[config.id] = { lastSpawn: game.runTimer };
    });
  }

  private updateEnemies(delta: number): void {
    const target = runtimeState.game.player.position;
    for (const enemy of runtimeState.enemies.values()) {
      const dx = target.x - enemy.position.x;
      const dy = target.y - enemy.position.y;
      const len = Math.hypot(dx, dy) || 1;
      enemy.position.x += (dx / len) * enemy.speed * PHASER_GAMEPLAY.ENEMY_SPEED_MULTIPLIER * delta;
      enemy.position.y += (dy / len) * enemy.speed * PHASER_GAMEPLAY.ENEMY_SPEED_MULTIPLIER * delta;
    }
  }

  private updateWeapons(): void {
    const game = runtimeState.game;
    const now = game.runTimer;

    game.activeWeapons.forEach((weaponId) => {
      const def = WEAPONS[weaponId];
      const stats = game.getWeaponStats(weaponId);
      const runtime = buildWeaponRuntime(stats, game.getEffectivePlayerStats());
      const last = runtimeState.lastWeaponFireAt[weaponId] ?? 0;
      if (now - last <= runtime.cooldown) return;
      runtimeState.lastWeaponFireAt[weaponId] = now;

      if (def.type === "orbital") {
        const dirs = radialDirections(runtime.amount);
        dirs.forEach((dir, idx) => {
          runtimeState.addProjectile({
            id: `${weaponId}-${now}-${idx}`,
            weaponId,
            behaviorType: "orbit",
            position: { ...game.player.position },
            velocity: { x: 0, y: 0 },
            damage: runtime.damage,
            duration: runtime.duration,
            spawnTime: now,
            pierceLeft: stats.pierce,
            orbitAngle: Math.atan2(dir.y, dir.x),
            orbitRadius: stats.area * PHASER_GAMEPLAY.ORBIT_RADIUS_SCALE,
          });
        });
        return;
      }

      if (def.type === "projectile_radial") {
        const dirs = radialDirections(runtime.amount);
        const shots = createDirectionalProjectiles({
          directions: dirs,
          speed: runtime.speed * PHASER_GAMEPLAY.PROJECTILE_SPEED_MULTIPLIER,
          position: { x: game.player.position.x, y: game.player.position.y, z: 0 },
          damage: runtime.damage,
          duration: runtime.duration,
          idFactory: (idx) => `${weaponId}-${now}-${idx}`,
        });
        shots.forEach((shot) =>
          runtimeState.addProjectile({
            id: shot.id,
            weaponId,
            behaviorType: weaponBehaviorType(weaponId),
            position: { x: shot.position.x, y: shot.position.y },
            velocity: shot.velocity,
            damage: shot.damage,
            duration: shot.duration,
            spawnTime: now,
            pierceLeft: stats.pierce,
          }),
        );
        return;
      }

      if (def.type === "projectile_arc") {
        for (let i = 0; i < runtime.amount; i++) {
          const angle = Phaser.Math.FloatBetween(Math.PI / 4, (3 * Math.PI) / 4);
          runtimeState.addProjectile({
            id: `${weaponId}-${now}-${i}`,
            weaponId,
            behaviorType: "arc",
            position: { ...game.player.position },
            velocity: {
              x: Math.cos(angle) * runtime.speed * PHASER_GAMEPLAY.PROJECTILE_SPEED_MULTIPLIER,
              y: Math.sin(angle) * runtime.speed * PHASER_GAMEPLAY.PROJECTILE_SPEED_MULTIPLIER,
            },
            damage: runtime.damage,
            duration: runtime.duration,
            spawnTime: now,
            pierceLeft: stats.pierce,
          });
        }
        return;
      }

      const dir =
        def.type === "projectile_closest"
          ? nearestEnemyDirection(game.player.position, this.enemyPositionMap()) ?? game.player.direction
          : game.player.direction;
      const baseVelocity = buildVelocity(dir, runtime.speed * PHASER_GAMEPLAY.PROJECTILE_SPEED_MULTIPLIER);
      const spreadStep = def.type === "projectile_directional" ? PHASER_GAMEPLAY.PROJECTILE_SPREAD_STEP : 0;
      const shots = createSpreadProjectiles({
        amount: runtime.amount,
        baseVelocity,
        spreadStep,
        position: { x: game.player.position.x, y: game.player.position.y, z: 0 },
        duration: runtime.duration,
        damage: runtime.damage,
        idFactory: (idx) => `${weaponId}-${now}-${idx}`,
      });
      shots.forEach((shot) => {
        runtimeState.addProjectile({
          id: shot.id,
          weaponId,
          behaviorType: weaponBehaviorType(weaponId),
          position: { x: shot.position.x, y: shot.position.y },
          velocity: shot.velocity,
          damage: shot.damage,
          duration: shot.duration,
          spawnTime: now,
          pierceLeft: stats.pierce,
        });
      });
    });
  }

  private updateProjectiles(delta: number): void {
    const now = runtimeState.game.runTimer;
    const view = this.getViewBounds();
    for (const [id, projectile] of runtimeState.projectiles) {
      const age = now - projectile.spawnTime;
      if (age >= projectile.duration) {
        runtimeState.removeProjectile(id);
        continue;
      }

      if (projectile.behaviorType === "orbit") {
        projectile.orbitAngle = (projectile.orbitAngle ?? 0) + delta * PHASER_GAMEPLAY.ORBIT_ANGULAR_SPEED;
        const radius = projectile.orbitRadius ?? 1.5;
        projectile.position.x =
          runtimeState.game.player.position.x + Math.cos(projectile.orbitAngle) * radius;
        projectile.position.y =
          runtimeState.game.player.position.y + Math.sin(projectile.orbitAngle) * radius;
        continue;
      }

      if (projectile.behaviorType === "arc") {
        projectile.velocity.y -= PHASER_GAMEPLAY.ARC_GRAVITY * delta;
      } else if (projectile.behaviorType === "bounce") {
        projectile.velocity = reflectInBounds(
          projectile.position,
          projectile.velocity,
          runtimeState.game.player.position,
          view.halfWidth,
          view.halfHeight,
        );
      } else if (WEAPONS[projectile.weaponId].type === "projectile_closest") {
        const nearest = nearestEnemyDirection(
          projectile.position,
          this.enemyPositionMap(),
        );
        if (nearest) {
          const speed = Math.hypot(projectile.velocity.x, projectile.velocity.y) || 10;
          projectile.velocity.x = nearest.x * speed;
          projectile.velocity.y = nearest.y * speed;
        }
      }

      projectile.position.x += projectile.velocity.x * delta;
      projectile.position.y += projectile.velocity.y * delta;
    }
  }

  private updateOrbs(delta: number): void {
    const player = runtimeState.game.player.position;
    for (const [id, orb] of runtimeState.xpOrbs) {
      const dist = Phaser.Math.Distance.Between(orb.position.x, orb.position.y, player.x, player.y);
      if (dist < PHASER_GAMEPLAY.ORB_PICKUP_RADIUS) {
        runtimeState.game.addXp(orb.xpValue);
        runtimeState.removeOrb(id);
        continue;
      }
      if (dist < PHASER_GAMEPLAY.ORB_ATTRACT_RADIUS) {
        orb.attracted = true;
        const dx = (player.x - orb.position.x) / (dist || 1);
        const dy = (player.y - orb.position.y) / (dist || 1);
        orb.position.x += dx * PHASER_GAMEPLAY.ORB_ATTRACT_SPEED * delta;
        orb.position.y += dy * PHASER_GAMEPLAY.ORB_ATTRACT_SPEED * delta;
      }
    }
  }

  private handleCollisions(deltaMs: number): void {
    const now = performance.now();
    const player = runtimeState.game.player.position;

    if (now - runtimeState.lastPlayerContactDamageAt >= PHASER_GAMEPLAY.PLAYER_DAMAGE_INTERVAL_MS) {
      let totalDamage = 0;
      runtimeState.enemies.forEach((enemy) => {
        const dist = Phaser.Math.Distance.Between(enemy.position.x, enemy.position.y, player.x, player.y);
        if (dist < PHASER_GAMEPLAY.PLAYER_COLLISION_RADIUS + enemy.collisionRadius) totalDamage += enemy.damage;
      });
      if (totalDamage > 0) {
        runtimeState.game.takeDamage(totalDamage);
        runtimeState.lastPlayerContactDamageAt = now;
      }
    }

    for (const [projectileId, projectile] of runtimeState.projectiles) {
      for (const enemy of runtimeState.enemies.values()) {
        const dist = Phaser.Math.Distance.Between(
          projectile.position.x,
          projectile.position.y,
          enemy.position.x,
          enemy.position.y,
        );
        if (dist < PHASER_GAMEPLAY.PROJECTILE_COLLISION_RADIUS + enemy.collisionRadius) {
          runtimeState.damageEnemy(enemy.id, projectile.damage);
          projectile.pierceLeft -= 1;
          if (projectile.pierceLeft < 0) {
            runtimeState.removeProjectile(projectileId);
          }
          break;
        }
      }
    }

    if (runtimeState.game.pauseReason === PauseReason.LevelUp && !this.scene.isActive("HudScene")) {
      this.scene.launch("HudScene");
    }

    if (runtimeState.game.pauseReason === PauseReason.LevelUp) {
      this.scene.pause();
    }

    if (runtimeState.game.pauseReason === PauseReason.None && this.scene.isPaused()) {
      this.scene.resume();
    }

    if (runtimeState.game.isGameOver) {
      runtimeState.game.pauseGame();
    }

    void deltaMs;
  }

  /**
   * Shift the tile pattern so the background scrolls 1:1 with the world.
   * Runs after centerOn() so the camera position is final for this frame.
   *
   * tilePositionX is in the texture's native pixel space. Converting:
   *   screen pixels moved = player.x * CAMERA_ZOOM
   *   native pixels moved = screen pixels / tileScale
   */
  private syncBackground(playerPos: Vector2Like): void {
    if (this.bgTileScale === 0) return;
    this.background.tilePositionX = (playerPos.x * VIEWPORT_CONFIG.CAMERA_ZOOM) / this.bgTileScale;
    this.background.tilePositionY = (playerPos.y * VIEWPORT_CONFIG.CAMERA_ZOOM) / this.bgTileScale;
  }

  private syncVisuals(): void {
    for (const [id, enemy] of runtimeState.enemies) {
      const enemyData = ENEMIES[enemy.typeId];
      const sprite = this.getOrCreateEnemySprite(
        id,
        enemyData.sprite_config.textureUrl,
        enemyData.sprite_config.scale,
      );
      sprite.setPosition(enemy.position.x, enemy.position.y);
      const flip = enemy.position.x < runtimeState.game.player.position.x;
      sprite.setFlipX(flip);
      sprite.setFrame(this.getEnemyAnimationFrame());
    }
    for (const [id, sprite] of this.enemySprites) {
      if (!runtimeState.enemies.has(id)) {
        sprite.setVisible(false);
        this.enemySpritePool.push(sprite);
        this.enemySprites.delete(id);
      }
    }

    for (const [id, projectile] of runtimeState.projectiles) {
      const weapon = WEAPONS[projectile.weaponId];
      const sprite = this.getOrCreateProjectileSprite(
        id,
        weapon.sprite_config.textureUrl,
        weapon.sprite_config.scale,
        weapon.sprite_config.spriteFrameSize ?? 32,
        weapon.sprite_config.index,
      );
      sprite.setPosition(projectile.position.x, projectile.position.y);
      sprite.rotation += PHASER_GAMEPLAY.PROJECTILE_ROTATION_SPEED;
    }
    for (const [id, sprite] of this.projectileSprites) {
      if (!runtimeState.projectiles.has(id)) {
        sprite.setVisible(false);
        this.projectileSpritePool.push(sprite);
        this.projectileSprites.delete(id);
      }
    }

    for (const [id, orb] of runtimeState.xpOrbs) {
      const sprite = this.getOrCreateOrbSprite(id);
      sprite.setPosition(orb.position.x, orb.position.y);
      const orbSize = orb.attracted ? PHASER_GAMEPLAY.ORB_DISPLAY_ATTRACTED : PHASER_GAMEPLAY.ORB_DISPLAY_IDLE;
      sprite.setDisplaySize(orbSize, orbSize);
    }
    for (const [id, sprite] of this.orbSprites) {
      if (!runtimeState.xpOrbs.has(id)) {
        sprite.setVisible(false);
        this.orbSpritePool.push(sprite);
        this.orbSprites.delete(id);
      }
    }
  }

  private getOrCreateEnemySprite(id: string, textureUrl: string, scale: number): Phaser.GameObjects.Sprite {
    const existing = this.enemySprites.get(id);
    if (existing) return existing;
    const enemyType = runtimeState.enemies.get(id)?.typeId;
    const enemyData = enemyType ? ENEMIES[enemyType] : null;
    const frameSize = enemyData?.sprite_config.spriteFrameSize ?? 32;
    const initialFrame = enemyData?.sprite_config.index ?? 0;
    const sheetKey = buildSheetKey(textureUrl, frameSize);
    const pooled = this.enemySpritePool.pop();
    const sprite =
      pooled ??
      this.add.sprite(0, 0, sheetKey, initialFrame).setDepth(6);
    sprite
      .setTexture(sheetKey, initialFrame)
      .setDisplaySize(scale, scale)
      .setVisible(true)
      .setDepth(6);
    this.enemySprites.set(id, sprite);
    return sprite;
  }

  private getOrCreateProjectileSprite(
    id: string,
    textureUrl: string,
    scale: number,
    frameSize: number,
    frameIndex: number,
  ): Phaser.GameObjects.Sprite {
    const existing = this.projectileSprites.get(id);
    if (existing) return existing;
    const sheetKey = buildSheetKey(textureUrl, frameSize);
    const pooled = this.projectileSpritePool.pop();
    const sprite =
      pooled ??
      this.add.sprite(0, 0, sheetKey, frameIndex).setDepth(8);
    sprite
      .setTexture(sheetKey, frameIndex)
      .setDisplaySize(scale, scale)
      .setVisible(true)
      .setDepth(8);
    this.projectileSprites.set(id, sprite);
    return sprite;
  }

  private getOrCreateOrbSprite(id: string): Phaser.GameObjects.Sprite {
    const existing = this.orbSprites.get(id);
    if (existing) return existing;
    const sheetKey = buildSheetKey(sprites.xp, PHASER_SPRITES.ORB_FRAME_SIZE);
    const pooled = this.orbSpritePool.pop();
    const sprite = pooled ?? this.add.sprite(0, 0, sheetKey, 0).setDepth(7);
    sprite
      .setTexture(sheetKey, 0)
      .setDisplaySize(PHASER_GAMEPLAY.ORB_DISPLAY_IDLE, PHASER_GAMEPLAY.ORB_DISPLAY_IDLE)
      .setVisible(true)
      .setDepth(7);
    this.orbSprites.set(id, sprite);
    return sprite;
  }

  private getPlayerSpriteConfig() {
    const characterId = runtimeState.game.player.characterId;
    const character = CHARACTERS[characterId];
    return character.sprite_config;
  }

  private getPlayerAnimationFrame(isMoving: boolean): number {
    const set = ANIMATIONS_BY_CATEGORY[AnimationCategory.Characters][AnimationVariant.Default];
    const animation = isMoving
      ? this.playerLooksUp
        ? set[AnimationType.RunUp]
        : set[AnimationType.Run]
      : this.playerLooksUp
        ? set[AnimationType.IdleUp]
        : set[AnimationType.Idle];
    if (!animation) return 0;
    const frameIdx =
      animation.frames[Math.floor(this.elapsedSeconds * animation.frameRate) % animation.frames.length];
    return frameIdx ?? 0;
  }

  private getEnemyAnimationFrame(): number {
    const animation =
      ANIMATIONS_BY_CATEGORY[AnimationCategory.Enemies][AnimationVariant.Default][AnimationType.Run];
    if (!animation) return 0;
    const frameIdx =
      animation.frames[Math.floor(this.elapsedSeconds * animation.frameRate) % animation.frames.length];
    return frameIdx ?? 0;
  }

  private randomSpawnOutsideView(): Vector2Like {
    const player = runtimeState.game.player.position;
    const view = this.getViewBounds();
    const edge = Phaser.Math.Between(0, 3);
    if (edge === 0) {
      return {
        x: player.x - view.halfWidth - PHASER_GAMEPLAY.ENEMY_SPAWN_MARGIN,
        y: Phaser.Math.FloatBetween(player.y - view.halfHeight, player.y + view.halfHeight),
      };
    }
    if (edge === 1) {
      return {
        x: player.x + view.halfWidth + PHASER_GAMEPLAY.ENEMY_SPAWN_MARGIN,
        y: Phaser.Math.FloatBetween(player.y - view.halfHeight, player.y + view.halfHeight),
      };
    }
    if (edge === 2) {
      return {
        x: Phaser.Math.FloatBetween(player.x - view.halfWidth, player.x + view.halfWidth),
        y: player.y - view.halfHeight - PHASER_GAMEPLAY.ENEMY_SPAWN_MARGIN,
      };
    }
    return {
      x: Phaser.Math.FloatBetween(player.x - view.halfWidth, player.x + view.halfWidth),
      y: player.y + view.halfHeight + PHASER_GAMEPLAY.ENEMY_SPAWN_MARGIN,
    };
  }

  private enemyPositionMap(): Record<string, Vector2Like> {
    const positions: Record<string, Vector2Like> = {};
    runtimeState.enemies.forEach((enemy, id) => {
      positions[id] = enemy.position;
    });
    return positions;
  }

  private getViewBounds(): { halfWidth: number; halfHeight: number } {
    const width = this.scale.width / this.cameras.main.zoom;
    const height = this.scale.height / this.cameras.main.zoom;
    return { halfWidth: width / 2, halfHeight: height / 2 };
  }
}
