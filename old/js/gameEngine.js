// Core game engine for Hebrew Vampire Survivors

class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.running = false;
    this.lastTime = 0;

    // Game state
    this.player = null;
    this.entities = [];
    this.weapons = [];
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.particles = [];

    // Game systems
    this.camera = new Camera();
    this.collision = new CollisionSystem();
    this.spawner = new EnemySpawner();
    this.weaponSystem = new WeaponSystem();
    this.particleSystem = new ParticleSystem();

    // Game settings
    this.gameTime = 0;
    this.gameStartTime = 0;
    this.maxGameTime = 30 * 60; // 30 minutes in seconds
    this.difficultyMultiplier = 1.0;

    // Performance tracking
    this.frameCount = 0;
    this.fpsDisplay = 0;

    this.setupCanvas();
    this.setupGameLoop();
  }

  setupCanvas() {
    // Set canvas size
    this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
    this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;

    // Set pixel art rendering
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
  }

  setupGameLoop() {
    const gameLoop = (currentTime) => {
      if (this.running) {
        const deltaTime = Math.min(
          (currentTime - this.lastTime) / 1000,
          1 / 30
        );
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(gameLoop);
      }
    };

    this.gameLoop = gameLoop;
  }

  startGame(characterId, stageId) {
    console.log(
      "Starting game with character:",
      characterId,
      "stage:",
      stageId
    );

    // Reset game state
    this.resetGame();

    // Initialize player
    this.createPlayer(characterId);

    // Initialize stage
    this.loadStage(stageId);

    // Setup UI
    this.setupGameUI();

    // Start game loop
    this.running = true;
    this.gameStartTime = performance.now();
    this.lastTime = performance.now();

    // Start the game loop
    requestAnimationFrame(this.gameLoop);

    // Play gameplay music
    const audioManager = getAudioManager();
    if (audioManager) {
      audioManager.playGameplayMusic();
    }
  }

  resetGame() {
    this.gameTime = 0;
    this.entities = [];
    this.weapons = [];
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.particles = [];
    this.difficultyMultiplier = 1.0;

    // Reset camera
    this.camera.reset();

    // Clear spawner
    this.spawner.reset();
  }

  createPlayer(characterId) {
    const characterData = getCharacters().find((c) => c.id === characterId);
    if (!characterData) {
      console.error("Character not found:", characterId);
      return;
    }

    this.player = new Player(
      this.canvas.width / 2,
      this.canvas.height / 2,
      characterData
    );

    // Ensure real character sprite is loaded when available (Srulik override)
    try {
      const spriteId = `character_${characterData.id}`;
      if (characterData.id === "sruLik" && window.spriteManager) {
        window.spriteManager.spriteMeta.set(spriteId, {
          frameCount: 4,
          frameCols: 4,
          frameRows: 1,
        });
        window.spriteManager
          .loadSpriteOverride(
            spriteId,
            "hebrew_vampire_survivors_package/sprites/srulik.png"
          )
          .catch(() => {
            window.spriteManager.spriteMeta.set(spriteId, { frameCount: 4 });
          });
      }
    } catch (e) {
      // Non-fatal; placeholder remains
    }

    // Set the shared input manager
    if (window.game && window.game.inputManager) {
      this.player.inputManager = window.game.inputManager;
      console.log("InputManager connected to player");
    } else {
      console.warn("InputManager not found - movement will not work");
    }

    // Add player to entities
    this.entities.push(this.player);

    // Give player starting weapon
    if (characterData.starting_weapon_id) {
      this.weaponSystem.addWeapon(
        characterData.starting_weapon_id,
        this.player
      );
    }

    // Set camera to follow player
    this.camera.setTarget(this.player);
  }

  loadStage(stageId) {
    const stageData = getStages().find((s) => s.id === stageId);
    if (!stageData) {
      console.error("Stage not found:", stageId);
      return;
    }

    this.currentStage = stageData;

    // Setup enemy spawner
    this.spawner.initialize(stageData);

    // Set stage background
    this.stageBackground = stageData.background || "bg_tel_aviv";

    console.log("Stage loaded:", stageId);
  }

  setupGameUI() {
    try {
      console.log("setupGameUI: Starting HUD creation");
      // Create HUD
      if (window.screenManager && window.screenManager.uiManager) {
        console.log("setupGameUI: screenManager and uiManager found");
        window.screenManager.uiManager.createHUD(this.getGameState());
        console.log("setupGameUI: HUD created successfully");
      } else {
        console.log("setupGameUI: screenManager or uiManager not found");
      }
    } catch (error) {
      console.error("setupGameUI failed:", error);
      throw error;
    }
  }

  update(deltaTime) {
    if (!this.running || !this.player) {
      return;
    }

    // Update game time
    this.gameTime += deltaTime;

    // Check game over conditions
    if (this.gameTime >= this.maxGameTime) {
      this.endGame(true); // Victory by survival
      return;
    }

    if (this.player.health <= 0) {
      this.endGame(false); // Defeat
      return;
    }

    // Update difficulty
    this.updateDifficulty();

    // Update all entities
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i];
      if (entity.update) {
        entity.update(deltaTime);
      }

      // Remove dead entities
      if (entity.shouldRemove) {
        this.entities.splice(i, 1);

        // Special handling for different entity types
        if (entity instanceof Enemy) {
          this.onEnemyDeath(entity);
        }
      }
    }

    // Update weapons
    this.weaponSystem.update(deltaTime);

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.update(deltaTime);

      if (projectile.shouldRemove) {
        this.projectiles.splice(i, 1);
      }
    }

    // Update pickups
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pickup = this.pickups[i];
      pickup.update(deltaTime);

      if (pickup.shouldRemove) {
        this.pickups.splice(i, 1);
      }
    }

    // Update particles
    this.particleSystem.update(deltaTime);

    // Spawn enemies
    this.spawner.update(deltaTime, this.player.x, this.player.y);

    // Handle collisions
    this.handleCollisions();

    // Update camera
    this.camera.update(deltaTime);

    // Update screen effects
    ScreenEffects.update(deltaTime);

    // Update UI
    this.updateUI();

    // Update performance tracking
    Performance.update(deltaTime);
    TimeUtils.update();
  }

  updateDifficulty() {
    // Increase difficulty over time
    this.difficultyMultiplier = 1.0 + this.gameTime / 300; // +100% difficulty every 5 minutes

    // Update spawner difficulty
    this.spawner.setDifficultyMultiplier(this.difficultyMultiplier);
  }

  handleCollisions() {
    // Player vs Enemies
    for (const enemy of this.enemies) {
      if (this.collision.checkCircleCollision(this.player, enemy)) {
        this.player.takeDamage(enemy.damage);

        // Knockback
        const angle = MathUtils.angle(
          enemy.x,
          enemy.y,
          this.player.x,
          this.player.y
        );
        this.player.applyKnockback(angle, enemy.knockback || 50);

        // Screen shake
        ScreenEffects.shake(3, 0.1);

        // Play hurt sound
        const audioManager = getAudioManager();
        if (audioManager) {
          audioManager.playPlayerHurt();
        }
      }
    }

    // Projectiles vs Enemies
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];

        if (this.collision.checkCircleCollision(projectile, enemy)) {
          // Deal damage
          const damage = projectile.damage * this.player.damageMultiplier;
          enemy.takeDamage(damage);

          // Show damage number
          this.showDamageNumber(enemy.x, enemy.y, damage);

          // Create hit particles
          this.particleSystem.createHitParticles(enemy.x, enemy.y);

          // Play hit sound
          const audioManager = getAudioManager();
          if (audioManager) {
            audioManager.playEnemyHit();
          }

          // Remove projectile if not piercing
          if (!projectile.piercing) {
            projectile.shouldRemove = true;
          } else {
            projectile.pierceCount--;
            if (projectile.pierceCount <= 0) {
              projectile.shouldRemove = true;
            }
          }

          break;
        }
      }
    }

    // Player vs Pickups
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pickup = this.pickups[i];

      if (
        this.collision.checkCircleCollision(
          this.player,
          pickup,
          GAME_CONFIG.GAMEPLAY.PICKUP_RANGE
        )
      ) {
        this.collectPickup(pickup);
        this.pickups.splice(i, 1);
      }
    }
  }

  collectPickup(pickup) {
    switch (pickup.type) {
      case "xp":
        this.player.gainXP(pickup.value);
        break;

      case "gold":
        this.player.gainGold(pickup.value);
        break;

      case "health":
        this.player.heal(pickup.value);
        break;

      case "powerup":
        this.applyPowerup(pickup.powerupType);
        break;
    }

    // Play pickup sound
    const audioManager = getAudioManager();
    if (audioManager) {
      switch (pickup.type) {
        case "gold":
          audioManager.playSound(
            "coin_collect",
            0.6,
            MathUtils.random(0.9, 1.1)
          );
          break;
        case "powerup":
          audioManager.playPowerup();
          break;
        default:
          audioManager.playPickupItem();
          break;
      }
    }

    // Create pickup particles
    this.particleSystem.createPickupParticles(pickup.x, pickup.y, pickup.type);
  }

  applyPowerup(powerupType) {
    // Apply temporary powerup effects
    switch (powerupType) {
      case "damage_boost":
        this.player.applyTemporaryBuff("damage", 2.0, 30);
        break;

      case "speed_boost":
        this.player.applyTemporaryBuff("speed", 1.5, 20);
        break;

      case "invincibility":
        this.player.applyTemporaryBuff("invincible", 1, 5);
        break;
    }
  }

  onEnemyDeath(enemy) {
    // Award XP
    this.player.gainXP(enemy.xpReward || 1);

    // Chance to drop items
    this.dropItems(enemy.x, enemy.y, enemy.dropTable);

    // Update statistics
    saveSystem.updateSessionStats({
      enemiesKilled: (saveSystem.currentSession?.stats.enemiesKilled || 0) + 1,
    });

    // Create death particles
    this.particleSystem.createDeathParticles(enemy.x, enemy.y);

    // Play death sound
    const audioManager = getAudioManager();
    if (audioManager) {
      audioManager.playEnemyDeath();
    }

    // Remove from enemies array
    const index = this.enemies.indexOf(enemy);
    if (index > -1) {
      this.enemies.splice(index, 1);
    }
  }

  dropItems(x, y, dropTable) {
    if (!dropTable) {
      // Default drops
      if (Math.random() < 0.1) {
        // 10% chance
        this.createPickup(x, y, "gold", MathUtils.randomInt(1, 5));
      }
      if (Math.random() < 0.05) {
        // 5% chance
        this.createPickup(x, y, "health", 10);
      }
      return;
    }

    // Process drop table
    for (const drop of dropTable) {
      if (Math.random() < drop.chance) {
        this.createPickup(x, y, drop.type, drop.value);
      }
    }
  }

  createPickup(x, y, type, value) {
    const pickup = new Pickup(x, y, type, value);
    this.pickups.push(pickup);
  }

  showDamageNumber(x, y, damage) {
    // Convert world coordinates to screen coordinates
    const screenPos = this.camera.worldToScreen(x, y);

    if (window.screenManager && window.screenManager.uiManager) {
      window.screenManager.uiManager.showDamageNumber(
        screenPos.x,
        screenPos.y,
        damage
      );
    }
  }

  updateUI() {
    if (window.screenManager && window.screenManager.uiManager) {
      window.screenManager.uiManager.updateHUD(this.getGameState());
    }
  }

  getGameState() {
    return {
      currentScreen: "gameplay",
      player: this.player,
      gameTime: this.gameTime,
      entities: this.entities,
      enemies: this.enemies.length,
      difficultyMultiplier: this.difficultyMultiplier,
    };
  }

  render() {
    // Clear canvas once per frame via resetting transform and using clearRect
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply camera transform
    this.ctx.save();
    this.camera.apply(this.ctx);

    // Apply screen shake
    const shakeOffset = ScreenEffects.getShakeOffset();
    this.ctx.translate(shakeOffset.x, shakeOffset.y);

    // Render background
    this.renderBackground();

    // Render entities
    this.renderEntities();

    // Render projectiles
    this.renderProjectiles();

    // Render pickups
    this.renderPickups();

    // Render particles
    this.particleSystem.render(this.ctx);

    // Restore camera transform
    this.ctx.restore();

    // Render UI elements on top
    this.renderUI();

    // Debug rendering
    if (Debug.enabled) {
      this.renderDebug();
    }
  }

  renderBackground() {
    // Render tiled background without gaps/flashing
    const tileSize = 256;
    const startX =
      Math.floor((this.camera.x - this.canvas.width / 2) / tileSize) *
        tileSize -
      tileSize;
    const startY =
      Math.floor((this.camera.y - this.canvas.height / 2) / tileSize) *
        tileSize -
      tileSize;
    const endX = startX + this.canvas.width + tileSize * 3;
    const endY = startY + this.canvas.height + tileSize * 3;

    for (let x = startX; x < endX; x += tileSize) {
      for (let y = startY; y < endY; y += tileSize) {
        spriteManager.drawSprite(
          this.ctx,
          this.stageBackground,
          x,
          y,
          tileSize,
          tileSize
        );
      }
    }
  }

  renderEntities() {
    // Sort entities by y position for proper depth
    const sortedEntities = [...this.entities].sort((a, b) => a.y - b.y);

    for (const entity of sortedEntities) {
      if (entity.render) {
        entity.render(this.ctx);
      }
    }
  }

  renderProjectiles() {
    for (const projectile of this.projectiles) {
      if (projectile.render) {
        projectile.render(this.ctx);
      }
    }
  }

  renderPickups() {
    for (const pickup of this.pickups) {
      if (pickup.render) {
        pickup.render(this.ctx);
      }
    }
  }

  renderUI() {
    // UI elements are rendered by the UI manager
    // This is for in-game overlays only

    // Mini-map (optional)
    if (Debug.enabled) {
      this.renderMiniMap();
    }
  }

  renderMiniMap() {
    const miniMapSize = 150;
    const miniMapX = this.canvas.width - miniMapSize - 20;
    const miniMapY = 20;

    this.ctx.save();
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(miniMapX, miniMapY, miniMapSize, miniMapSize);

    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(miniMapX, miniMapY, miniMapSize, miniMapSize);

    // Draw player
    this.ctx.fillStyle = "#00ff00";
    this.ctx.fillRect(
      miniMapX + miniMapSize / 2 - 2,
      miniMapY + miniMapSize / 2 - 2,
      4,
      4
    );

    // Draw enemies
    this.ctx.fillStyle = "#ff0000";
    const scale = miniMapSize / 1000;
    for (const enemy of this.enemies) {
      const ex = (enemy.x - this.player.x) * scale + miniMapSize / 2;
      const ey = (enemy.y - this.player.y) * scale + miniMapSize / 2;

      if (ex >= 0 && ex < miniMapSize && ey >= 0 && ey < miniMapSize) {
        this.ctx.fillRect(miniMapX + ex - 1, miniMapY + ey - 1, 2, 2);
      }
    }

    this.ctx.restore();
  }

  renderDebug() {
    this.ctx.save();
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "12px monospace";
    this.ctx.textAlign = "left";

    const debugInfo = [
      `FPS: ${Performance.getFPS()}`,
      `Entities: ${this.entities.length}`,
      `Enemies: ${this.enemies.length}`,
      `Projectiles: ${this.projectiles.length}`,
      `Player: (${Math.round(this.player?.x || 0)}, ${Math.round(
        this.player?.y || 0
      )})`,
      `Time: ${TimeUtils.formatTime(this.gameTime)}`,
      `Difficulty: ${this.difficultyMultiplier.toFixed(2)}x`,
    ];

    for (let i = 0; i < debugInfo.length; i++) {
      this.ctx.fillText(debugInfo[i], 10, 20 + i * 15);
    }

    this.ctx.restore();
  }

  endGame(victory) {
    this.running = false;

    const stats = {
      victory,
      survivalTime: this.gameTime,
      enemiesKilled: saveSystem.currentSession?.stats.enemiesKilled || 0,
      damageDealt: saveSystem.currentSession?.stats.damageDealt || 0,
      experienceGained: this.player?.totalXPGained || 0,
      goldEarned: this.player?.goldEarned || 0,
    };

    // End the game in screen manager
    if (window.screenManager) {
      window.screenManager.endGame(victory, stats);
    }

    console.log("Game ended:", victory ? "Victory" : "Defeat", stats);
  }

  pauseGame() {
    this.running = false;
  }

  resumeGame() {
    if (!this.running) {
      this.running = true;
      this.lastTime = performance.now();
      requestAnimationFrame(this.gameLoop);
    }
  }

  // Add entity to the game
  addEntity(entity) {
    this.entities.push(entity);

    if (entity instanceof Enemy) {
      this.enemies.push(entity);
    }
  }

  // Add projectile to the game
  addProjectile(projectile) {
    this.projectiles.push(projectile);
  }

  // Get entities within range of a point
  getEntitiesInRange(x, y, range, filter = null) {
    return this.entities.filter((entity) => {
      if (filter && !filter(entity)) return false;
      return MathUtils.distance(x, y, entity.x, entity.y) <= range;
    });
  }

  // Get nearest enemy to a point
  getNearestEnemy(x, y, maxDistance = Infinity) {
    let nearest = null;
    let nearestDistance = maxDistance;

    for (const enemy of this.enemies) {
      const distance = MathUtils.distance(x, y, enemy.x, enemy.y);
      if (distance < nearestDistance) {
        nearest = enemy;
        nearestDistance = distance;
      }
    }

    return nearest;
  }
}

