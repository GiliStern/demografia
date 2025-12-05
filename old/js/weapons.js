// Weapon system for Hebrew Vampire Survivors

class WeaponSystem {
  constructor() {
    this.activeWeapons = [];
    this.weaponInstances = new Map();
  }

  addWeapon(weaponId, player) {
    const weaponData = getWeapons()[weaponId];
    if (!weaponData) {
      console.error("Weapon not found:", weaponId);
      return;
    }

    // Check if weapon already exists - upgrade it instead
    const existingWeapon = this.weaponInstances.get(weaponId);
    if (existingWeapon) {
      existingWeapon.upgrade();
      console.log("Upgraded weapon:", weaponId);
      return;
    }

    // Create new weapon instance
    const weapon = this.createWeaponInstance(weaponId, weaponData, player);
    this.weaponInstances.set(weaponId, weapon);
    this.activeWeapons.push(weapon);

    console.log("Added weapon:", weaponId);
  }

  createWeaponInstance(weaponId, weaponData, player) {
    switch (weaponId) {
      case "magic_wand":
        return new CactusWeapon(weaponData, player);
      case "runetracer":
        return new ChairWeapon(weaponData, player);
      case "king_bible":
        return new ChickenWeapon(weaponData, player);
      case "axe":
        return new PitaWeapon(weaponData, player);
      case "knife":
        return new StarWeapon(weaponData, player);
      default:
        return new BasicWeapon(weaponData, player, weaponId);
    }
  }

  update(deltaTime) {
    for (const weapon of this.activeWeapons) {
      weapon.update(deltaTime);
    }
  }

  removeWeapon(weaponId) {
    const weapon = this.weaponInstances.get(weaponId);
    if (weapon) {
      const index = this.activeWeapons.indexOf(weapon);
      if (index > -1) {
        this.activeWeapons.splice(index, 1);
      }
      this.weaponInstances.delete(weaponId);
    }
  }

  getWeapon(weaponId) {
    return this.weaponInstances.get(weaponId);
  }

  getAllWeapons() {
    return [...this.activeWeapons];
  }

  clear() {
    this.activeWeapons = [];
    this.weaponInstances.clear();
  }
}

// Base weapon class
class BaseWeapon {
  constructor(weaponData, player, weaponId) {
    this.weaponData = weaponData;
    this.player = player;
    this.weaponId = weaponId;

    // Weapon stats
    this.level = 1;
    this.maxLevel = 8;
    this.damage = 10;
    this.area = 1.0;
    this.speed = 1.0;
    this.duration = 1.0;
    this.amount = 1;
    this.cooldown = 1.0;
    this.knockback = 10;

    // Internal timing
    this.cooldownTimer = 0;
    this.lastFireTime = 0;

    // Evolution
    this.canEvolve = false;
    this.evolutionRequirements = [];

    this.initializeStats();
  }

  initializeStats() {
    // Override in subclasses to set specific weapon stats
    this.baseCooldown = this.cooldown;
  }

  update(deltaTime) {
    // Update cooldown
    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= deltaTime;
    }

    // Check if weapon can fire
    if (this.cooldownTimer <= 0) {
      this.fire();
      this.cooldownTimer = this.getActualCooldown();
    }

