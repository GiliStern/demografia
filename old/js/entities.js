// Game entities: Player, Enemies, Pickups, etc.

// Base Entity class
class Entity {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.size = 16;
    this.radius = this.size;
    this.health = 100;
    this.maxHealth = 100;
    this.shouldRemove = false;
    this.invulnerable = false;
    this.invulnerabilityTime = 0;

    // Visual properties
    this.color = "#ffffff";
    this.scale = 1.0;
    this.rotation = 0;
    this.opacity = 1.0;

    // Animation
    this.animationFrame = 0;
    this.animationTime = 0;
    this.animationSpeed = 0.2;
    this.animationFrameCount = 4;
    this.animator = new FrameAnimator();
  }

  update(deltaTime) {
    // Debug deltaTime and position updates for player
    if (this instanceof Player && (this.vx !== 0 || this.vy !== 0)) {
      const oldPos = { x: this.x, y: this.y };
      const movement = { x: this.vx * deltaTime, y: this.vy * deltaTime };
      console.log("Position update:", {
        deltaTime: deltaTime,
        velocity: { x: this.vx, y: this.vy },
        movement: movement,
        oldPosition: oldPos,
      });
    }

    // Update position
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Debug final position for player
    if (this instanceof Player && (this.vx !== 0 || this.vy !== 0)) {
      console.log("New position:", { x: this.x, y: this.y });
    }

    // Update invulnerability
    if (this.invulnerable) {
      this.invulnerabilityTime -= deltaTime;
      if (this.invulnerabilityTime <= 0) {
        this.invulnerable = false;
      }
    }

    // Update animation via animator
    this.animator.update(deltaTime);
    this.animationFrame = this.animator.getFrame();
  }

  render(ctx) {
    ctx.save();

    // Apply transformations
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);
    ctx.globalAlpha = this.opacity;

    // Invulnerability flashing
    if (
      this.invulnerable &&
      Math.floor(this.invulnerabilityTime * 10) % 2 === 0
    ) {
      ctx.globalAlpha *= 0.5;
    }

    // Draw entity
    this.draw(ctx);

    ctx.restore();

    // Debug rendering
    if (Debug.enabled) {
      this.renderDebug(ctx);
    }
  }

  draw(ctx) {
    // Default circle rendering
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  renderDebug(ctx) {
    ctx.save();
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Health bar
    if (this.health < this.maxHealth) {
      const barWidth = this.size * 2;
      const barHeight = 4;
      const healthPercent = this.health / this.maxHealth;

      ctx.fillStyle = "#ff0000";
      ctx.fillRect(
        this.x - barWidth / 2,
        this.y - this.size - 10,
        barWidth,
        barHeight
      );
      ctx.fillStyle = "#00ff00";
      ctx.fillRect(
        this.x - barWidth / 2,
        this.y - this.size - 10,
        barWidth * healthPercent,
        barHeight
      );
    }

    ctx.restore();
  }

  takeDamage(damage) {
    if (this.invulnerable) return false;

    this.health -= damage;

    if (this.health <= 0) {
      this.health = 0;
      this.onDeath();
    }

    return true;
  }

  heal(amount) {
    this.health = Math.min(this.health + amount, this.maxHealth);
  }

  setInvulnerable(duration) {
    this.invulnerable = true;
    this.invulnerabilityTime = duration;
  }

  onDeath() {
    this.shouldRemove = true;
  }

  getDistance(other) {
    return MathUtils.distance(this.x, this.y, other.x, other.y);
  }

  getAngleTo(other) {
    return MathUtils.angle(this.x, this.y, other.x, other.y);
  }
}

