import { TimeUtils, TweenManager } from './utils';
import { getCharacters, getStages, getMetaShop, getAchievements, getText } from './config';

class ScreenManagerTS {
  gameState: any;
  uiManager: any;
  currentScreen: string | null = null;
  screenHistory: string[] = [];

  constructor(gameState: any) {
    this.gameState = gameState;
    this.uiManager = new (window as any).UIManager();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('navigateToScreen', (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      this.loadScreen(detail.screenId);
    });
    window.addEventListener('startGame', () => this.startGame());
    window.addEventListener('buyShopItem', (e: Event) => {
      const { itemId, cost } = (e as CustomEvent).detail || {};
      this.handleShopPurchase(itemId, cost);
    });
    window.addEventListener('virtualAction', (e: Event) => {
      const { action } = (e as CustomEvent).detail || {};
      this.handleVirtualAction(action);
    });
  }

  async initialize(): Promise<void> { await this.loadScreen('splash'); }

  async loadScreen(screenId: string, data: any = {}): Promise<void> {
    if (this.currentScreen && this.currentScreen !== screenId) {
      this.screenHistory.push(this.currentScreen);
      if (this.screenHistory.length > 10) this.screenHistory.shift();
    }
    this.currentScreen = screenId;
    this.gameState.currentScreen = screenId;
    const screenData = this.prepareScreenData(screenId, data);
    await this.uiManager.loadScreen(screenId, screenData);
    this.handleScreenLoad(screenId, screenData);
    this.updateMusic(screenId);
    console.log('Screen loaded:', screenId);
  }

  private prepareScreenData(screenId: string, additionalData: any = {}): any {
    const playerData = (window as any).saveSystem.getPlayerData();
    const baseData = { ...playerData, selectedCharacter: this.gameState.selectedCharacter, selectedStage: this.gameState.selectedStage, ...additionalData };
    switch (screenId) {
      case 'character_select':
        return { ...baseData, availableCharacters: this.getAvailableCharacters() };
      case 'stage_select':
        return { ...baseData, availableStages: this.getAvailableStages(), selectedStageIndex: this.getStageIndex(this.gameState.selectedStage) };
      case 'meta_shop':
        return { ...baseData, shopItems: this.getShopItemsWithPrices() };
      case 'achievements':
        return { ...baseData, achievementList: this.getAchievementsWithStatus() };
      default:
        return baseData;
    }
  }

  private getAvailableCharacters(): any[] {
    const all = getCharacters();
    const unlockedIds = (window as any).saveSystem.progress.characters.unlocked;
    return all.map((c: any) => ({ ...c, unlocked: unlockedIds.includes(c.id) }));
  }

  private getAvailableStages(): any[] {
    const all = getStages();
    const unlockedIds = (window as any).saveSystem.progress.stages.unlocked;
    return all.map((s: any) => ({ ...s, unlocked: unlockedIds.includes(s.id), bestTime: (window as any).saveSystem.progress.stages.bestTimes[s.id], highScore: (window as any).saveSystem.progress.stages.highScores[s.id] }));
  }

  private getStageIndex(stageId: string): number {
    const stages = getStages();
    return Math.max(0, stages.findIndex((s: any) => s.id === stageId));
  }

  private getShopItemsWithPrices(): any[] {
    const items = getMetaShop();
    return items.map((item: any) => {
      const currentLevel = (window as any).saveSystem.getMetaUpgradeLevel(item.id);
      const baseCost = 100;
      const cost = Math.floor(baseCost * Math.pow(1.5, currentLevel));
      return { ...item, currentLevel, cost, affordable: (window as any).saveSystem.progress.player.gold >= cost, maxLevel: 10 };
    });
  }

  private getAchievementsWithStatus(): any[] {
    const all = getAchievements();
    const unlockedIds = (window as any).saveSystem.progress.achievements.unlocked;
    return all.map((a: any) => ({ ...a, unlocked: unlockedIds.includes(a.id), progress: this.getAchievementProgress(a.id) }));
  }

