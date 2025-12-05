import { MathUtils, ScreenEffects, Performance, TimeUtils, Debug } from './utils';
import { GAME_CONFIG, getCharacters, getStages } from './config';

class GameEngineTS {
  canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D;
  running = false; lastTime = 0;
  player: any = null; entities: any[] = []; weapons: any[] = []; enemies: any[] = []; projectiles: any[] = []; pickups: any[] = []; particles: any[] = [];
  camera: any; collision: any; spawner: any; weaponSystem: any; particleSystem: any;
  gameTime = 0; gameStartTime = 0; maxGameTime = 30 * 60; difficultyMultiplier = 1.0; frameCount = 0; fpsDisplay = 0; currentStage: any = null; stageBackground = 'bg_tel_aviv';
  gameLoop: (t: number) => void;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas; const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('2D context not available'); this.ctx = ctx;
    this.camera = new (window as any).Camera();
    this.collision = new CollisionSystemTS();
    this.spawner = new (window as any).EnemySpawner();
    this.weaponSystem = new (window as any).WeaponSystem();
    this.particleSystem = new (window as any).ParticleSystem();
    this.setupCanvas(); this.setupGameLoop();
  }
  private setupCanvas(): void { this.canvas.width = GAME_CONFIG.CANVAS_WIDTH; this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT; this.ctx.imageSmoothingEnabled = false; this.ctx.textAlign = 'center'; this.ctx.textBaseline = 'middle'; }
  private setupGameLoop(): void {
    const gameLoop = (currentTime: number) => { if (this.running) { const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 1 / 30); this.lastTime = currentTime; this.update(deltaTime); this.render(); requestAnimationFrame(gameLoop); } };
    this.gameLoop = gameLoop as any;
  }
  startGame(characterId: string, stageId: string): void {
    console.log('Starting game with character:', characterId, 'stage:', stageId);
    this.resetGame(); this.createPlayer(characterId); this.loadStage(stageId); this.setupGameUI(); this.running = true; this.gameStartTime = performance.now(); this.lastTime = performance.now(); requestAnimationFrame(this.gameLoop);
    (window as any).getAudioManager?.()?.playGameplayMusic?.();
  }
  private resetGame(): void { this.gameTime = 0; this.entities = []; this.weapons = []; this.enemies = []; this.projectiles = []; this.pickups = []; this.particles = []; this.difficultyMultiplier = 1.0; this.camera.reset(); this.spawner.reset(); }
  private createPlayer(characterId: string): void {
    const characterData = getCharacters().find((c: any) => c.id === characterId); if (!characterData) { console.error('Character not found:', characterId); return; }
    const PlayerCtor = (window as any).Player;
    this.player = new PlayerCtor(this.canvas.width / 2, this.canvas.height / 2, characterData);
    try { const spriteId = `character_${characterData.id}`; if (characterData.id === 'sruLik' && (window as any).spriteManager) { (window as any).spriteManager.spriteMeta.set(spriteId, { frameCount: 4, frameCols: 4, frameRows: 1 }); (window as any).spriteManager.loadSpriteOverride(spriteId, 'hebrew_vampire_survivors_package/sprites/srulik.png').catch(() => { (window as any).spriteManager.spriteMeta.set(spriteId, { frameCount: 4 }); }); } } catch (err) { void err; }
    if ((window as any).game?.inputManager) { this.player.inputManager = (window as any).game.inputManager; console.log('InputManager connected to player'); } else { console.warn('InputManager not found - movement will not work'); }
    this.entities.push(this.player);
    if (characterData.starting_weapon_id) this.weaponSystem.addWeapon(characterData.starting_weapon_id, this.player);
    this.camera.setTarget(this.player);
  }
  private loadStage(stageId: string): void { const stageData = getStages().find((s: any) => s.id === stageId); if (!stageData) { console.error('Stage not found:', stageId); return; } this.currentStage = stageData; this.spawner.initialize(stageData); this.stageBackground = stageData.background || 'bg_tel_aviv'; console.log('Stage loaded:', stageId); }
  private setupGameUI(): void { try { if ((window as any).screenManager?.uiManager) (window as any).screenManager.uiManager.createHUD(this.getGameState()); } catch (e) { console.error('setupGameUI failed:', e); throw e; } }
  update(deltaTime: number): void {
    if (!this.running || !this.player) return; this.gameTime += deltaTime; if (this.gameTime >= this.maxGameTime) { this.endGame(true); return; } if (this.player.health <= 0) { this.endGame(false); return; }
    this.updateDifficulty();
    for (let i = this.entities.length - 1; i >= 0; i--) { const entity = this.entities[i]; entity.update?.(deltaTime); if (entity.shouldRemove) { this.entities.splice(i, 1); if (entity instanceof (window as any).Enemy) this.onEnemyDeath(entity); } }
    this.weaponSystem.update(deltaTime);
    for (let i = this.projectiles.length - 1; i >= 0; i--) { const p = this.projectiles[i]; p.update(deltaTime); if (p.shouldRemove) this.projectiles.splice(i, 1); }
    for (let i = this.pickups.length - 1; i >= 0; i--) { const pk = this.pickups[i]; pk.update(deltaTime); if (pk.shouldRemove) this.pickups.splice(i, 1); }
    this.particleSystem.update(deltaTime);
    this.spawner.update(deltaTime, this.player.x, this.player.y);
    this.handleCollisions();
    this.camera.update(deltaTime);
    ScreenEffects.update(deltaTime);
    this.updateUI();
    Performance.update(deltaTime); TimeUtils.update();
  }
  private updateDifficulty(): void { this.difficultyMultiplier = 1.0 + this.gameTime / 300; this.spawner.setDifficultyMultiplier(this.difficultyMultiplier); }
  private handleCollisions(): void {
    for (const enemy of this.enemies) {
      if (this.collision.checkCircleCollision(this.player, enemy)) {
        this.player.takeDamage(enemy.damage);
        const angle = MathUtils.angle(enemy.x, enemy.y, this.player.x, this.player.y); this.player.applyKnockback(angle, enemy.knockback || 50);
        ScreenEffects.shake(3, 0.1); (window as any).getAudioManager?.()?.playPlayerHurt?.();
      }
    }
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        if (this.collision.checkCircleCollision(projectile, enemy)) {
          const damage = projectile.damage * this.player.damageMultiplier; enemy.takeDamage(damage);
          this.showDamageNumber(enemy.x, enemy.y, damage); this.particleSystem.createHitParticles(enemy.x, enemy.y); (window as any).getAudioManager?.()?.playEnemyHit?.();
          if (!projectile.piercing) projectile.shouldRemove = true; else { projectile.pierceCount--; if (projectile.pierceCount <= 0) projectile.shouldRemove = true; }
          break;
        }
      }
    }
    for (let i = this.pickups.length - 1; i >= 0; i--) { const pickup = this.pickups[i]; if (this.collision.checkCircleCollision(this.player, pickup, GAME_CONFIG.GAMEPLAY.PICKUP_RANGE)) { this.collectPickup(pickup); this.pickups.splice(i, 1); } }
  }
  private collectPickup(pickup: any): void { switch (pickup.type) { case 'xp': this.player.gainXP(pickup.value); break; case 'gold': this.player.gainGold(pickup.value); break; case 'health': this.player.heal(pickup.value); break; case 'powerup': this.applyPowerup(pickup.powerupType); break; } const audio = (window as any).getAudioManager ? (window as any).getAudioManager() : null; if (audio) { switch (pickup.type) { case 'gold': audio.playSound('coin_collect', 0.6, MathUtils.random(0.9, 1.1)); break; case 'powerup': audio.playPowerup(); break; default: audio.playPickupItem(); break; } } this.particleSystem.createPickupParticles(pickup.x, pickup.y, pickup.type); }
  private applyPowerup(type: string): void { switch (type) { case 'damage_boost': this.player.applyTemporaryBuff('damage', 2.0, 30); break; case 'speed_boost': this.player.applyTemporaryBuff('speed', 1.5, 20); break; case 'invincibility': this.player.applyTemporaryBuff('invincible', 1, 5); break; } }
  private onEnemyDeath(enemy: any): void { this.player.gainXP(enemy.xpReward || 1); this.dropItems(enemy.x, enemy.y, enemy.dropTable); (window as any).saveSystem.updateSessionStats({ enemiesKilled: ((window as any).saveSystem.currentSession?.stats.enemiesKilled || 0) + 1 }); this.particleSystem.createDeathParticles(enemy.x, enemy.y); (window as any).getAudioManager?.()?.playEnemyDeath?.(); const idx = this.enemies.indexOf(enemy); if (idx > -1) this.enemies.splice(idx, 1); }
  private dropItems(x: number, y: number, dropTable: any): void { if (!dropTable) { if (Math.random() < 0.1) this.createPickup(x, y, 'gold', (window as any).MathUtils.randomInt(1, 5)); if (Math.random() < 0.05) this.createPickup(x, y, 'health', 10); return; } for (const drop of dropTable) { if (Math.random() < drop.chance) this.createPickup(x, y, drop.type, drop.value); } }
  private createPickup(x: number, y: number, type: string, value: number): void { const PickupCtor = (window as any).Pickup; const pickup = new PickupCtor(x, y, type, value); this.pickups.push(pickup); }
  private showDamageNumber(x: number, y: number, damage: number): void { const screenPos = this.camera.worldToScreen(x, y); (window as any).screenManager?.uiManager?.showDamageNumber(screenPos.x, screenPos.y, damage); }
  private updateUI(): void { (window as any).screenManager?.uiManager?.updateHUD(this.getGameState()); }
  private getGameState(): any { return { currentScreen: 'gameplay', player: this.player, gameTime: this.gameTime, entities: this.entities, enemies: this.enemies.length, difficultyMultiplier: this.difficultyMultiplier }; }
  render(): void {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0); this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save(); this.camera.apply(this.ctx); const shakeOffset = ScreenEffects.getShakeOffset(); this.ctx.translate(shakeOffset.x, shakeOffset.y);
    this.renderBackground(); this.renderEntities(); this.renderProjectiles(); this.renderPickups(); this.particleSystem.render(this.ctx); this.ctx.restore(); this.renderUI(); if (Debug.enabled) this.renderDebug();
  }
  private renderBackground(): void { const tileSize = 256; const startX = Math.floor((this.camera.x - this.canvas.width / 2) / tileSize) * tileSize - tileSize; const startY = Math.floor((this.camera.y - this.canvas.height / 2) / tileSize) * tileSize - tileSize; const endX = startX + this.canvas.width + tileSize * 3; const endY = startY + this.canvas.height + tileSize * 3; for (let x = startX; x < endX; x += tileSize) { for (let y = startY; y < endY; y += tileSize) { (window as any).spriteManager.drawSprite(this.ctx, this.stageBackground, x, y, tileSize, tileSize); } } }
  private renderEntities(): void { const sorted = [...this.entities].sort((a, b) => a.y - b.y); for (const e of sorted) e.render?.(this.ctx); }
  private renderProjectiles(): void { for (const p of this.projectiles) p.render?.(this.ctx); }
  private renderPickups(): void { for (const p of this.pickups) p.render?.(this.ctx); }
  private renderUI(): void { if (Debug.enabled) this.renderMiniMap(); }
  private renderMiniMap(): void { const miniMapSize = 150; const miniMapX = this.canvas.width - miniMapSize - 20; const miniMapY = 20; this.ctx.save(); this.ctx.fillStyle = 'rgba(0,0,0,0.7)'; this.ctx.fillRect(miniMapX, miniMapY, miniMapSize, miniMapSize); this.ctx.strokeStyle = '#fff'; this.ctx.lineWidth = 2; this.ctx.strokeRect(miniMapX, miniMapY, miniMapSize, miniMapSize); this.ctx.fillStyle = '#00ff00'; this.ctx.fillRect(miniMapX + miniMapSize / 2 - 2, miniMapY + miniMapSize / 2 - 2, 4, 4); this.ctx.fillStyle = '#ff0000'; const scale = miniMapSize / 1000; for (const enemy of this.enemies) { const ex = (enemy.x - this.player.x) * scale + miniMapSize / 2; const ey = (enemy.y - this.player.y) * scale + miniMapSize / 2; if (ex >= 0 && ex < miniMapSize && ey >= 0 && ey < miniMapSize) this.ctx.fillRect(miniMapX + ex - 1, miniMapY + ey - 1, 2, 2); } this.ctx.restore(); }
  private renderDebug(): void { this.ctx.save(); this.ctx.fillStyle = '#fff'; this.ctx.font = '12px monospace'; this.ctx.textAlign = 'left'; const info = [ `FPS: ${Performance.getFPS()}`, `Entities: ${this.entities.length}`, `Enemies: ${this.enemies.length}`, `Projectiles: ${this.projectiles.length}`, `Player: (${Math.round(this.player?.x || 0)}, ${Math.round(this.player?.y || 0)})`, `Time: ${TimeUtils.formatTime(this.gameTime)}`, `Difficulty: ${this.difficultyMultiplier.toFixed(2)}x` ]; for (let i = 0; i < info.length; i++) this.ctx.fillText(info[i], 10, 20 + i * 15); this.ctx.restore(); }
  endGame(victory: boolean): void { this.running = false; const stats = { victory, survivalTime: this.gameTime, enemiesKilled: (window as any).saveSystem.currentSession?.stats.enemiesKilled || 0, damageDealt: (window as any).saveSystem.currentSession?.stats.damageDealt || 0, experienceGained: this.player?.totalXPGained || 0, goldEarned: this.player?.goldEarned || 0 }; (window as any).screenManager?.endGame?.(victory, stats); console.log('Game ended:', victory ? 'Victory' : 'Defeat', stats); }
  pauseGame(): void { this.running = false; }
  resumeGame(): void { if (!this.running) { this.running = true; this.lastTime = performance.now(); requestAnimationFrame(this.gameLoop); } }
  addEntity(entity: any): void { this.entities.push(entity); if (entity instanceof (window as any).Enemy) this.enemies.push(entity); }
  addProjectile(projectile: any): void { this.projectiles.push(projectile); }
  getEntitiesInRange(x: number, y: number, range: number, filter: ((e: any) => boolean) | null = null): any[] { return this.entities.filter((e) => { if (filter && !filter(e)) return false; return MathUtils.distance(x, y, e.x, e.y) <= range; }); }
  getNearestEnemy(x: number, y: number, maxDistance = Infinity): any { let nearest: any = null; let d = maxDistance; for (const enemy of this.enemies) { const dist = MathUtils.distance(x, y, enemy.x, enemy.y); if (dist < d) { nearest = enemy; d = dist; } } return nearest; }
}

