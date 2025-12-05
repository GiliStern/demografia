import { MathUtils } from './utils';
import { GAME_CONFIG, getWeapons } from './config';

class WeaponSystemTS {
  activeWeapons: BaseWeaponTS[] = [];
  weaponInstances = new Map<string, BaseWeaponTS>();

  addWeapon(weaponId: string, player: any): void {
    const weaponData = (getWeapons() as any)[weaponId];
    if (!weaponData) { console.error('Weapon not found:', weaponId); return; }
    const existing = this.weaponInstances.get(weaponId);
    if (existing) { existing.upgrade(); console.log('Upgraded weapon:', weaponId); return; }
    const weapon = this.createWeaponInstance(weaponId, weaponData, player);
    this.weaponInstances.set(weaponId, weapon);
    this.activeWeapons.push(weapon);
    console.log('Added weapon:', weaponId);
  }

  private createWeaponInstance(weaponId: string, weaponData: any, player: any): BaseWeaponTS {
    switch (weaponId) {
      case 'magic_wand': return new CactusWeaponTS(weaponData, player, weaponId);
      case 'runetracer': return new ChairWeaponTS(weaponData, player, weaponId);
      case 'king_bible': return new ChickenWeaponTS(weaponData, player, weaponId);
      case 'axe': return new PitaWeaponTS(weaponData, player, weaponId);
      case 'knife': return new StarWeaponTS(weaponData, player, weaponId);
      default: return new BasicWeaponTS(weaponData, player, weaponId);
    }
  }

  update(deltaTime: number): void { for (const w of this.activeWeapons) w.update(deltaTime); }
  removeWeapon(weaponId: string): void { const w = this.weaponInstances.get(weaponId); if (!w) return; const i = this.activeWeapons.indexOf(w); if (i > -1) this.activeWeapons.splice(i, 1); this.weaponInstances.delete(weaponId); }
  getWeapon(weaponId: string): BaseWeaponTS | undefined { return this.weaponInstances.get(weaponId); }
  getAllWeapons(): BaseWeaponTS[] { return [...this.activeWeapons]; }
  clear(): void { this.activeWeapons = []; this.weaponInstances.clear(); }
}

class BaseWeaponTS {
  weaponData: any; player: any; weaponId: string;
  level = 1; maxLevel = 8; damage = 10; area = 1.0; speed = 1.0; duration = 1.0; amount = 1; cooldown = 1.0; knockback = 10;
  cooldownTimer = 0; lastFireTime = 0; baseCooldown = 1.0;
  canEvolve = false; evolutionRequirements: any[] = [];
  constructor(weaponData: any, player: any, weaponId: string) { this.weaponData = weaponData; this.player = player; this.weaponId = weaponId; this.initializeStats(); }
  protected initializeStats(): void { this.baseCooldown = this.cooldown; }
  update(deltaTime: number): void { if (this.cooldownTimer > 0) this.cooldownTimer -= deltaTime; if (this.cooldownTimer <= 0) { this.fire(); this.cooldownTimer = this.getActualCooldown(); } this.updateWeapon(deltaTime); }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected updateWeapon(_deltaTime: number): void { /* subclass-specific */ }
  protected fire(): void { console.log('Base weapon fired'); }
  upgrade(): void { if (this.level >= this.maxLevel) { console.log('Weapon at max level:', this.weaponId); return; } this.level++; this.applyLevelUpgrade(); this.checkEvolution(); console.log(`${this.weaponId} upgraded to level ${this.level}`); }
  protected applyLevelUpgrade(): void { switch (this.level) { case 2: this.damage *= 1.2; break; case 3: this.area *= 1.2; break; case 4: this.cooldown *= 0.9; break; case 5: this.amount += 1; break; case 6: this.damage *= 1.3; break; case 7: this.speed *= 1.2; break; case 8: this.damage *= 1.5; this.amount += 1; break; } }
  protected checkEvolution(): void { if (this.level >= 8 && this.canEvolve) { if (this.checkEvolutionRequirements()) this.evolve(); } }
  protected checkEvolutionRequirements(): boolean { return false; }
  protected evolve(): void { console.log('Weapon evolved:', this.weaponId); }
  protected getActualCooldown(): number { return this.cooldown * this.player.cooldownMultiplier; }
  protected getActualDamage(): number { return this.damage * this.player.damageMultiplier; }
  protected getActualArea(): number { return this.area * this.player.areaMultiplier; }
  protected createProjectile(x: number, y: number, angle: number, additionalData: any = {}): any {
    const projectileData = { size: 6 * this.getActualArea(), lifetime: this.duration, weaponType: this.weaponId, ...additionalData };
    const ProjectileCtor = (window as any).Projectile;
    const projectile = new ProjectileCtor(x, y, angle, 200 * this.speed, this.getActualDamage(), projectileData);
    if ((window as any).gameEngine) (window as any).gameEngine.addProjectile(projectile);
    const audio = (window as any).getAudioManager ? (window as any).getAudioManager() : null;
    if (audio) {
      switch (this.weaponId) {
        case 'magic_wand': audio.playSound('cactus_hit', 0.3, MathUtils.random(0.9, 1.1)); break;
        case 'runetracer': audio.playSound('chair_throw', 0.4, MathUtils.random(0.8, 1.2)); break;
        case 'king_bible': audio.playSound('chicken_flap', 0.2, MathUtils.random(0.9, 1.1)); break;
        default: audio.playWeaponFire(); break;
      }
    }
    return projectile;
  }
  protected getRandomDirection(): number { return Math.random() * Math.PI * 2; }
  protected getDirectionToNearestEnemy(): number {
    if (!(window as any).gameEngine) return this.getRandomDirection();
    const nearest = (window as any).gameEngine.getNearestEnemy(this.player.x, this.player.y, 300);
    if (nearest) return this.player.getAngleTo(nearest);
    return this.getRandomDirection();
  }
}