// Player class
class Player extends Entity {
  constructor(x, y, characterData) {
    super(x, y);

    this.characterData = characterData;
    this.size = 16;
    this.radius = 12;

    // Player stats
    this.maxHealth = characterData.stats?.hp || 100;
    this.health = this.maxHealth;
    // Interpret JSON move_speed as a multiplier over a sensible px/sec base
    this.baseSpeed = GAME_CONFIG.INPUT.MOVE_SPEED;
    const moveSpeedStat = characterData.stats?.move_speed ?? 1;
    this.moveSpeed = Math.max(this.baseSpeed * moveSpeedStat, 80); // safeguard minimum

    // Player progression
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 100;
    this.totalXPGained = 0;
    this.gold = 0;
    this.goldEarned = 0;

    // Combat stats
    this.damageMultiplier = 1.0 + (characterData.stats?.might || 0) / 100;
    this.areaMultiplier = 1.0 + (characterData.stats?.area || 0) / 100;
    this.cooldownMultiplier = 1.0 - (characterData.stats?.cooldown || 0) / 100;
    this.speedMultiplier = 1.0;

    // Status effects
    this.buffs = new Map();
    this.knockbackVelocity = new Vector2(0, 0);
    this.knockbackDecay = 0.9;

    // Input - will be set by the game engine
    this.inputManager = null;

    // Visual
    this.facing = 1; // 1 = right, -1 = left
    this.spriteId = `character_${characterData.id}`;

    console.log("Player created:", characterData.name_he);
  }

  update(deltaTime) {
    // Handle input
    this.handleInput(deltaTime);

    // Update buffs
    this.updateBuffs(deltaTime);

    // Apply knockback
    this.applyKnockback(deltaTime);

    // Update base entity
    super.update(deltaTime);
    // Ensure animator frame reflects latest sequence
    this.animationFrame = this.animator.getFrame();

    // Update facing direction
    if (this.vx > 0) this.facing = 1;
    else if (this.vx < 0) this.facing = -1;

    // Keep player on screen (with some leeway) - increased area for better movement
    const margin = 2000; // Much larger area for player movement
    this.x = MathUtils.clamp(this.x, -margin, margin);
    this.y = MathUtils.clamp(this.y, -margin, margin);
  }

  handleInput(deltaTime) {
    if (!this.inputManager) {
      console.warn("Player: No input manager connected");
      this.vx = 0;
      this.vy = 0;
      return;
    }
    const input = this.inputManager.getMovementInput();

    // Calculate movement speed with modifiers
    const totalSpeed = this.moveSpeed * this.speedMultiplier;

    // Apply movement
    this.vx = input.x * totalSpeed;
    this.vy = input.y * totalSpeed;

    // Animation: idle uses frame 0; walking cycles frames 1..N-1
    const moving = Math.abs(this.vx) > 1 || Math.abs(this.vy) > 1;
    const meta = window.spriteManager?.spriteMeta?.get(this.spriteId);
    const frameCount = Math.max(1, meta?.frameCount || 1);
    if (!moving || frameCount === 1) {
      this.animator.setSequence([0], 8, "idle");
    } else {
      const walkSeq = [];
      for (let i = 1; i < frameCount; i++) walkSeq.push(i);
      this.animator.setSequence(walkSeq, 10, "walk");
    }
  }

  updateBuffs(deltaTime) {
    for (const [buffType, buff] of this.buffs) {
      buff.duration -= deltaTime;

      if (buff.duration <= 0) {
        this.removeBuff(buffType);
      }
    }
  }

  applyKnockback(deltaTime) {
    if (this.knockbackVelocity.magnitude() > 1) {
      this.x += this.knockbackVelocity.x * deltaTime;
      this.y += this.knockbackVelocity.y * deltaTime;

      // Apply exponential decay and clamp small values to zero to avoid jitter
      this.knockbackVelocity.multiply(this.knockbackDecay);
      if (this.knockbackVelocity.magnitude() < 0.5) {
        this.knockbackVelocity.set(0, 0);
      }
    }
  }

  applyKnockback(angle, force) {
    const knockback = Vector2.fromAngle(angle, force);
    this.knockbackVelocity.add(knockback);
  }

  applyTemporaryBuff(type, multiplier, duration) {
    this.buffs.set(type, {
      multiplier,
      duration,
      originalValue: this.getStatValue(type),
    });

    this.updateStatMultipliers();
  }