    // Update weapon-specific logic
    this.updateWeapon(deltaTime);
  }

  updateWeapon(deltaTime) {
    // Override in subclasses for weapon-specific updates
  }

  fire() {
    // Override in subclasses
    console.log("Base weapon fired");
  }

  upgrade() {
    if (this.level >= this.maxLevel) {
      console.log("Weapon at max level:", this.weaponId);
      return;
    }

    this.level++;
    this.applyLevelUpgrade();

    // Check for evolution
    this.checkEvolution();

    console.log(`${this.weaponId} upgraded to level ${this.level}`);
  }

  applyLevelUpgrade() {
    // Base upgrades that apply to most weapons
    switch (this.level) {
      case 2:
        this.damage *= 1.2;
        break;
      case 3:
        this.area *= 1.2;
        break;
      case 4:
        this.cooldown *= 0.9;
        break;
      case 5:
        this.amount += 1;
        break;
      case 6:
        this.damage *= 1.3;
        break;
      case 7:
        this.speed *= 1.2;
        break;
      case 8:
        this.damage *= 1.5;
        this.amount += 1;
        break;
    }
  }

  checkEvolution() {
    if (this.level >= 8 && this.canEvolve) {
      // Check if evolution requirements are met
      if (this.checkEvolutionRequirements()) {
        this.evolve();
      }
    }
  }

  checkEvolutionRequirements() {
    // Check if player has required passive items
    // This would need to be implemented with passive tracking
    return false; // Simplified for now
  }

  evolve() {
    console.log("Weapon evolved:", this.weaponId);
    // Evolution logic would go here
  }

  getActualCooldown() {
    return this.cooldown * this.player.cooldownMultiplier;
  }

  getActualDamage() {
    return this.damage * this.player.damageMultiplier;
  }

  getActualArea() {
    return this.area * this.player.areaMultiplier;
  }

  createProjectile(x, y, angle, additionalData = {}) {
    const projectileData = {
      size: 6 * this.getActualArea(),
      lifetime: this.duration,
      weaponType: this.weaponId,
      ...additionalData,
    };

    const projectile = new Projectile(
      x,
      y,
      angle,
      200 * this.speed,
      this.getActualDamage(),
      projectileData
    );

    // Add to game
    if (window.gameEngine) {
      window.gameEngine.addProjectile(projectile);
    }

    // Play weapon sound
    const audioManager = getAudioManager();
    if (audioManager) {
      // Use specific sounds for different weapon types
      switch (this.weaponId) {
        case "magic_wand":
          audioManager.playSound("cactus_hit", 0.3, MathUtils.random(0.9, 1.1));
          break;
        case "runetracer":
          audioManager.playSound(
            "chair_throw",
            0.4,
            MathUtils.random(0.8, 1.2)
          );
          break;
        case "king_bible":
          audioManager.playSound(
            "chicken_flap",
            0.2,
            MathUtils.random(0.9, 1.1)
          );
          break;
        default:
          audioManager.playWeaponFire();
          break;
      }
    }

    return projectile;
  }

  getRandomDirection() {
    return Math.random() * Math.PI * 2;
  }

  getDirectionToNearestEnemy() {
    if (!window.gameEngine) return this.getRandomDirection();

    const nearestEnemy = window.gameEngine.getNearestEnemy(
      this.player.x,
      this.player.y,
      300
    );

    if (nearestEnemy) {
      return this.player.getAngleTo(nearestEnemy);
    }

    return this.getRandomDirection();
  }
}

// Cactus Weapon (Magic Wand replacement)
class CactusWeapon extends BaseWeapon {
  initializeStats() {
    this.damage = 15;
    this.cooldown = 0.8;
    this.speed = 1.2;
    this.baseCooldown = this.cooldown;
  }

  fire() {
    const direction = this.getDirectionToNearestEnemy();

    for (let i = 0; i < this.amount; i++) {
      const spread = this.amount > 1 ? (i - (this.amount - 1) / 2) * 0.3 : 0;
      const angle = direction + spread;

      this.createProjectile(this.player.x, this.player.y, angle, {
        piercing: this.level >= 6,
        pierceCount: this.level >= 6 ? 2 : 0,
      });
    }
  }
}

// Chair Weapon (Runetracer replacement)
class ChairWeapon extends BaseWeapon {
  initializeStats() {
    this.damage = 12;
    this.cooldown = 1.2;
    this.speed = 0.8;
    this.amount = 2;
    this.baseCooldown = this.cooldown;
  }

  fire() {
    const direction = this.getDirectionToNearestEnemy();

    for (let i = 0; i < this.amount; i++) {
      const angle = direction + (i * Math.PI * 2) / this.amount;

      this.createProjectile(this.player.x, this.player.y, angle, {
        boomerang: true,
        lifetime: 3.0,
        piercing: true,
        pierceCount: 5,
      });
    }
  }
}

// Chicken Weapon (King Bible replacement)
class ChickenWeapon extends BaseWeapon {
  constructor(weaponData, player, weaponId) {
    super(weaponData, player, weaponId);
    this.orbitingChickens = [];
    this.orbitRadius = 80;
    this.orbitSpeed = 2.0;
  }

  initializeStats() {
    this.damage = 8;
    this.cooldown = 0.1; // Constant damage
    this.amount = 3;
    this.baseCooldown = this.cooldown;
  }

