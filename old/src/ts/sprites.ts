import { getCharacters, getStages, getWeapons } from './config';

type SpriteMeta = {
  frameCount?: number | 'auto';
  frameCols?: number;
  frameRows?: number;
  frameWidth?: number;
  frameHeight?: number;
  hintFrames?: number;
};

class SpriteManagerTS {
  private sprites = new Map<string, HTMLImageElement | string>();
  private loadPromises = new Map<string, Promise<any>>();
  public spriteMeta = new Map<string, SpriteMeta>();
  private imageCache = new Map<string, HTMLImageElement>();
  private placeholderCanvas: HTMLCanvasElement;
  private placeholderContext: CanvasRenderingContext2D;

  constructor() {
    this.placeholderCanvas = document.createElement('canvas');
    const ctx = this.placeholderCanvas.getContext('2d');
    if (!ctx) throw new Error('2D context not available');
    this.placeholderContext = ctx;
    this.generatePlaceholderSprites();
  }

  private async generatePlaceholderSprites(): Promise<void> {
    // Characters → Enemies → Weapons → Items → UI → Backgrounds
    await this.generateCharacterSprites();
    await this.generateEnemySprites();
    await this.generateWeaponSprites();
    await this.generateItemSprites();
    await this.generateUISprites();
    await this.generateBackgroundSprites();
    console.log('All placeholder sprites generated');
  }

  attemptOverride(id: string, candidates: Array<string | null>, meta: SpriteMeta | null = null): void {
    const base = 'hebrew_vampire_survivors_package/';
    for (const rel of candidates.filter(Boolean) as string[]) {
      try {
        if (meta) this.spriteMeta.set(id, { ...(this.spriteMeta.get(id) || {}), ...meta });
        this.loadSpriteOverride(id, base + rel).catch(() => undefined);
      } catch {
        // continue
      }
    }
  }

  private async generateCharacterSprites(): Promise<void> {
    const characters = getCharacters();
    const size = 32;
    const frames = 4;
    for (let i = 0; i < characters.length; i++) {
      const character = characters[i];
      const dataUrl = this.createCharacterSprite(size, frames, i);
      this.sprites.set(`character_${character.id}`, dataUrl);
      this.spriteMeta.set(`character_${character.id}`, { frameCount: 4 });
      const portrait = this.createCharacterPortrait(64, i);
      this.sprites.set(`portrait_${character.id}`, portrait);
      const charId = character.id;
      const cid = `character_${charId}`;
      this.attemptOverride(
        cid,
        [
          `sprites/characters/${charId}.png`,
          `sprites/${charId}.png`,
          charId === 'sruLik' ? 'sprites/srulik.png' : null,
        ],
        { frameCount: 4, frameCols: 4, frameRows: 1 }
      );
    }
  }

  private createCharacterSprite(size: number, frames: number, characterIndex: number): string {
    this.placeholderCanvas.width = size * frames;
    this.placeholderCanvas.height = size;
    const ctx = this.placeholderContext;
    const colors = this.getCharacterColors(characterIndex);
    for (let frame = 0; frame < frames; frame++) {
      const x = frame * size;
      ctx.clearRect(x, 0, size, size);
      ctx.fillStyle = colors.shirt; ctx.fillRect(x + 8, 12, 16, 12);
      ctx.fillStyle = colors.skin; ctx.fillRect(x + 10, 4, 12, 10);
      ctx.fillStyle = colors.hair; ctx.fillRect(x + 9, 3, 14, 6);
      ctx.fillStyle = '#000'; ctx.fillRect(x + 12, 7, 2, 2); ctx.fillRect(x + 18, 7, 2, 2);
      ctx.fillStyle = colors.pants; ctx.fillRect(x + 10, 24, 6, 8); ctx.fillRect(x + 18, 24, 6, 8);
      if (frame % 2 === 1) {
        ctx.clearRect(x + 10, 24, 6, 8); ctx.clearRect(x + 18, 24, 6, 8);
        ctx.fillRect(x + 11, 24, 6, 8); ctx.fillRect(x + 17, 24, 6, 8);
      }
      if (characterIndex === 0) {
        ctx.fillStyle = '#8B4513'; ctx.fillRect(x + 4, 14, 3, 3);
        ctx.fillStyle = '#228B22'; ctx.fillRect(x + 4, 13, 3, 2);
      }
    }
    return this.placeholderCanvas.toDataURL();
  }