  removeBuff(type) {
    this.buffs.delete(type);
    this.updateStatMultipliers();
  }

  updateStatMultipliers() {
    // Reset multipliers
    this.speedMultiplier = 1.0;
    this.damageMultiplier = 1.0 + (this.characterData.stats?.might || 0) / 100;

    // Apply buffs
    for (const [buffType, buff] of this.buffs) {
      switch (buffType) {
        case "speed":
          this.speedMultiplier *= buff.multiplier;
          break;
        case "damage":
          this.damageMultiplier *= buff.multiplier;
          break;
        case "invincible":
          this.setInvulnerable(buff.duration);
          break;
      }
    }
  }

  getStatValue(type) {
    switch (type) {
      case "speed":
        return this.moveSpeed;
      case "damage":
        return this.damageMultiplier;
      default:
        return 1.0;
    }
  }

  gainXP(amount) {
    this.xp += amount;
    this.totalXPGained += amount;

    // Check for level up
    while (this.xp >= this.xpToNext) {
      this.levelUp();
    }

    // Update session stats
    saveSystem.updateSessionStats({
      experienceGained: this.totalXPGained,
    });
  }

  levelUp() {
    this.xp -= this.xpToNext;
    this.level++;
    this.xpToNext = Math.floor(this.xpToNext * 1.2); // 20% increase each level

    // Show level up screen
    this.showLevelUpOptions();

    // Play level up sound
    const audioManager = getAudioManager();
    if (audioManager) {
      audioManager.playLevelUp();
    }

    // Heal player slightly
    this.heal(this.maxHealth * 0.1);

    console.log("Level up!", this.level);
  }

  showLevelUpOptions() {
    // Generate level up options
    const options = this.generateLevelUpOptions();

    // Pause game
    if (window.gameEngine) {
      window.gameEngine.pauseGame();
    }

    // Show UI
    if (window.screenManager && window.screenManager.uiManager) {
      window.screenManager.uiManager.showLevelUpPanel(
        options,
        (selectedOption) => {
          this.applyLevelUpChoice(selectedOption);

          // Resume game
          if (window.gameEngine) {
            window.gameEngine.resumeGame();
          }
        }
      );
    }
  }

  generateLevelUpOptions() {
    const options = [];
    const weapons = getWeapons();
    const passives = getPassives();

    // Add weapon options
    const weaponIds = Object.keys(weapons);
    for (let i = 0; i < 2; i++) {
      const weaponId = MathUtils.randomChoice(weaponIds);
      const weapon = weapons[weaponId];
      options.push({
        type: "weapon",
        id: weaponId,
        name: weapon.name_he,
        description: weapon.description_he,
      });
    }

    // Add passive option
    const passiveIds = Object.keys(passives);
    const passiveId = MathUtils.randomChoice(passiveIds);
    const passive = passives[passiveId];
    options.push({
      type: "passive",
      id: passiveId,
      name: passive.name_he,
      description: passive.description_he || "Passive upgrade",
    });

    return options;
  }

  applyLevelUpChoice(option) {
    switch (option.type) {
      case "weapon":
        if (window.gameEngine && window.gameEngine.weaponSystem) {
          window.gameEngine.weaponSystem.addWeapon(option.id, this);
        }
        break;

      case "passive":
        this.applyPassiveUpgrade(option.id);
        break;
    }
  }

  applyPassiveUpgrade(passiveId) {
    // Apply passive effects based on ID
    switch (passiveId) {
      case "spinach": // Damage boost
        this.damageMultiplier += 0.2;
        break;
      case "armor": // Damage reduction
        this.damageReduction = (this.damageReduction || 0) + 0.1;
        break;
      case "hollow_heart": // Max health increase
        this.maxHealth += 20;
        this.heal(20);
        break;
      case "pummarola": // Health regeneration
        this.healthRegen = (this.healthRegen || 0) + 1;
        break;
      case "wings": // Speed boost
        this.moveSpeed += 20;
        break;
      default:
        console.log("Applied passive:", passiveId);
    }
  }

