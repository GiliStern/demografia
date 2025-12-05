import { MathUtils } from './utils';
import { GAME_CONFIG, getSaveKeys, getAchievements } from './config';

type Settings = {
  music_volume: number;
  sfx_volume: number;
  fullscreen: boolean;
  pixel_scale: number;
  language: string;
  controls: { keyboard: boolean; gamepad: boolean; touch: boolean };
  accessibility: { high_contrast: boolean; reduced_motion: boolean; screen_flash: boolean };
};

type Progress = {
  version: string;
  player: { gold: number; totalGold: number; totalPlayTime: number; gamesPlayed: number; gamesWon: number };
  characters: { unlocked: string[]; stats: Record<string, unknown> };
  stages: { unlocked: string[]; bestTimes: Record<string, number>; highScores: Record<string, number> };
  weapons: { unlocked: string[]; stats: Record<string, unknown>; evolutions: string[] };
  achievements: { unlocked: string[]; progress: Record<string, number> };
  meta_upgrades: { purchased: Record<string, boolean>; levels: Record<string, number> };
  statistics: {
    totalEnemiesKilled: number;
    totalDamageDealt: number;
    totalExperienceGained: number;
    favoriteWeapon: string | null;
    longestSurvivalTime: number;
  };
};

class SaveSystemTS {
  saveKeys = getSaveKeys();
  settings: Settings;
  progress: Progress;
  currentSession: null | {
    startTime: number;
    characterId: string;
    stageId: string;
    stats: { enemiesKilled: number; damageDealt: number; experienceGained: number; goldEarned: number };
  } = null;

  constructor() {
    this.settings = this.loadSettings();
    this.progress = this.loadProgress();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('settingChanged', (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      this.updateSetting(detail.path, detail.value);
    });
    setInterval(() => {
      if ((window as any).gameState && (window as any).gameState.currentScreen === 'gameplay') {
        this.saveProgress();
      }
    }, 30000);
    window.addEventListener('beforeunload', () => {
      this.saveAll();
    });
  }