  private getAchievementProgress(achievementId: string): number {
    const p = (window as any).saveSystem.progress.achievements.progress[achievementId];
    return p || 0;
  }

  private handleScreenLoad(screenId: string): void {
    switch (screenId) {
      case 'splash': this.handleSplashScreen(); break;
      case 'main_menu': this.handleMainMenu(); break;
      case 'character_select': this.handleCharacterSelect(); break;
      case 'stage_select': this.handleStageSelect(); break;
      case 'settings': this.handleSettings(); break;
      case 'meta_shop': this.handleMetaShop(); break;
      case 'achievements': this.handleAchievements(); break;
    }
  }

  private handleSplashScreen(): void {
    setTimeout(() => {
      const handleFirstInteraction = () => {
        this.loadScreen('main_menu');
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
      };
      document.addEventListener('click', handleFirstInteraction);
      document.addEventListener('keydown', handleFirstInteraction);
      document.addEventListener('touchstart', handleFirstInteraction);
    }, 1000);
  }

  private handleMainMenu(): void {
    const audio = (window as any).getAudioManager ? (window as any).getAudioManager() : null;
    audio?.resumeAudioContext?.();
  }

  private handleCharacterSelect(): void {
    if (!this.gameState.selectedCharacter) {
      const available = this.getAvailableCharacters();
      const firstUnlocked = available.find((c: any) => c.unlocked);
      if (firstUnlocked) this.gameState.selectedCharacter = firstUnlocked.id;
    }
  }

  private handleStageSelect(): void {
    if (!this.gameState.selectedStage) {
      const available = this.getAvailableStages();
      const firstUnlocked = available.find((s: any) => s.unlocked);
      if (firstUnlocked) this.gameState.selectedStage = firstUnlocked.id;
    }
  }

  private handleSettings(): void { this.applyCurrentSettings(); }
  private applyCurrentSettings(): void {
    const settings = (window as any).saveSystem.settings;
    const audio = (window as any).getAudioManager ? (window as any).getAudioManager() : null;
    if (audio) { audio.setMusicVolume(settings.music_volume / 100); audio.setSFXVolume(settings.sfx_volume / 100); }
  }

  private handleMetaShop(): void { this.updateShopAffordability(); }
  private updateShopAffordability(): void {
    const items = document.querySelectorAll('.shop-item');
    const playerGold = (window as any).saveSystem.progress.player.gold;
    items.forEach((item) => {
      const costEl = item.querySelector('[data-cost]');
      if (costEl) {
        const cost = parseInt(costEl.getAttribute('data-cost') || '0');
        if (playerGold >= cost) item.classList.add('affordable'); else item.classList.remove('affordable');
      }
    });
  }

  private handleAchievements(): void { this.updateAchievementProgress(); }
  private updateAchievementProgress(): void {
    const items = document.querySelectorAll('.achievement-item');
    items.forEach((item) => {
      const id = item.getAttribute('data-achievement-id');
      if (id) {
        const progress = this.getAchievementProgress(id);
        const progressEl = item.querySelector('.achievement-progress');
        if (progressEl) progressEl.textContent = `${progress}%`;
      }
    });
  }

  private handleShopPurchase(itemId: string, cost: number): void {
    const success = (window as any).saveSystem.buyMetaUpgrade(itemId, cost);
    if (success) {
      const audio = (window as any).getAudioManager ? (window as any).getAudioManager() : null; audio?.playPowerup?.();
      this.updateShopAffordability();
      this.showPurchaseSuccess(itemId);
      console.log('Purchased upgrade:', itemId);
    } else {
      this.showPurchaseFailure();
      const audio = (window as any).getAudioManager ? (window as any).getAudioManager() : null; audio?.playButtonClick?.();
    }
  }