  gainGold(amount) {
    this.gold += amount;
    this.goldEarned += amount;

    // Update session stats
    saveSystem.updateSessionStats({
      goldEarned: this.goldEarned,
    });

    // Update save data
    saveSystem.updateProgress({
      player: {
        gold: saveSystem.progress.player.gold + amount,
      },
    });
  }

  takeDamage(damage) {
    // Apply damage reduction
    const actualDamage = damage * (1 - (this.damageReduction || 0));

    console.log(
      "Player taking damage:",
      damage,
      "->",
      actualDamage,
      "Health before:",
      this.health
    );

    const damageTaken = super.takeDamage(actualDamage);

    if (damageTaken) {
      console.log(
        "Player health after damage:",
        this.health,
        "/",
        this.maxHealth
      );

      // Set brief invulnerability
      this.setInvulnerable(0.5);

      // Update session stats
      saveSystem.updateSessionStats({
        damageDealt:
          (saveSystem.currentSession?.stats.damageDealt || 0) + actualDamage,
      });
    }

    return damageTaken;
  }

  draw(ctx) {
    // Draw character sprite
    const spriteId = this.spriteId;

    if (spriteManager.getSprite(spriteId)) {
      // Draw sprite with facing scale but isolate it so UI (health bar) stays unflipped
      ctx.save();
      const scale = this.facing;
      ctx.scale(scale, 1);
      // Always render exactly one frame-width from a spritesheet frame
      // Character logical size is size*2; we draw that for a single frame
      spriteManager.drawSprite(
        ctx,
        spriteId,
        -this.size,
        -this.size,
        this.size * 2,
        this.size * 2,
        this.animationFrame
      );
      ctx.restore();
    } else {
      // Simple fallback rendering
      super.draw(ctx);
    }

    // Player health bar below the character (LTR), width = 2x player width
    const barWidth = this.size * 4; // player width is size*2 → 2x that = size*4
    const barHeight = 6;
    const healthPercent = MathUtils.clamp(this.health / this.maxHealth, 0, 1);
    const barX = -barWidth / 2;
    const barY = this.size + 10; // just below the sprite

    // Background and border
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
    ctx.fillStyle = "#4a0000"; // dark red background
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Health fill (LTR)
    ctx.fillStyle = "#00c853"; // green
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
  }
}

// Enemy class
class Enemy extends Entity {
  constructor(x, y, enemyData) {
    super(x, y);

    this.enemyData = enemyData;
    this.size = 14;
    this.radius = 12;
    this.health = enemyData.health || 10;
    this.maxHealth = this.health;
    this.damage = enemyData.damage || 10;
    this.moveSpeed = enemyData.speed || 50;
    this.xpReward = enemyData.xpReward || 1;
    this.knockback = enemyData.knockback || 30;

    // AI behavior
    this.target = null;
    this.attackCooldown = 0;
    this.attackRate = enemyData.attackRate || 1.0;

    // Visual
    this.spriteId = `enemy_${enemyData.id}`;
    this.color = "#ff4757";
    this.animator = new FrameAnimator();

    // Drop table
    this.dropTable = enemyData.dropTable || [
      { type: "xp", value: 1, chance: 1.0 },
      { type: "gold", value: 1, chance: 0.1 },
    ];
  }

  update(deltaTime) {
    // Find player target
    if (window.gameEngine && window.gameEngine.player) {
      this.target = window.gameEngine.player;
    }

    // AI behavior
    this.updateAI(deltaTime);

    // Update attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime;
    }

    // Animation policy like player: frame 0 idle; frames 1..N-1 when moving
    const meta = window.spriteManager?.spriteMeta?.get(this.spriteId);
    const frameCount = Math.max(1, meta?.frameCount || 1);
    const moving = Math.abs(this.vx) > 1 || Math.abs(this.vy) > 1;
    if (!moving || frameCount === 1) {
      this.animator.setSequence([0], 6, "idle");
    } else {
      const seq = [];
      for (let i = 1; i < frameCount; i++) seq.push(i);
      this.animator.setSequence(seq, 8, "walk");
    }