  private createCharacterPortrait(size: number, characterIndex: number): string {
    this.placeholderCanvas.width = size; this.placeholderCanvas.height = size;
    const ctx = this.placeholderContext; ctx.clearRect(0, 0, size, size);
    const colors = this.getCharacterColors(characterIndex);
    ctx.fillStyle = '#f0f0f0'; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = colors.skin; ctx.fillRect(16, 12, 32, 28);
    ctx.fillStyle = colors.hair; ctx.fillRect(14, 8, 36, 20);
    ctx.fillStyle = '#000'; ctx.fillRect(22, 20, 6, 6); ctx.fillRect(36, 20, 6, 6);
    ctx.fillStyle = '#000'; ctx.fillRect(28, 30, 8, 2);
    ctx.fillStyle = colors.shirt; ctx.fillRect(20, 48, 24, 16);
    return this.placeholderCanvas.toDataURL();
  }

  private getCharacterColors(index: number) {
    const schemes = [
      { skin: '#FDBCB4', hair: '#8B4513', shirt: '#0038b8', pants: '#ffffff' },
      { skin: '#F5DEB3', hair: '#000000', shirt: '#ff6b6b', pants: '#4ecdc4' },
      { skin: '#DEB887', hair: '#654321', shirt: '#45B7D1', pants: '#2D3436' },
    ];
    return schemes[index % schemes.length];
  }

  private generateEnemySprites(): Promise<void> {
    const stages = getStages();
    let enemyIndex = 0;
    for (const stage of stages) {
      const allEnemies = [...(stage.enemies_common || []), ...(stage.minibosses || []), ...(stage.bosses || [])];
      for (const enemy of allEnemies) {
        const dataUrl = this.createEnemySprite(32, 4, enemyIndex, enemy.name_he);
        this.sprites.set(`enemy_${enemy.id}`, dataUrl);
        this.spriteMeta.set(`enemy_${enemy.id}`, { frameCount: 4 });
        this.attemptOverride(`enemy_${enemy.id}`, [`sprites/${enemy.id}.png`, `sprites/enemies/${enemy.id}.png`], {
          frameCount: 4,
          frameCols: 4,
          frameRows: 1,
        });
        enemyIndex++;
      }
    }
    return Promise.resolve();
  }

  private createEnemySprite(size: number, frames: number, enemyIndex: number, nameHe: string): string {
    this.placeholderCanvas.width = size * frames;
    this.placeholderCanvas.height = size;
    const ctx = this.placeholderContext;
    const colors = this.getEnemyColors(enemyIndex, nameHe);
    for (let frame = 0; frame < frames; frame++) {
      const x = frame * size;
      ctx.clearRect(x, 0, size, size);
      if (nameHe.includes('חתול')) this.drawCat(ctx, x, colors);
      else if (nameHe.includes('טיקטוק')) this.drawTikToker(ctx, x, colors);
      else if (nameHe.includes('קורקינט')) this.drawScooter(ctx, x, colors);
      else if (nameHe.includes('תייר')) this.drawTourist(ctx, x, colors);
      else this.drawGenericEnemy(ctx, x, colors, frame);
    }
    return this.placeholderCanvas.toDataURL();
  }