class CameraTS {
  x = 0; y = 0; target: any = null; smoothing = 1.0;
  setTarget(target: any): void { this.target = target; }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_deltaTime: number): void { if (this.target) { const tx = this.target.x; const ty = this.target.y; this.x = MathUtils.lerp(this.x, tx, this.smoothing); this.y = MathUtils.lerp(this.y, ty, this.smoothing); } }
  apply(ctx: CanvasRenderingContext2D): void { const canvas = ctx.canvas; ctx.translate(-this.x + canvas.width / 2, -this.y + canvas.height / 2); }
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } { const canvas = (this as any).ctx?.canvas || { width: GAME_CONFIG.CANVAS_WIDTH, height: GAME_CONFIG.CANVAS_HEIGHT }; return { x: worldX - this.x + canvas.width / 2, y: worldY - this.y + canvas.height / 2 }; }
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } { const canvas = (this as any).ctx?.canvas || { width: GAME_CONFIG.CANVAS_WIDTH, height: GAME_CONFIG.CANVAS_HEIGHT }; return { x: screenX + this.x - canvas.width / 2, y: screenY + this.y - canvas.height / 2 }; }
  reset(): void { this.x = 0; this.y = 0; this.target = null; }
}

class CollisionSystemTS {
  checkCircleCollision(obj1: any, obj2: any, customRadius: number | null = null): boolean { const r1 = customRadius || obj1.radius || obj1.size || 16; const r2 = obj2.radius || obj2.size || 16; const d = MathUtils.distance(obj1.x, obj1.y, obj2.x, obj2.y); return d <= r1 + r2; }
  checkRectCollision(obj1: any, obj2: any): boolean { const w1 = obj1.width || obj1.size * 2 || 32; const h1 = obj1.height || obj1.size * 2 || 32; const w2 = obj2.width || obj2.size * 2 || 32; const h2 = obj2.height || obj2.size * 2 || 32; return obj1.x < obj2.x + w2 && obj1.x + w1 > obj2.x && obj1.y < obj2.y + h2 && obj1.y + h1 > obj2.y; }
}

declare global { interface Window { GameEngine: typeof GameEngineTS; Camera: typeof CameraTS; CollisionSystem: typeof CollisionSystemTS; gameEngine: any; } }
(window as any).GameEngine = GameEngineTS;
(window as any).Camera = CameraTS;
(window as any).CollisionSystem = CollisionSystemTS;

export {};