class CactusWeaponTS extends BaseWeaponTS {
  protected initializeStats(): void { this.damage = 15; this.cooldown = 0.8; this.speed = 1.2; this.baseCooldown = this.cooldown; }
  protected fire(): void { const dir = this.getDirectionToNearestEnemy(); for (let i = 0; i < this.amount; i++) { const spread = this.amount > 1 ? (i - (this.amount - 1) / 2) * 0.3 : 0; const angle = dir + spread; this.createProjectile(this.player.x, this.player.y, angle, { piercing: this.level >= 6, pierceCount: this.level >= 6 ? 2 : 0 }); } }
}

class ChairWeaponTS extends BaseWeaponTS {
  protected initializeStats(): void { this.damage = 12; this.cooldown = 1.2; this.speed = 0.8; this.amount = 2; this.baseCooldown = this.cooldown; }
  protected fire(): void { const dir = this.getDirectionToNearestEnemy(); for (let i = 0; i < this.amount; i++) { const angle = dir + (i * Math.PI * 2) / this.amount; this.createProjectile(this.player.x, this.player.y, angle, { boomerang: true, lifetime: 3.0, piercing: true, pierceCount: 5 }); } }
}

class ChickenWeaponTS extends BaseWeaponTS {
  private orbitingChickens: any[] = []; private orbitRadius = 80; private orbitSpeed = 2.0;
  protected initializeStats(): void { this.damage = 8; this.cooldown = 0.1; this.amount = 3; this.baseCooldown = this.cooldown; }
  protected updateWeapon(deltaTime: number): void {
    for (let i = 0; i < this.amount; i++) {
      const angle = performance.now() * 0.001 * this.orbitSpeed + (i * Math.PI * 2) / this.amount;
      const x = this.player.x + Math.cos(angle) * this.orbitRadius * this.getActualArea();
      const y = this.player.y + Math.sin(angle) * this.orbitRadius * this.getActualArea();
      if ((window as any).gameEngine) {
        const nearby = (window as any).gameEngine.getEntitiesInRange(x, y, 20, (entity: any) => entity instanceof (window as any).Enemy);
        for (const enemy of nearby) {
          enemy.takeDamage(this.getActualDamage() * deltaTime * 2);
          if ((window as any).gameEngine.particleSystem) (window as any).gameEngine.particleSystem.createHitParticles(enemy.x, enemy.y);
        }
      }
    }
  }
  protected fire(): void { /* orbiting only */ }
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (let i = 0; i < this.amount; i++) {
      const angle = performance.now() * 0.001 * this.orbitSpeed + (i * Math.PI * 2) / this.amount;
      const x = this.player.x + Math.cos(angle) * this.orbitRadius * this.getActualArea();
      const y = this.player.y + Math.sin(angle) * this.orbitRadius * this.getActualArea();
      ctx.translate(x, y); ctx.rotate(angle + Math.PI / 2);
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-6, -4, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffa502'; ctx.fillRect(-8, -5, 3, 2);
      ctx.resetTransform();
    }
    ctx.restore();
  }
}

class PitaWeaponTS extends BaseWeaponTS {
  protected initializeStats(): void { this.damage = 20; this.cooldown = 1.5; this.speed = 0.6; this.area = 1.5; this.baseCooldown = this.cooldown; }
  protected fire(): void { const dir = this.getDirectionToNearestEnemy(); for (let i = 0; i < this.amount; i++) { const spread = this.amount > 1 ? (i - (this.amount - 1) / 2) * 0.5 : 0; const angle = dir + spread; this.createProjectile(this.player.x, this.player.y, angle, { size: 12 * this.getActualArea(), arc: true, arcHeight: 100, gravity: 200 }); } }
}

class StarWeaponTS extends BaseWeaponTS {
  protected initializeStats(): void { this.damage = 8; this.cooldown = 0.3; this.speed = 2.0; this.amount = 3; this.baseCooldown = this.cooldown; }
  protected fire(): void { const base = this.getDirectionToNearestEnemy(); for (let i = 0; i < this.amount; i++) { const angle = base + (i - 1) * 0.2; this.createProjectile(this.player.x, this.player.y, angle, { speed: 300 * this.speed, piercing: true, pierceCount: 3, trail: true }); } }
}