  updateWeapon(deltaTime) {
    // Update orbiting chickens
    for (let i = 0; i < this.amount; i++) {
      const angle =
        performance.now() * 0.001 * this.orbitSpeed +
        (i * Math.PI * 2) / this.amount;
      const x =
        this.player.x +
        Math.cos(angle) * this.orbitRadius * this.getActualArea();
      const y =
        this.player.y +
        Math.sin(angle) * this.orbitRadius * this.getActualArea();

      // Check for enemy collisions
      if (window.gameEngine) {
        const nearbyEnemies = window.gameEngine.getEntitiesInRange(
          x,
          y,
          20,
          (entity) => entity instanceof Enemy
        );

        for (const enemy of nearbyEnemies) {
          enemy.takeDamage(this.getActualDamage() * deltaTime * 2);

          // Visual effect
          if (window.gameEngine.particleSystem) {
            window.gameEngine.particleSystem.createHitParticles(
              enemy.x,
              enemy.y
            );
          }
        }
      }
    }
  }

  fire() {
    // This weapon doesn't fire projectiles, it orbits
  }

  render(ctx) {
    // Render orbiting chickens
    ctx.save();

    for (let i = 0; i < this.amount; i++) {
      const angle =
        performance.now() * 0.001 * this.orbitSpeed +
        (i * Math.PI * 2) / this.amount;
      const x =
        this.player.x +
        Math.cos(angle) * this.orbitRadius * this.getActualArea();
      const y =
        this.player.y +
        Math.sin(angle) * this.orbitRadius * this.getActualArea();

      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 2);

      // Draw chicken
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      // Chicken head
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(-6, -4, 4, 0, Math.PI * 2);
      ctx.fill();

      // Beak
      ctx.fillStyle = "#ffa502";
      ctx.fillRect(-8, -5, 3, 2);

      ctx.resetTransform();
    }

    ctx.restore();
  }
}

// Pita Weapon (Axe replacement)
class PitaWeapon extends BaseWeapon {
  initializeStats() {
    this.damage = 20;
    this.cooldown = 1.5;
    this.speed = 0.6;
    this.area = 1.5;
    this.baseCooldown = this.cooldown;
  }

  fire() {
    const direction = this.getDirectionToNearestEnemy();

    for (let i = 0; i < this.amount; i++) {
      const spread = this.amount > 1 ? (i - (this.amount - 1) / 2) * 0.5 : 0;
      const angle = direction + spread;

      this.createProjectile(this.player.x, this.player.y, angle, {
        size: 12 * this.getActualArea(),
        arc: true,
        arcHeight: 100,
        gravity: 200,
      });
    }
  }
}

// Star of David Weapon (Knife replacement)
class StarWeapon extends BaseWeapon {
  initializeStats() {
    this.damage = 8;
    this.cooldown = 0.3;
    this.speed = 2.0;
    this.amount = 3;
    this.baseCooldown = this.cooldown;
  }

  fire() {
    const baseDirection = this.getDirectionToNearestEnemy();

    for (let i = 0; i < this.amount; i++) {
      const angle = baseDirection + (i - 1) * 0.2;

      this.createProjectile(this.player.x, this.player.y, angle, {
        speed: 300 * this.speed,
        piercing: true,
        pierceCount: 3,
        trail: true,
      });
    }
  }
}

// Basic weapon for fallback
class BasicWeapon extends BaseWeapon {
  initializeStats() {
    this.damage = 10;
    this.cooldown = 1.0;
    this.speed = 1.0;
    this.baseCooldown = this.cooldown;
  }

  fire() {
    const direction = this.getDirectionToNearestEnemy();

    this.createProjectile(this.player.x, this.player.y, direction);
  }
}

// Enemy Spawner system
class EnemySpawner {
  constructor() {
    this.spawnTimer = 0;
    this.spawnRate = 2.0; // enemies per second
    this.maxEnemies = GAME_CONFIG.GAMEPLAY.MAX_ENEMIES;
    this.difficultyMultiplier = 1.0;
    this.stageData = null;
    this.spawnDistance = 400;

    // Wave system
    this.currentWave = 1;
    this.waveTimer = 0;
    this.waveDuration = 60; // 1 minute per wave
    this.bossSpawned = false;
  }

  initialize(stageData) {
    this.stageData = stageData;
    this.reset();
  }