  private showPurchaseSuccess(): void {
    const n = document.createElement('div'); n.className = 'purchase-notification success'; n.textContent = `${getText('ui_strings.common.buy')} ✓`;
    n.setAttribute('style', 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(39,174,96,0.9);color:#fff;padding:15px 30px;border-radius:8px;font-weight:bold;z-index:10000;animation:fadeInOut 2s ease-out;');
    document.body.appendChild(n); setTimeout(() => { n.parentNode?.removeChild(n); }, 2000);
  }
  private showPurchaseFailure(): void {
    const n = document.createElement('div'); n.className = 'purchase-notification failure'; n.textContent = 'Not enough gold!';
    n.setAttribute('style', 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(231,76,60,0.9);color:#fff;padding:15px 30px;border-radius:8px;font-weight:bold;z-index:10000;animation:fadeInOut 2s ease-out;');
    document.body.appendChild(n); setTimeout(() => { n.parentNode?.removeChild(n); }, 2000);
  }

  private handleVirtualAction(action: string): void {
    switch (action) {
      case 'pause':
        if (this.currentScreen === 'gameplay') this.pauseGame(); else this.goBack();
        break;
      default: console.log('Unhandled virtual action:', action);
    }
  }

  startGame(): void {
    if (!this.gameState.selectedCharacter || !this.gameState.selectedStage) {
      console.error('Cannot start game: missing character or stage selection');
      return;
    }
    (window as any).saveSystem.startGameSession(this.gameState.selectedCharacter, this.gameState.selectedStage);
    this.gameState.isInGameplay = true;
    this.gameState.currentScreen = 'gameplay';
    this.uiManager.clearScreen();
    if ((window as any).gameEngine) {
      (window as any).gameEngine.startGame(this.gameState.selectedCharacter, this.gameState.selectedStage);
    }
    console.log('Starting game:', this.gameState.selectedCharacter, this.gameState.selectedStage);
  }

  pauseGame(): void {
    if (!this.gameState.isInGameplay) return;
    this.gameState.isPaused = !this.gameState.isPaused;
    if (this.gameState.isPaused) {
      (window as any).gameEngine?.pauseGame?.();
      this.showPauseMenu();
    } else {
      this.hidePauseMenu();
      (window as any).gameEngine?.resumeGame?.();
    }
  }

  private showPauseMenu(): void {
    const pauseMenu = document.createElement('div'); pauseMenu.id = 'pauseMenu'; pauseMenu.className = 'pause-menu';
    const titleKey = getText('ui_strings.common.pause');
    const titleText = titleKey === 'ui_strings.common.pause' ? 'הפסקה' : titleKey;
    pauseMenu.innerHTML = `
      <div class="pause-backdrop"></div>
      <div class="pause-content">
        <div class="pause-header">
          <h2 class="pause-title">${titleText}</h2>
          <div class="pause-subtitle">${TimeUtils.formatTime((window as any).gameEngine?.gameTime || 0)}</div>
        </div>
        <div class="pause-actions">
          <button class="ui-button" onclick="screenManager.pauseGame()">${getText('ui_strings.common.resume')}</button>
          <button class="ui-button" onclick="screenManager.restartGame()">${getText('ui_strings.common.restart')}</button>
          <button class="ui-button" onclick="screenManager.exitToMenu()">${getText('ui_strings.common.main_menu')}</button>
        </div>
      </div>`;
    document.body.appendChild(pauseMenu);
  }
  private hidePauseMenu(): void { const el = document.getElementById('pauseMenu'); if (el) el.parentNode?.removeChild(el); }
  restartGame(): void { this.hidePauseMenu(); this.startGame(); }
  exitToMenu(): void { this.hidePauseMenu(); this.endGame(false); this.loadScreen('main_menu'); }

  endGame(victory = false, stats: any = {}): void {
    this.gameState.isInGameplay = false; this.gameState.isPaused = false;
    (window as any).gameEngine?.endGame?.(victory);
    (window as any).saveSystem.endGameSession({ victory, ...stats });
    this.uiManager.clearHUD();
    if (victory) this.showGameResults(true, stats); else this.showGameOver(stats);
    console.log('Game ended:', victory ? 'Victory' : 'Defeat');
  }

  private showGameOver(stats: any = {}): void {
    const audio = (window as any).getAudioManager ? (window as any).getAudioManager() : null; audio?.playMenuMusic?.();
    const overlay = document.createElement('div'); overlay.className = 'game-results'; overlay.setAttribute('style', 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);display:flex;justify-content:center;align-items:center;z-index:10000;color:white;text-align:center;');
    const survivalTime = TimeUtils.formatTime(stats.survivalTime || 0);
    overlay.innerHTML = `
      <div class="results-content">
        <h1>Game Over</h1>
        <div class="results-stats" style="margin:10px 0 20px;opacity:0.9;">
          <p>Survival Time: ${survivalTime}</p>
          <p>Enemies Defeated: ${stats.enemiesKilled || 0}</p>
          <p>Gold Earned: ${stats.goldEarned || 0}</p>
          <p>Experience Gained: ${stats.experienceGained || 0}</p>
        </div>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <button id="btnRetry" class="ui-button" style="min-width:160px;">${getText('ui_strings.common.restart')}</button>
          <button id="btnChar" class="ui-button" style="min-width:160px;">${getText('ui_strings.character_select.title')}</button>
          <button id="btnMenu" class="ui-button" style="min-width:160px;">${getText('ui_strings.common.main_menu')}</button>
        </div>
      </div>`;
    overlay.querySelector('#btnRetry')?.addEventListener('click', () => { overlay.parentNode?.removeChild(overlay); this.restartGame(); });
    overlay.querySelector('#btnChar')?.addEventListener('click', () => { overlay.parentNode?.removeChild(overlay); this.loadScreen('character_select'); });
    overlay.querySelector('#btnMenu')?.addEventListener('click', () => { overlay.parentNode?.removeChild(overlay); this.loadScreen('main_menu'); });
    document.body.appendChild(overlay);
  }

  private showGameResults(victory: boolean, stats: any): void {
    const screen = document.createElement('div'); screen.className = 'game-results';
    const title = victory ? 'Victory!' : 'Game Over';
    const survivalTime = TimeUtils.formatTime(stats.survivalTime || 0);
    screen.innerHTML = `
      <div class="results-content">
        <h1>${title}</h1>
        <div class="results-stats">
          <p>Survival Time: ${survivalTime}</p>
          <p>Enemies Defeated: ${stats.enemiesKilled || 0}</p>
          <p>Gold Earned: ${stats.goldEarned || 0}</p>
          <p>Experience Gained: ${stats.experienceGained || 0}</p>
        </div>
        <button class="ui-button" onclick="screenManager.loadScreen('main_menu')">Continue</button>
      </div>`;
    screen.setAttribute('style', 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);display:flex;justify-content:center;align-items:center;z-index:10000;color:white;text-align:center;');
    document.body.appendChild(screen);
    setTimeout(() => { if (screen.parentNode) { screen.parentNode.removeChild(screen); this.loadScreen('main_menu'); } }, 10000);
  }

  goBack(): void {
    if (this.screenHistory.length > 0) {
      const prev = this.screenHistory.pop()!;
      this.loadScreen(prev);
    } else {
      this.loadScreen('main_menu');
    }
  }

  private updateMusic(screenId: string): void {
    const audio = (window as any).getAudioManager ? (window as any).getAudioManager() : null; if (!audio) return;
    switch (screenId) {
      case 'splash':
      case 'main_menu':
      case 'character_select':
      case 'stage_select':
      case 'settings':
      case 'meta_shop':
      case 'achievements':
        audio.playMenuMusic();
        break;
      case 'gameplay':
        audio.playGameplayMusic();
        break;
      default:
        break;
    }
  }

  update(deltaTime: number): void {
    TweenManager.update(deltaTime);
  }

  destroy(): void {
    this.uiManager.clearScreen();
    this.hidePauseMenu();
    const results = document.querySelector('.game-results');
    if (results) results.parentNode?.removeChild(results);
  }
}

declare global { interface Window { ScreenManager: typeof ScreenManagerTS; screenManager: any; } }
(window as any).ScreenManager = ScreenManagerTS;

export {};