    this.animator.update(deltaTime);
    this.animationFrame = this.animator.getFrame();

    super.update(deltaTime);
  }

  updateAI(deltaTime) {
    if (!this.target) return;

    // Move towards player
    const angle = this.getAngleTo(this.target);
    const distance = this.getDistance(this.target);

    // Don't move if too close (to avoid overlapping)
    if (distance > this.radius + this.target.radius + 5) {
      this.vx = Math.cos(angle) * this.moveSpeed;
      this.vy = Math.sin(angle) * this.moveSpeed;
    } else {
      this.vx = 0;
      this.vy = 0;
    }
  }

  draw(ctx) {
    const spriteId = this.spriteId;

    if (spriteManager.getSprite(spriteId)) {
      spriteManager.drawSprite(
        ctx,
        spriteId,
        -this.size,
        -this.size,
        this.size * 2,
        this.size * 2,
        this.animationFrame
      );
    } else {
      // Fallback rendering based on enemy type
      this.drawFallback(ctx);
    }
  }

  drawFallback(ctx) {
    if (this.enemyData.name_he.includes("חתול")) {
      // Cat enemy
      ctx.fillStyle = "#FF7F50";
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();

      // Cat ears
      ctx.fillStyle = "#FF6347";
      ctx.beginPath();
      ctx.moveTo(-8, -8);
      ctx.lineTo(-4, -12);
      ctx.lineTo(-12, -8);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(8, -8);
      ctx.lineTo(4, -12);
      ctx.lineTo(12, -8);
      ctx.fill();

      // Eyes
      ctx.fillStyle = "#00ff00";
      ctx.fillRect(-4, -4, 2, 2);
      ctx.fillRect(2, -4, 2, 2);
    } else if (this.enemyData.name_he.includes("טיקטוק")) {
      // TikTok star enemy
      ctx.fillStyle = "#ff1493";
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();

      // Phone
      ctx.fillStyle = "#000";
      ctx.fillRect(-6, -8, 4, 6);
    } else {
      // Generic enemy
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();

      // Simple face
      ctx.fillStyle = "#000";
      ctx.fillRect(-3, -3, 1, 1);
      ctx.fillRect(2, -3, 1, 1);
    }
  }
}

// Pickup class
class Pickup extends Entity {
  constructor(x, y, type, value) {
    super(x, y);

    this.type = type;
    this.value = value;
    this.size = 8;
    this.radius = 16; // Larger pickup radius

    // Visual properties
    this.pulseTime = 0;
    this.floatOffset = Math.random() * Math.PI * 2;
    this.lifetime = 30; // 30 seconds before despawn

    // Movement towards player
    this.magnetRange = 80;
    this.magnetSpeed = 100;

    this.setAppearance();
  }

  setAppearance() {
    switch (this.type) {
      case "xp":
        this.color = "#3498db";
        this.spriteId = "pickup_xp";
        break;
      case "gold":
        this.color = "#f1c40f";
        this.spriteId = "pickup_gold";
        break;
      case "health":
        this.color = "#e74c3c";
        this.spriteId = "pickup_health";
        break;
      case "powerup":
        this.color = "#9b59b6";
        this.spriteId = "pickup_powerup";
        break;
      default:
        this.color = "#ffffff";
        this.spriteId = "pickup_generic";
    }
  }

  update(deltaTime) {
    // Update lifetime
    this.lifetime -= deltaTime;
    if (this.lifetime <= 0) {
      this.shouldRemove = true;
      return;
    }

    // Pulsing animation
    this.pulseTime += deltaTime * 3;
    this.scale = 1.0 + Math.sin(this.pulseTime) * 0.2;

    // Floating animation
    this.y += Math.sin(this.pulseTime + this.floatOffset) * 10 * deltaTime;

    // Magnet effect towards player
    if (window.gameEngine && window.gameEngine.player) {
      const player = window.gameEngine.player;
      const distance = this.getDistance(player);

      if (distance <= this.magnetRange) {
        const angle = this.getAngleTo(player);
        this.vx = Math.cos(angle) * this.magnetSpeed;
        this.vy = Math.sin(angle) * this.magnetSpeed;
      }
    }

    super.update(deltaTime);
  }