  // Settings
  private loadSettings(): Settings {
    try {
      const saved = localStorage.getItem(this.saveKeys.settings);
      if (saved) return this.validateSettings(JSON.parse(saved));
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
    return this.getDefaultSettings();
  }

  private getDefaultSettings(): Settings {
    return {
      music_volume: 70,
      sfx_volume: 80,
      fullscreen: false,
      pixel_scale: 2,
      language: 'he',
      controls: { keyboard: true, gamepad: true, touch: true },
      accessibility: { high_contrast: false, reduced_motion: false, screen_flash: true },
    };
  }

  private validateSettings(settings: Partial<Settings>): Settings {
    const defaults = this.getDefaultSettings();
    const validated: Settings = { ...defaults, ...settings };
    if (typeof settings.music_volume === 'number') validated.music_volume = MathUtils.clamp(settings.music_volume, 0, 100);
    if (typeof settings.sfx_volume === 'number') validated.sfx_volume = MathUtils.clamp(settings.sfx_volume, 0, 100);
    if (typeof settings.pixel_scale === 'number') validated.pixel_scale = MathUtils.clamp(settings.pixel_scale, 1, 4);
    if (settings.controls && typeof settings.controls === 'object') validated.controls = { ...defaults.controls, ...settings.controls } as Settings['controls'];
    if (settings.accessibility && typeof settings.accessibility === 'object') validated.accessibility = { ...defaults.accessibility, ...settings.accessibility } as Settings['accessibility'];
    return validated;
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(this.saveKeys.settings, JSON.stringify(this.settings));
      console.log('Settings saved');
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  private applySetting(path: string, value: any): void {
    const audioManager = (window as any).getAudioManager ? (window as any).getAudioManager() : null;
    switch (path) {
      case 'settings.music_volume':
        if (audioManager) audioManager.setMusicVolume(value / 100);
        break;
      case 'settings.sfx_volume':
        if (audioManager) audioManager.setSFXVolume(value / 100);
        break;
      case 'settings.fullscreen':
        if (value && !document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => undefined);
        } else if (!value && document.fullscreenElement) {
          document.exitFullscreen().catch(() => undefined);
        }
        break;
      case 'settings.pixel_scale':
        this.updatePixelScale(value);
        break;
      default:
        console.log('Setting applied:', path, value);
    }
  }

  updateSetting(path: string, value: any): void {
    const parts = path.split('.');
    let obj: any = this.settings as any;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]]) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
    this.applySetting(path, value);
    this.saveSettings();
  }

  private updatePixelScale(scale: number): void {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    const baseWidth = GAME_CONFIG.CANVAS_WIDTH;
    const baseHeight = GAME_CONFIG.CANVAS_HEIGHT;
    canvas.style.width = `${baseWidth * scale}px`;
    canvas.style.height = `${baseHeight * scale}px`;
    canvas.style.imageRendering = scale > 1 ? 'pixelated' : 'auto';
  }

  getSetting(path: string): any {
    const parts = path.split('.');
    let obj: any = this.settings as any;
    for (const part of parts) {
      if (obj && obj[part] !== undefined) obj = obj[part];
      else return null;
    }
    return obj;
  }

  // Progress
  private loadProgress(): Progress {
    try {
      const saved = localStorage.getItem(this.saveKeys.progress);
      if (saved) return this.validateProgress(JSON.parse(saved));
    } catch (e) {
      console.warn('Failed to load progress:', e);
    }
    return this.getDefaultProgress();
  }

  private getDefaultProgress(): Progress {
    const version = (window as any).gameConfig?.meta?.version || '0.1.0';
    return {
      version,
      player: { gold: 0, totalGold: 0, totalPlayTime: 0, gamesPlayed: 0, gamesWon: 0 },
      characters: { unlocked: ['sruLik'], stats: {} },
      stages: { unlocked: ['tel_aviv'], bestTimes: {}, highScores: {} },
      weapons: { unlocked: ['magic_wand'], stats: {}, evolutions: [] },
      achievements: { unlocked: [], progress: {} },
      meta_upgrades: { purchased: {}, levels: {} },
      statistics: { totalEnemiesKilled: 0, totalDamageDealt: 0, totalExperienceGained: 0, favoriteWeapon: null, longestSurvivalTime: 0 },
    };
  }

  private validateProgress(progress: Partial<Progress>): Progress {
    const defaults = this.getDefaultProgress();
    const validated: Progress = {
      version: progress.version || defaults.version,
      player: { ...defaults.player, ...(progress.player || {}) },
      characters: { ...defaults.characters, ...(progress.characters || {}) },
      stages: { ...defaults.stages, ...(progress.stages || {}) },
      weapons: { ...defaults.weapons, ...(progress.weapons || {}) },
      achievements: { ...defaults.achievements, ...(progress.achievements || {}) },
      meta_upgrades: { ...defaults.meta_upgrades, ...(progress.meta_upgrades || {}) },
      statistics: { ...defaults.statistics, ...(progress.statistics || {}) },
    };
    if (!Array.isArray(validated.characters.unlocked)) validated.characters.unlocked = defaults.characters.unlocked;
    if (!Array.isArray(validated.stages.unlocked)) validated.stages.unlocked = defaults.stages.unlocked;
    if (!Array.isArray(validated.weapons.unlocked)) validated.weapons.unlocked = defaults.weapons.unlocked;
    if (!Array.isArray(validated.achievements.unlocked)) validated.achievements.unlocked = defaults.achievements.unlocked;
    validated.player.gold = Math.max(0, validated.player.gold || 0);
    validated.player.totalGold = Math.max(0, validated.player.totalGold || 0);
    validated.player.totalPlayTime = Math.max(0, (validated.player.totalPlayTime as number) || 0);
    return validated;
  }

  saveProgress(): void {
    try {
      localStorage.setItem(this.saveKeys.progress, JSON.stringify(this.progress));
      console.log('Progress saved');
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  }

  updateProgress(updates: Partial<Progress>): void {
    this.progress = this.deepMerge(this.progress, updates) as Progress;
    this.saveProgress();
  }

  private deepMerge(target: any, source: any): any {
    const result: any = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  // Character & stage
  unlockCharacter(characterId: string): boolean {
    if (!this.progress.characters.unlocked.includes(characterId)) {
      this.progress.characters.unlocked.push(characterId);
      this.saveProgress();
      this.checkAchievements('character_unlock', { characterId });
      return true;
    }
    return false;
  }

  isCharacterUnlocked(characterId: string): boolean {
    return this.progress.characters.unlocked.includes(characterId);
  }

  unlockStage(stageId: string): boolean {
    if (!this.progress.stages.unlocked.includes(stageId)) {
      this.progress.stages.unlocked.push(stageId);
      this.saveProgress();
      this.checkAchievements('stage_unlock', { stageId });
      return true;
    }
    return false;
  }

  isStageUnlocked(stageId: string): boolean {
    return this.progress.stages.unlocked.includes(stageId);
  }

  updateBestTime(stageId: string, time: number): boolean {
    const currentBest = this.progress.stages.bestTimes[stageId];
    if (!currentBest || time < currentBest) {
      this.progress.stages.bestTimes[stageId] = time;
      this.saveProgress();
      return true;
    }
    return false;
  }

  // Achievements
  private checkAchievements(eventType: string, data: any): void {
    const achievements = getAchievements();
    achievements.forEach((achievement: any) => {
      if (this.progress.achievements.unlocked.includes(achievement.id)) return;
      if (this.checkAchievementCondition(achievement, eventType, data)) {
        this.unlockAchievement(achievement.id);
      }
    });
  }

  private checkAchievementCondition(achievement: any, eventType: string, data: any): boolean {
    switch (achievement.id) {
      case 'first_character':
        return eventType === 'character_unlock';
      case 'survivor_10min':
        return eventType === 'game_complete' && data.survivalTime >= 600;
      case 'gold_collector':
        return this.progress.player.totalGold >= 1000;
      case 'enemy_slayer':
        return this.progress.statistics.totalEnemiesKilled >= 1000;
      default:
        return false;
    }
  }

  private unlockAchievement(achievementId: string): void {
    this.progress.achievements.unlocked.push(achievementId);
    this.saveProgress();
    this.showAchievementNotification(achievementId);
    console.log('Achievement unlocked:', achievementId);
  }

  private showAchievementNotification(achievementId: string): void {
    const achievements = getAchievements();
    const achievement = achievements.find((a: any) => a.id === achievementId);
    if (!achievement) return;
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <h3>🏆 ${(window as any).getText('ui_strings.achievements.title')}</h3>
      <p>${achievement.name_he}</p>
    `;
    notification.style.cssText = `position: fixed; top: 20px; right: 20px; background: rgba(0,0,0,0.9); color: #f39c12; padding: 15px; border-radius: 8px; border: 2px solid #f39c12; z-index: 10000; animation: slideIn 0.3s ease-out;`;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.5s ease-out';
      setTimeout(() => notification.parentNode?.removeChild(notification), 500);
    }, 5000);
    const audioManager = (window as any).getAudioManager ? (window as any).getAudioManager() : null;
    if (audioManager?.playPowerup) audioManager.playPowerup();
  }

  // Meta upgrades
  buyMetaUpgrade(upgradeId: string, cost: number): boolean {
    if (this.progress.player.gold >= cost) {
      this.progress.player.gold -= cost;
      const currentLevel = this.progress.meta_upgrades.levels[upgradeId] || 0;
      this.progress.meta_upgrades.levels[upgradeId] = currentLevel + 1;
      if (!this.progress.meta_upgrades.purchased[upgradeId]) this.progress.meta_upgrades.purchased[upgradeId] = true;
      this.saveProgress();
      this.checkAchievements('meta_upgrade', { upgradeId, level: currentLevel + 1 });
      return true;
    }
    return false;
  }

  getMetaUpgradeLevel(upgradeId: string): number {
    return this.progress.meta_upgrades.levels[upgradeId] || 0;
  }

  // Sessions
  startGameSession(characterId: string, stageId: string): void {
    this.currentSession = {
      startTime: Date.now(),
      characterId,
      stageId,
      stats: { enemiesKilled: 0, damageDealt: 0, experienceGained: 0, goldEarned: 0 },
    };
  }

  updateSessionStats(stats: Partial<SaveSystemTS['currentSession'] extends null ? never : SaveSystemTS['currentSession']['stats']>): void {
    if (this.currentSession) Object.assign(this.currentSession.stats, stats);
  }

  endGameSession(result: { victory: boolean; [k: string]: any }): void {
    if (!this.currentSession) return;
    const sessionTime = (Date.now() - this.currentSession.startTime) / 1000;
    const stats = this.currentSession.stats;
    this.updateProgress({
      player: {
        totalPlayTime: this.progress.player.totalPlayTime + sessionTime,
        gamesPlayed: this.progress.player.gamesPlayed + 1,
        gamesWon: this.progress.player.gamesWon + (result.victory ? 1 : 0),
        gold: this.progress.player.gold + stats.goldEarned,
        totalGold: this.progress.player.totalGold + stats.goldEarned,
      },
      statistics: {
        totalEnemiesKilled: this.progress.statistics.totalEnemiesKilled + stats.enemiesKilled,
        totalDamageDealt: this.progress.statistics.totalDamageDealt + stats.damageDealt,
        totalExperienceGained: this.progress.statistics.totalExperienceGained + stats.experienceGained,
        longestSurvivalTime: Math.max(this.progress.statistics.longestSurvivalTime, sessionTime),
      },
    } as any);
    if (result.victory) this.updateBestTime(this.currentSession.stageId, sessionTime);
    this.checkAchievements('game_complete', { survivalTime: sessionTime, victory: result.victory, ...stats });
    this.currentSession = null;
  }

  // Data
  saveAll(): void { this.saveSettings(); this.saveProgress(); }
  exportData(): any { return { settings: this.settings, progress: this.progress, exportDate: new Date().toISOString() }; }
  importData(data: any): boolean {
    try {
      if (data.settings) { this.settings = this.validateSettings(data.settings); this.saveSettings(); }
      if (data.progress) { this.progress = this.validateProgress(data.progress); this.saveProgress(); }
      console.log('Data imported successfully');
      return true;
    } catch (e) {
      console.error('Failed to import data:', e);
      return false;
    }
  }
  resetProgress(): void { this.progress = this.getDefaultProgress(); this.saveProgress(); console.log('Progress reset'); }
  resetSettings(): void { this.settings = this.getDefaultSettings(); this.saveSettings(); console.log('Settings reset'); }

  // UI helpers
  getPlayerData(): any {
    return {
      ...this.progress.player,
      settings: this.settings,
      unlockedCharacters: this.progress.characters.unlocked,
      unlockedStages: this.progress.stages.unlocked,
      unlockedAchievements: this.progress.achievements.unlocked,
    };
  }
}

// Create and expose global instance for legacy JS compatibility
const saveSystemTS = new SaveSystemTS();

declare global {
  interface Window {
    SaveSystem: typeof SaveSystemTS;
    saveSystem: SaveSystemTS;
  }
}
(window as any).SaveSystem = SaveSystemTS;
(window as any).saveSystem = saveSystemTS;

export {};