class BasicWeaponTS extends BaseWeaponTS {
  protected initializeStats(): void { this.damage = 10; this.cooldown = 1.0; this.speed = 1.0; this.baseCooldown = this.cooldown; }
  protected fire(): void { const dir = this.getDirectionToNearestEnemy(); this.createProjectile(this.player.x, this.player.y, dir); }
}

class EnemySpawnerTS {
  spawnTimer = 0; spawnRate = 2.0; maxEnemies = GAME_CONFIG.GAMEPLAY.MAX_ENEMIES; difficultyMultiplier = 1.0; stageData: any = null; spawnDistance = 400;
  currentWave = 1; waveTimer = 0; waveDuration = 60; bossSpawned = false;
  initialize(stageData: any): void { this.stageData = stageData; this.reset(); }
  reset(): void { this.spawnTimer = 0; this.currentWave = 1; this.waveTimer = 0; this.bossSpawned = false; }
  update(deltaTime: number, playerX: number, playerY: number): void {
    if (!this.stageData || !(window as any).gameEngine) return;
    this.waveTimer += deltaTime; if (this.waveTimer >= this.waveDuration) { this.currentWave++; this.waveTimer = 0; this.bossSpawned = false; console.log('Wave', this.currentWave, 'started'); }
    this.spawnTimer += deltaTime; const actual = this.spawnRate * this.difficultyMultiplier; const interval = 1.0 / actual; if (this.spawnTimer >= interval) { this.spawnTimer = 0; if ((window as any).gameEngine.enemies.length < this.maxEnemies) this.spawnEnemy(playerX, playerY); }
    if (!this.bossSpawned && this.waveTimer >= this.waveDuration - 10) { this.spawnBoss(playerX, playerY); this.bossSpawned = true; }
  }
  spawnEnemy(playerX: number, playerY: number): void { const data = this.selectEnemyType(); const pos = this.getSpawnPosition(playerX, playerY); const EnemyCtor = (window as any).Enemy; const enemy = new EnemyCtor(pos.x, pos.y, data); enemy.health *= this.difficultyMultiplier; enemy.damage *= Math.sqrt(this.difficultyMultiplier); enemy.moveSpeed *= 1 + (this.difficultyMultiplier - 1) * 0.5; (window as any).gameEngine.addEntity(enemy); }
  spawnBoss(playerX: number, playerY: number): void { const data = this.selectBossType(); if (!data) return; const pos = this.getSpawnPosition(playerX, playerY, true); const EnemyCtor = (window as any).Enemy; const boss = new EnemyCtor(pos.x, pos.y, data); boss.health *= 10 * this.difficultyMultiplier; boss.damage *= 2; boss.size *= 1.5; boss.xpReward *= 5; boss.isBoss = true; (window as any).gameEngine.addEntity(boss); console.log('Boss spawned:', data.name_he); }
  private selectEnemyType(): any { const common = this.stageData.enemies_common || []; const minibosses = this.stageData.minibosses || []; const minibossChance = Math.min(0.3, this.currentWave * 0.05); if (minibosses.length > 0 && Math.random() < minibossChance) return MathUtils.randomChoice(minibosses); else if (common.length > 0) return MathUtils.randomChoice(common); return { id: 'generic_enemy', name_he: 'אויב כללי', health: 10, damage: 5, speed: 50 }; }
  private selectBossType(): any { const bosses = this.stageData.bosses || []; if (bosses.length === 0) return null; return MathUtils.randomChoice(bosses); }
  private getSpawnPosition(playerX: number, playerY: number, isBoss = false): { x: number; y: number } { const distance = isBoss ? this.spawnDistance * 1.5 : this.spawnDistance; const angle = Math.random() * Math.PI * 2; return { x: playerX + Math.cos(angle) * distance, y: playerY + Math.sin(angle) * distance }; }
  setDifficultyMultiplier(m: number): void { this.difficultyMultiplier = m; }
  getCurrentWave(): number { return this.currentWave; }
  getWaveProgress(): number { return this.waveTimer / this.waveDuration; }
}

declare global {
  interface Window {
    WeaponSystem: typeof WeaponSystemTS;
    BaseWeapon: typeof BaseWeaponTS;
    CactusWeapon: typeof CactusWeaponTS;
    ChairWeapon: typeof ChairWeaponTS;
    ChickenWeapon: typeof ChickenWeaponTS;
    PitaWeapon: typeof PitaWeaponTS;
    StarWeapon: typeof StarWeaponTS;
    BasicWeapon: typeof BasicWeaponTS;
    EnemySpawner: typeof EnemySpawnerTS;
  }
}

(window as any).WeaponSystem = WeaponSystemTS;
(window as any).BaseWeapon = BaseWeaponTS;
(window as any).CactusWeapon = CactusWeaponTS;
(window as any).ChairWeapon = ChairWeaponTS;
(window as any).ChickenWeapon = ChickenWeaponTS;
(window as any).PitaWeapon = PitaWeaponTS;
(window as any).StarWeapon = StarWeaponTS;
(window as any).BasicWeapon = BasicWeaponTS;
(window as any).EnemySpawner = EnemySpawnerTS;

export {};