// Camera system
class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.target = null;
    this.smoothing = 1.0; // Remove smoothing for now to test movement
    this.shake = { x: 0, y: 0 };
  }

  setTarget(target) {
    this.target = target;
  }

  update(deltaTime) {
    if (this.target) {
      // Smooth camera movement
      const targetX = this.target.x;
      const targetY = this.target.y;

      this.x = MathUtils.lerp(this.x, targetX, this.smoothing);
      this.y = MathUtils.lerp(this.y, targetY, this.smoothing);
    }
  }

  apply(ctx) {
    const canvas = ctx.canvas;
    ctx.translate(-this.x + canvas.width / 2, -this.y + canvas.height / 2);
  }

  worldToScreen(worldX, worldY) {
    const canvas = this.ctx?.canvas || {
      width: GAME_CONFIG.CANVAS_WIDTH,
      height: GAME_CONFIG.CANVAS_HEIGHT,
    };
    return {
      x: worldX - this.x + canvas.width / 2,
      y: worldY - this.y + canvas.height / 2,
    };
  }

  screenToWorld(screenX, screenY) {
    const canvas = this.ctx?.canvas || {
      width: GAME_CONFIG.CANVAS_WIDTH,
      height: GAME_CONFIG.CANVAS_HEIGHT,
    };
    return {
      x: screenX + this.x - canvas.width / 2,
      y: screenY + this.y - canvas.height / 2,
    };
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.target = null;
  }
}

// Collision system
class CollisionSystem {
  checkCircleCollision(obj1, obj2, customRadius = null) {
    const radius1 = customRadius || obj1.radius || obj1.size || 16;
    const radius2 = obj2.radius || obj2.size || 16;

    const distance = MathUtils.distance(obj1.x, obj1.y, obj2.x, obj2.y);
    return distance <= radius1 + radius2;
  }

  checkRectCollision(obj1, obj2) {
    const w1 = obj1.width || obj1.size * 2 || 32;
    const h1 = obj1.height || obj1.size * 2 || 32;
    const w2 = obj2.width || obj2.size * 2 || 32;
    const h2 = obj2.height || obj2.size * 2 || 32;

    return (
      obj1.x < obj2.x + w2 &&
      obj1.x + w1 > obj2.x &&
      obj1.y < obj2.y + h2 &&
      obj1.y + h1 > obj2.y
    );
  }
}

// Export game engine
window.GameEngine = GameEngine;
window.Camera = Camera;
window.CollisionSystem = CollisionSystem;