  private drawCat(ctx: CanvasRenderingContext2D, x: number, colors: any) {
    ctx.fillStyle = colors.body; ctx.fillRect(x + 6, 16, 20, 12);
    ctx.fillRect(x + 8, 8, 16, 12); // head
    ctx.fillRect(x + 10, 6, 4, 4); ctx.fillRect(x + 18, 6, 4, 4); // ears
    ctx.fillStyle = '#00ff00'; ctx.fillRect(x + 12, 10, 2, 2); ctx.fillRect(x + 18, 10, 2, 2);
    ctx.fillStyle = colors.body; ctx.fillRect(x + 24, 14, 6, 3); // tail
  }
  private drawTikToker(ctx: CanvasRenderingContext2D, x: number, colors: any) {
    ctx.fillStyle = colors.skin; ctx.fillRect(x + 10, 6, 12, 10);
    ctx.fillStyle = colors.hair; ctx.fillRect(x + 8, 4, 16, 8);
    ctx.fillStyle = colors.shirt; ctx.fillRect(x + 8, 16, 16, 12);
    ctx.fillStyle = '#000'; ctx.fillRect(x + 4, 12, 6, 10);
    ctx.fillStyle = '#00ff00'; ctx.fillRect(x + 5, 13, 4, 8);
  }
  private drawScooter(ctx: CanvasRenderingContext2D, x: number, colors: any) {
    ctx.fillStyle = colors.body; ctx.fillRect(x + 4, 20, 24, 4);
    ctx.fillRect(x + 12, 8, 2, 12); ctx.fillRect(x + 8, 8, 8, 2);
    ctx.fillStyle = '#333'; ctx.fillRect(x + 2, 22, 6, 6); ctx.fillRect(x + 24, 22, 6, 6);
  }
  private drawTourist(ctx: CanvasRenderingContext2D, x: number, colors: any) {
    ctx.fillStyle = colors.skin; ctx.fillRect(x + 10, 8, 12, 10);
    ctx.fillStyle = colors.hat; ctx.fillRect(x + 8, 6, 16, 4);
    ctx.fillStyle = colors.shirt; ctx.fillRect(x + 8, 18, 16, 10);
    ctx.fillStyle = '#000'; ctx.fillRect(x + 4, 14, 6, 4);
    ctx.fillStyle = '#333'; ctx.fillRect(x + 5, 15, 4, 2);
  }
  private drawGenericEnemy(ctx: CanvasRenderingContext2D, x: number, colors: any, frame: number) {
    ctx.fillStyle = colors.skin; ctx.fillRect(x + 10, 6, 12, 10);
    ctx.fillStyle = colors.hair; ctx.fillRect(x + 9, 5, 14, 6);
    ctx.fillStyle = colors.shirt; ctx.fillRect(x + 8, 16, 16, 12);
    if (frame % 2 === 1) { ctx.fillRect(x + 6, 26, 6, 6); ctx.fillRect(x + 20, 26, 6, 6); }
    else { ctx.fillRect(x + 8, 26, 6, 6); ctx.fillRect(x + 18, 26, 6, 6); }
  }
  private getEnemyColors(index: number, nameHe: string) {
    if (nameHe.includes('חתול')) return { body: '#FF7F50', skin: '#FF7F50' };
    if (nameHe.includes('טיקטוק')) return { skin: '#FDBCB4', hair: '#ff1493', shirt: '#00ff00' };
    if (nameHe.includes('קורקינט')) return { body: '#87CEEB' };
    if (nameHe.includes('תייר')) return { skin: '#FDBCB4', hat: '#8B4513', shirt: '#FFD700' };
    const colors = [
      { skin: '#FDBCB4', hair: '#000', shirt: '#ff4757' },
      { skin: '#F5DEB3', hair: '#654321', shirt: '#5352ed' },
      { skin: '#DEB887', hair: '#8B4513', shirt: '#ff6348' },
    ];
    return colors[index % colors.length];
  }

  private async generateWeaponSprites(): Promise<void> {
    const weapons = getWeapons();
    let idx = 0;
    for (const [weaponId, weapon] of Object.entries<any>(weapons)) {
      const dataUrl = this.createWeaponSprite(32, 2, idx, weapon.name_he);
      this.sprites.set(`weapon_${weaponId}`, dataUrl);
      this.spriteMeta.set(`weapon_${weaponId}`, { frameCount: 2, frameCols: 2, frameRows: 1 });
      this.attemptOverride(`weapon_${weaponId}`, [`sprites/weapons/${weaponId}.png`, `sprites/${weaponId}.png`], {
        frameCount: 2,
        frameCols: 2,
        frameRows: 1,
      });
      idx++;
    }
  }

  private createWeaponSprite(size: number, frames: number, weaponIndex: number, nameHe: string): string {
    this.placeholderCanvas.width = size * frames; this.placeholderCanvas.height = size;
    const ctx = this.placeholderContext;
    for (let frame = 0; frame < frames; frame++) {
      const x = frame * size; ctx.clearRect(x, 0, size, size);
      if (nameHe.includes('צבר')) this.drawCactusFruit(ctx, x, frame);
      else if (nameHe.includes('כסאות')) this.drawChair(ctx, x);
      else if (nameHe.includes('כפרות')) this.drawChicken(ctx, x, frame);
      else if (nameHe.includes('פיתות')) this.drawPita(ctx, x, frame);
      else if (nameHe.includes('מגן דוד')) this.drawStarOfDavid(ctx, x);
      else this.drawGenericWeapon(ctx, x, weaponIndex);
    }
    return this.placeholderCanvas.toDataURL();
  }