  draw(ctx) {
    // Fade out near end of lifetime
    if (this.lifetime < 5) {
      ctx.globalAlpha *= this.lifetime / 5;
    }

    const spriteId = this.spriteId;

    if (spriteManager.getSprite(spriteId)) {
      spriteManager.drawSprite(
        ctx,
        spriteId,
        -this.size,
        -this.size,
        this.size * 2,
        this.size * 2
      );
    } else {
      // Fallback rendering
      this.drawFallback(ctx);
    }
  }

  drawFallback(ctx) {
    ctx.fillStyle = this.color;

    switch (this.type) {
      case "xp":
        // XP gem
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size * 0.7, -this.size * 0.3);
        ctx.lineTo(this.size * 0.7, this.size * 0.3);
        ctx.lineTo(0, this.size);
        ctx.lineTo(-this.size * 0.7, this.size * 0.3);
        ctx.lineTo(-this.size * 0.7, -this.size * 0.3);
        ctx.closePath();
        ctx.fill();
        break;

      case "gold":
        // Gold coin
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Shekel symbol
        ctx.fillStyle = "#d4af37";
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("₪", 0, 0);
        break;

      case "health":
        // Health cross
        ctx.fillRect(
          -this.size * 0.3,
          -this.size,
          this.size * 0.6,
          this.size * 2
        );
        ctx.fillRect(
          -this.size,
          -this.size * 0.3,
          this.size * 2,
          this.size * 0.6
        );
        break;

      default:
        // Generic orb
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
  }
}

// Projectile class
class Projectile extends Entity {
  constructor(x, y, angle, speed, damage, projectileData = {}) {
    super(x, y);

    this.angle = angle;
    this.speed = speed;
    this.damage = damage;
    this.size = projectileData.size || 4;
    this.radius = this.size;

    // Movement
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    // Properties
    this.piercing = projectileData.piercing || false;
    this.pierceCount = projectileData.pierceCount || 0;
    this.lifetime = projectileData.lifetime || 5.0;
    this.homing = projectileData.homing || false;
    this.homingStrength = projectileData.homingStrength || 0.1;

    // Visual
    this.color = projectileData.color || "#ffff00";
    this.trail = projectileData.trail || false;
    this.trailPoints = [];
    this.rotation = angle;

    // Weapon type for sprite
    this.weaponType = projectileData.weaponType || "generic";

    // Two-frame animator for weapon sprites
    this.animator = new FrameAnimator();
    this.animator.setSequence([0, 1], 12, "weaponLoop");
  }