  reset() {
    this.spawnTimer = 0;
    this.currentWave = 1;
    this.waveTimer = 0;
    this.bossSpawned = false;
  }

  update(deltaTime, playerX, playerY) {
    if (!this.stageData || !window.gameEngine) return;

    // Update wave timer
    this.waveTimer += deltaTime;
    if (this.waveTimer >= this.waveDuration) {
      this.currentWave++;
      this.waveTimer = 0;
      this.bossSpawned = false;
      console.log("Wave", this.currentWave, "started");
    }

    // Update spawn timer
    this.spawnTimer += deltaTime;

    const actualSpawnRate = this.spawnRate * this.difficultyMultiplier;
    const spawnInterval = 1.0 / actualSpawnRate;

    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer = 0;

      // Check enemy count
      if (window.gameEngine.enemies.length < this.maxEnemies) {
        this.spawnEnemy(playerX, playerY);
      }
    }

    // Spawn boss at end of wave
    if (!this.bossSpawned && this.waveTimer >= this.waveDuration - 10) {
      this.spawnBoss(playerX, playerY);
      this.bossSpawned = true;
    }
  }

  spawnEnemy(playerX, playerY) {
    // Select enemy type based on current wave and stage
    const enemyData = this.selectEnemyType();

    // Find spawn position
    const spawnPos = this.getSpawnPosition(playerX, playerY);

    // Create enemy
    const enemy = new Enemy(spawnPos.x, spawnPos.y, enemyData);

    // Apply difficulty scaling
    enemy.health *= this.difficultyMultiplier;
    enemy.damage *= Math.sqrt(this.difficultyMultiplier);
    enemy.moveSpeed *= 1 + (this.difficultyMultiplier - 1) * 0.5;

    // Add to game
    window.gameEngine.addEntity(enemy);
  }

  spawnBoss(playerX, playerY) {
    const bossData = this.selectBossType();
    if (!bossData) return;

    const spawnPos = this.getSpawnPosition(playerX, playerY, true);
    const boss = new Enemy(spawnPos.x, spawnPos.y, bossData);

    // Boss scaling
    boss.health *= 10 * this.difficultyMultiplier;
    boss.damage *= 2;
    boss.size *= 1.5;
    boss.xpReward *= 5;
    boss.isBoss = true;

    window.gameEngine.addEntity(boss);

    console.log("Boss spawned:", bossData.name_he);
  }

  selectEnemyType() {
    const commonEnemies = this.stageData.enemies_common || [];
    const minibosses = this.stageData.minibosses || [];

    // Higher chance for minibosses in later waves
    const minibossChance = Math.min(0.3, this.currentWave * 0.05);

    if (minibosses.length > 0 && Math.random() < minibossChance) {
      return MathUtils.randomChoice(minibosses);
    } else if (commonEnemies.length > 0) {
      return MathUtils.randomChoice(commonEnemies);
    }

    // Fallback enemy
    return {
      id: "generic_enemy",
      name_he: "אויב כללי",
      health: 10,
      damage: 5,
      speed: 50,
    };
  }

  selectBossType() {
    const bosses = this.stageData.bosses || [];
    if (bosses.length === 0) return null;

    return MathUtils.randomChoice(bosses);
  }

  getSpawnPosition(playerX, playerY, isBoss = false) {
    const distance = isBoss ? this.spawnDistance * 1.5 : this.spawnDistance;
    const angle = Math.random() * Math.PI * 2;

    return {
      x: playerX + Math.cos(angle) * distance,
      y: playerY + Math.sin(angle) * distance,
    };
  }

  setDifficultyMultiplier(multiplier) {
    this.difficultyMultiplier = multiplier;
  }

  getCurrentWave() {
    return this.currentWave;
  }

  getWaveProgress() {
    return this.waveTimer / this.waveDuration;
  }
}

// Export weapon classes
window.WeaponSystem = WeaponSystem;
window.BaseWeapon = BaseWeapon;
window.CactusWeapon = CactusWeapon;
window.ChairWeapon = ChairWeapon;
window.ChickenWeapon = ChickenWeapon;
window.PitaWeapon = PitaWeapon;
window.StarWeapon = StarWeapon;
window.BasicWeapon = BasicWeapon;
window.EnemySpawner = EnemySpawner;