  private drawCactusFruit(ctx: CanvasRenderingContext2D, x: number, frame: number) {
    ctx.fillStyle = '#ff6b6b'; ctx.fillRect(x + 12, 8, 8, 12);
    ctx.fillStyle = '#2d3436'; for (let i = 0; i < 6; i++) ctx.fillRect(x + 10 + i * 2, 6 + i, 1, 3);
    if (frame === 1) { ctx.translate(x + 16, 16); ctx.rotate(0.2); ctx.translate(-16, -16); }
  }
  private drawChair(ctx: CanvasRenderingContext2D, x: number) {
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1;
    ctx.fillRect(x + 8, 6, 16, 12); ctx.strokeRect(x + 8, 6, 16, 12);
    ctx.fillRect(x + 8, 16, 16, 4); ctx.strokeRect(x + 8, 16, 16, 4);
    ctx.fillRect(x + 10, 20, 2, 8); ctx.fillRect(x + 20, 20, 2, 8);
  }
  private drawChicken(ctx: CanvasRenderingContext2D, x: number, frame: number) {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 8, 12, 16, 12); ctx.fillRect(x + 6, 8, 8, 8);
    ctx.fillStyle = '#ffa502'; ctx.fillRect(x + 4, 10, 3, 2);
    ctx.fillStyle = '#ff3742'; ctx.fillRect(x + 8, 6, 6, 3);
    if (frame === 1) { ctx.fillStyle = '#f1f2f6'; ctx.fillRect(x + 12, 14, 8, 6); }
  }
  private drawPita(ctx: CanvasRenderingContext2D, x: number, frame: number) {
    ctx.fillStyle = '#deb887';
    ctx.beginPath(); ctx.arc(x + 16, 16, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8b7355'; ctx.fillRect(x + 12, 12, 8, 2);
    if (frame === 1) { ctx.translate(x + 16, 16); ctx.rotate(0.3); ctx.translate(-16, -16); }
  }
  private drawStarOfDavid(ctx: CanvasRenderingContext2D, x: number) {
    ctx.fillStyle = '#0038b8';
    ctx.beginPath(); ctx.moveTo(x + 16, 6); ctx.lineTo(x + 22, 18); ctx.lineTo(x + 10, 18); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 16, 26); ctx.lineTo(x + 10, 14); ctx.lineTo(x + 22, 14); ctx.closePath(); ctx.fill();
  }
  private drawGenericWeapon(ctx: CanvasRenderingContext2D, x: number, weaponIndex: number) {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];
    ctx.fillStyle = colors[weaponIndex % colors.length];
    ctx.fillRect(x + 12, 8, 4, 16); ctx.fillRect(x + 8, 12, 12, 4);
  }

  private async generateItemSprites(): Promise<void> {
    const pickups = (window as any).getPickups ? (window as any).getPickups() : {};
    let itemIndex = 0;
    for (const [itemId, pickup] of Object.entries<any>(pickups)) {
      const dataUrl = this.createItemSprite(32, itemIndex, pickup.name_he);
      this.sprites.set(`item_${itemId}`, dataUrl);
      itemIndex++;
    }
  }
  private createItemSprite(size: number, itemIndex: number, nameHe: string): string {
    this.placeholderCanvas.width = size; this.placeholderCanvas.height = size;
    const ctx = this.placeholderContext; ctx.clearRect(0, 0, size, size);
    if (nameHe.includes('חמין')) this.drawCholent(ctx);
    else if (nameHe.includes('בוחטה')) this.drawMoneyBag(ctx);
    else if (nameHe.includes("שק\"מ") || nameHe.includes("שק")) this.drawCandy(ctx);
    else this.drawGenericItem(ctx, itemIndex);
    return this.placeholderCanvas.toDataURL();
  }
  private drawCholent(ctx: CanvasRenderingContext2D) { ctx.fillStyle = '#8b4513'; ctx.fillRect(6, 16, 20, 12); ctx.fillStyle = '#654321'; ctx.fillRect(8, 18, 16, 6); ctx.fillStyle = '#d2691e'; for (let i = 0; i < 6; i++) ctx.fillRect(10 + (i % 3) * 4, 19 + Math.floor(i / 3) * 2, 2, 2); }
  private drawMoneyBag(ctx: CanvasRenderingContext2D) { ctx.fillStyle = '#8b4513'; ctx.fillRect(8, 12, 16, 14); ctx.fillStyle = '#654321'; ctx.fillRect(14, 8, 4, 6); ctx.fillStyle = '#ffd700'; ctx.font = '16px Arial'; ctx.textAlign = 'center'; ctx.fillText('₪', 16, 22); }
  private drawCandy(ctx: CanvasRenderingContext2D) { ctx.fillStyle = '#ff6b6b'; ctx.fillRect(10, 12, 12, 8); ctx.fillStyle = '#ff3742'; ctx.fillRect(8, 14, 4, 4); ctx.fillRect(20, 14, 4, 4); ctx.fillStyle = '#ffffff'; ctx.fillRect(12, 14, 2, 4); ctx.fillRect(18, 14, 2, 4); }
  private drawGenericItem(ctx: CanvasRenderingContext2D, itemIndex: number) { const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1']; ctx.fillStyle = colors[itemIndex % colors.length]; ctx.beginPath(); ctx.arc(16, 16, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(16, 16, 4, 0, Math.PI * 2); ctx.fill(); }

  private async generateUISprites(): Promise<void> {
    this.sprites.set('button_normal', this.createButtonSprite('normal'));
    this.sprites.set('button_hover', this.createButtonSprite('hover'));
    this.sprites.set('button_pressed', this.createButtonSprite('pressed'));
    this.sprites.set('health_bar_bg', this.createBarSprite('#333333'));
    this.sprites.set('health_bar_fill', this.createBarSprite('#e74c3c'));
    this.sprites.set('xp_bar_bg', this.createBarSprite('#333333'));
    this.sprites.set('xp_bar_fill', this.createBarSprite('#3498db'));
  }
  private createButtonSprite(state: 'normal' | 'hover' | 'pressed'): string {
    this.placeholderCanvas.width = 100; this.placeholderCanvas.height = 32;
    const ctx = this.placeholderContext; ctx.clearRect(0, 0, 100, 32);
    let color = '#4a90e2'; if (state === 'hover') color = '#5ba0f2'; if (state === 'pressed') color = '#357abd';
    ctx.fillStyle = color; ctx.fillRect(0, 0, 100, 32);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.strokeRect(0, 0, 100, 32);
    return this.placeholderCanvas.toDataURL();
  }
  private createBarSprite(color: string): string {
    this.placeholderCanvas.width = 200; this.placeholderCanvas.height = 20;
    const ctx = this.placeholderContext; ctx.clearRect(0, 0, 200, 20);
    ctx.fillStyle = color; ctx.fillRect(0, 0, 200, 20);
    return this.placeholderCanvas.toDataURL();
  }

  private async generateBackgroundSprites(): Promise<void> {
    this.sprites.set('bg_tel_aviv', this.createTelAvivBackground());
    this.sprites.set('bg_jerusalem', this.createJerusalemBackground());
    this.sprites.set('bg_menu', this.createMenuBackground());
  }
  private createTelAvivBackground(): string {
    this.placeholderCanvas.width = 256; this.placeholderCanvas.height = 256;
    const ctx = this.placeholderContext; ctx.fillStyle = '#87CEEB'; ctx.fillRect(0, 0, 256, 100);
    const buildingColors = ['#f0f0f0', '#e0e0e0', '#d0d0d0'];
    for (let i = 0; i < 8; i++) { ctx.fillStyle = buildingColors[i % buildingColors.length]; const h = 80 + Math.random() * 60; ctx.fillRect(i * 32, 100, 32, h); ctx.fillStyle = '#87CEEB'; for (let y = 110; y < h + 100; y += 15) { for (let x = i * 32 + 5; x < (i + 1) * 32 - 5; x += 10) ctx.fillRect(x, y, 6, 8); } }
    ctx.fillStyle = '#696969'; ctx.fillRect(0, 180, 256, 76); ctx.fillStyle = '#ff6b6b'; ctx.fillRect(0, 190, 256, 20);
    return this.placeholderCanvas.toDataURL();
  }
  private createJerusalemBackground(): string {
    this.placeholderCanvas.width = 256; this.placeholderCanvas.height = 256;
    const ctx = this.placeholderContext; ctx.fillStyle = '#F5DEB3'; ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#D2B48C'; ctx.lineWidth = 1; for (let y = 0; y < 256; y += 20) { for (let x = 0; x < 256; x += 30) ctx.strokeRect(x, y, 30, 20); }
    ctx.fillStyle = '#8B7355'; for (let i = 0; i < 3; i++) { const x = 60 + i * 70; ctx.beginPath(); ctx.arc(x, 150, 25, 0, Math.PI, true); ctx.fill(); }
    return this.placeholderCanvas.toDataURL();
  }
  private createMenuBackground(): string {
    this.placeholderCanvas.width = 256; this.placeholderCanvas.height = 256; const ctx = this.placeholderContext;
    const gradient = ctx.createLinearGradient(0, 0, 0, 256); gradient.addColorStop(0, '#1a1a2e'); gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#ffffff'; for (let i = 0; i < 50; i++) { const x = Math.random() * 256; const y = Math.random() * 256; ctx.fillRect(x, y, 1, 1); }
    return this.placeholderCanvas.toDataURL();
  }

  async loadSprite(id: string, path: string): Promise<any> {
    if (this.sprites.has(id)) return this.sprites.get(id);
    if (this.loadPromises.has(id)) return this.loadPromises.get(id)!;
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.sprites.set(id, img);
        const meta = this.spriteMeta.get(id) || {};
        const hintFrames = Number((meta as any).hintFrames) || 0;
        const setMeta = (m: any) => this.spriteMeta.set(id, { ...(meta || {}), ...m });
        if (!meta.frameWidth || !meta.frameHeight || !meta.frameCount || meta.frameCount === 'auto') {
          if (img.width % img.height === 0 && img.width > img.height) {
            const cols = img.width / img.height; setMeta({ frameCount: cols, frameCols: cols, frameRows: 1, frameWidth: img.height, frameHeight: img.height });
          } else if (img.height % img.width === 0 && img.height > img.width) {
            const rows = img.height / img.width; setMeta({ frameCount: rows, frameCols: 1, frameRows: rows, frameWidth: img.width, frameHeight: img.width });
          } else if (img.width === img.height && hintFrames >= 1) {
            const n = Math.round(Math.sqrt(hintFrames));
            if (n > 0) {
              const cols = n; const rows = Math.ceil(hintFrames / cols);
              setMeta({ frameCount: hintFrames, frameCols: cols, frameRows: rows, frameWidth: Math.floor(img.width / cols), frameHeight: Math.floor(img.height / rows) });
            } else { setMeta({ frameCount: 1, frameCols: 1, frameRows: 1, frameWidth: img.width, frameHeight: img.height }); }
          } else {
            setMeta({ frameCount: 1, frameCols: 1, frameRows: 1, frameWidth: img.width, frameHeight: img.height });
          }
        }
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Failed to load sprite: ${path}`);
        const placeholder = this.sprites.get(id); if (placeholder) resolve(placeholder); else reject(new Error(`Sprite not found: ${id}`));
      };
      img.src = path;
    });
    this.loadPromises.set(id, promise);
    return promise;
  }

  async loadSpriteOverride(id: string, path: string): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.sprites.set(id, img);
        const meta = this.spriteMeta.get(id) || {};
        const hintFrames = Number((meta as any).hintFrames) || 0;
        const setMeta = (m: any) => this.spriteMeta.set(id, { ...(meta || {}), ...m });
        if (!meta.frameWidth || !meta.frameHeight || !meta.frameCount || meta.frameCount === 'auto') {
          if (img.width % img.height === 0 && img.width > img.height) {
            const cols = img.width / img.height; setMeta({ frameCount: cols, frameCols: cols, frameRows: 1, frameWidth: img.height, frameHeight: img.height });
          } else if (img.height % img.width === 0 && img.height > img.width) {
            const rows = img.height / img.width; setMeta({ frameCount: rows, frameCols: 1, frameRows: rows, frameWidth: img.width, frameHeight: img.width });
          } else if (img.width === img.height && hintFrames >= 1) {
            const n = Math.round(Math.sqrt(hintFrames));
            if (n > 0) {
              const cols = n; const rows = Math.ceil(hintFrames / cols);
              setMeta({ frameCount: hintFrames, frameCols: cols, frameRows: rows, frameWidth: Math.floor(img.width / cols), frameHeight: Math.floor(img.height / rows) });
            } else { setMeta({ frameCount: 1, frameCols: 1, frameRows: 1, frameWidth: img.width, frameHeight: img.height }); }
          } else { setMeta({ frameCount: 1, frameCols: 1, frameRows: 1, frameWidth: img.width, frameHeight: img.height }); }
        }
        resolve(img);
      };
      img.onerror = () => { console.warn(`Failed to override sprite: ${path}`); reject(new Error(`Sprite override failed: ${id}`)); };
      img.src = path;
    });
    this.loadPromises.set(id, promise);
    return promise;
  }

  getSprite(id: string): HTMLImageElement | string | undefined { return this.sprites.get(id); }

  drawSprite(
    ctx: CanvasRenderingContext2D,
    spriteId: string,
    x: number,
    y: number,
    width: number | null = null,
    height: number | null = null,
    frame: number = 0
  ): void {
    const sprite = this.getSprite(spriteId);
    if (!sprite) return;
    if (typeof sprite === 'string') {
      let img = this.imageCache.get(spriteId);
      if (!img) {
        img = new Image();
        img.onload = () => { this.sprites.set(spriteId, img!); this.imageCache.set(spriteId, img!); };
        img.src = sprite;
        this.imageCache.set(spriteId, img);
      }
      if (img.complete && img.naturalWidth) this.drawSpriteImage(ctx, spriteId, img, x, y, width, height, frame);
      return;
    }
    this.drawSpriteImage(ctx, spriteId, sprite, x, y, width, height, frame);
  }

  private drawSpriteImage(
    ctx: CanvasRenderingContext2D,
    spriteId: string,
    img: HTMLImageElement,
    x: number,
    y: number,
    width: number | null = null,
    height: number | null = null,
    frame: number = 0
  ): void {
    const meta = this.spriteMeta.get(spriteId) || {};
    const frameCount = Number(meta.frameCount || 1);
    const frameCols = Number(meta.frameCols || frameCount);
    const frameRows = Number(meta.frameRows || 1);
    const frameWidth = Number(meta.frameWidth || Math.floor(img.width / Math.max(1, frameCols)));
    const frameHeight = Number(meta.frameHeight || Math.floor(img.height / Math.max(1, frameRows)));
    const useFrame = frameCount === 1 ? 0 : frame % frameCount;
    const col = frameCols > 0 ? useFrame % frameCols : 0;
    const row = frameCols > 0 ? Math.floor(useFrame / frameCols) : 0;
    const sourceX = col * frameWidth; const sourceY = row * frameHeight;
    const destWidth = width || frameWidth; const destHeight = height || frameHeight;
    ctx.drawImage(img, sourceX, sourceY, frameWidth, frameHeight, x, y, destWidth, destHeight);
  }
}

// Simple frame animator
class FrameAnimatorTS {
  private frames: number[] = [0];
  private fps = 8;
  private timeAccumulator = 0;
  private currentIndex = 0;
  private lastKey: string | null = null;
  setSequence(frames: number[], fps: number = 8, key: string | null = null): void {
    const sameKey = key && this.lastKey === key;
    const sameFrames = this.frames.length === frames.length && this.frames.every((v, i) => v === frames[i]);
    if (sameKey || sameFrames) { this.fps = fps; return; }
    this.frames = frames.slice(); this.fps = fps; this.timeAccumulator = 0; this.currentIndex = 0; this.lastKey = key || null;
  }
  update(deltaTime: number): void {
    if (!this.frames || this.frames.length <= 1) return;
    this.timeAccumulator += deltaTime;
    const frameDuration = 1 / Math.max(1, this.fps);
    while (this.timeAccumulator >= frameDuration) { this.timeAccumulator -= frameDuration; this.currentIndex = (this.currentIndex + 1) % this.frames.length; }
  }
  getFrame(): number { if (!this.frames || this.frames.length === 0) return 0; return this.frames[this.currentIndex] || 0; }
}

// Create and expose
const spriteManagerTS = new SpriteManagerTS();

declare global {
  interface Window {
    SpriteManager: typeof SpriteManagerTS;
    spriteManager: SpriteManagerTS;
    FrameAnimator: typeof FrameAnimatorTS;
  }
}
(window as any).SpriteManager = SpriteManagerTS;
(window as any).spriteManager = spriteManagerTS;
(window as any).FrameAnimator = FrameAnimatorTS;

export {};