  update(deltaTime) {
    // Update lifetime
    this.lifetime -= deltaTime;
    if (this.lifetime <= 0) {
      this.shouldRemove = true;
      return;
    }

    // Homing behavior
    if (this.homing && window.gameEngine) {
      const nearestEnemy = window.gameEngine.getNearestEnemy(
        this.x,
        this.y,
        200
      );
      if (nearestEnemy) {
        const targetAngle = this.getAngleTo(nearestEnemy);
        const angleDiff = targetAngle - this.angle;

        // Normalize angle difference
        let normalizedDiff = angleDiff;
        while (normalizedDiff > Math.PI) normalizedDiff -= Math.PI * 2;
        while (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2;

        this.angle += normalizedDiff * this.homingStrength * deltaTime;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.rotation = this.angle;
      }
    }

    // Trail effect
    if (this.trail) {
      this.trailPoints.push({ x: this.x, y: this.y, alpha: 1.0 });

      // Update trail points
      for (let i = this.trailPoints.length - 1; i >= 0; i--) {
        this.trailPoints[i].alpha -= deltaTime * 3;
        if (this.trailPoints[i].alpha <= 0) {
          this.trailPoints.splice(i, 1);
        }
      }

      // Limit trail length
      while (this.trailPoints.length > 10) {
        this.trailPoints.shift();
      }
    }

    // Update weapon animation
    this.animator.update(deltaTime);
    this.animationFrame = this.animator.getFrame();

    super.update(deltaTime);

    // Remove if off screen
    const margin = 100;
    if (
      Math.abs(this.x) > GAME_CONFIG.CANVAS_WIDTH + margin ||
      Math.abs(this.y) > GAME_CONFIG.CANVAS_HEIGHT + margin
    ) {
      this.shouldRemove = true;
    }
  }

  render(ctx) {
    // Render trail
    if (this.trail && this.trailPoints.length > 1) {
      ctx.save();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.size * 0.5;

      for (let i = 0; i < this.trailPoints.length - 1; i++) {
        const point = this.trailPoints[i];
        const nextPoint = this.trailPoints[i + 1];

        ctx.globalAlpha = point.alpha * 0.5;
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(nextPoint.x, nextPoint.y);
        ctx.stroke();
      }

      ctx.restore();
    }

    // Render projectile
    super.render(ctx);
  }

  draw(ctx) {
    // Draw projectile based on weapon type
    switch (this.weaponType) {
      case "magic_wand":
        this.drawCactusFruit(ctx);
        break;
      case "runetracer":
        this.drawChair(ctx);
        break;
      case "king_bible":
        this.drawChicken(ctx);
        break;
      case "axe":
        this.drawPita(ctx);
        break;
      case "knife":
        this.drawStarOfDavid(ctx);
        break;
      default:
        this.drawGeneric(ctx);
    }
  }

  drawCactusFruit(ctx) {
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Spikes
    ctx.fillStyle = "#2d3436";
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const x = Math.cos(angle) * this.size * 0.8;
      const y = Math.sin(angle) * this.size * 0.8;
      ctx.fillRect(x - 0.5, y - 1.5, 1, 3);
    }
  }

  drawChair(ctx) {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;

    // Simplified chair
    ctx.fillRect(
      -this.size * 0.8,
      -this.size * 0.6,
      this.size * 1.6,
      this.size * 0.8
    );
    ctx.strokeRect(
      -this.size * 0.8,
      -this.size * 0.6,
      this.size * 1.6,
      this.size * 0.8
    );

    ctx.fillRect(
      -this.size * 0.8,
      -this.size,
      this.size * 1.6,
      this.size * 0.4
    );
    ctx.strokeRect(
      -this.size * 0.8,
      -this.size,
      this.size * 1.6,
      this.size * 0.4
    );
  }

  drawChicken(ctx) {
    ctx.fillStyle = "#ffffff";

    // Chicken body
    ctx.beginPath();
    ctx.arc(0, 0, this.size * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(
      -this.size * 0.6,
      -this.size * 0.4,
      this.size * 0.4,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Beak
    ctx.fillStyle = "#ffa502";
    ctx.fillRect(
      -this.size,
      -this.size * 0.5,
      this.size * 0.3,
      this.size * 0.2
    );
  }

  drawPita(ctx) {
    ctx.fillStyle = "#deb887";

    // Circular pita
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Pocket opening
    ctx.fillStyle = "#8b7355";
    ctx.fillRect(
      -this.size * 0.5,
      -this.size * 0.2,
      this.size,
      this.size * 0.4
    );
  }

  drawStarOfDavid(ctx) {
    ctx.fillStyle = "#0038b8";

    // Two triangles forming star
    ctx.beginPath();
    ctx.moveTo(0, -this.size);
    ctx.lineTo(this.size * 0.8, this.size * 0.4);
    ctx.lineTo(-this.size * 0.8, this.size * 0.4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, this.size);
    ctx.lineTo(-this.size * 0.8, -this.size * 0.4);
    ctx.lineTo(this.size * 0.8, -this.size * 0.4);
    ctx.closePath();
    ctx.fill();
  }

  drawGeneric(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Export entities
window.Entity = Entity;
window.Player = Player;
window.Enemy = Enemy;
window.Pickup = Pickup;
window.Projectile = Projectile;
