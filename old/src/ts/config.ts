 

// Game configuration loaded from JSON (TypeScript module)
let gameConfig: any = null;

// Resolve the live game config regardless of who loaded it (TS or legacy JS)
function cfg(): any {
  // Prefer the locally loaded config if present, otherwise fall back to the
  // global that legacy JS attaches on load.
  return gameConfig || (window as any).gameConfig || null;
}

export async function loadGameConfig(): Promise<any> {
  try {
    const response = await fetch(
      'hebrew_vampire_survivors_package/game_assets_hebrew_template_v0_2.json'
    );
    gameConfig = await response.json();
    console.log('Game configuration loaded:', gameConfig?.meta?.version);
    return gameConfig;
  } catch (error) {
    console.error('Failed to load game configuration:', error);
    throw error;
  }
}

export function getText(key: string): string {
  const c = cfg();
  if (!c) return key;
  const parts = key.split('.');
  let obj: any = c;
  for (const part of parts) {
    if (obj && obj[part] !== undefined) obj = obj[part];
    else return key;
  }
  return typeof obj === 'string' ? obj : key;
}

export function isRTL(): boolean {
  const c = cfg();
  return Boolean(c?.meta?.i18n?.rtl_ui);
}

export function isMetersLTR(): boolean {
  const c = cfg();
  return Boolean(c?.meta?.i18n?.meters_ltr);
}

export const GAME_CONFIG = {
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,
  TARGET_FPS: 60,
  PIXEL_SCALE: 2,
  COLORS: {
    PRIMARY: '#4a90e2',
    SECONDARY: '#357abd',
    SUCCESS: '#27ae60',
    WARNING: '#f39c12',
    DANGER: '#e74c3c',
    DARK: '#2c3e50',
    LIGHT: '#ecf0f1',
  },
  AUDIO: {
    MASTER_VOLUME: 1.0,
    MUSIC_VOLUME: 0.7,
    SFX_VOLUME: 0.8,
  },
  GAMEPLAY: {
    MAX_ENEMIES: 200,
    ENEMY_SPAWN_RATE: 1.5,
    XP_SCALE_FACTOR: 1.2,
    DAMAGE_SCALE_FACTOR: 1.1,
    PICKUP_RANGE: 40,
    SCREEN_SHAKE_DURATION: 100,
  },
  INPUT: {
    MOVE_SPEED: 150,
    DEADZONE: 0.1,
  },
} as const;

export function getCharacters(): any[] {
  const c = cfg();
  return c?.characters || [];
}
export function getWeapons(): Record<string, any> {
  const c = cfg();
  return c?.weapons || {};
}
export function getPassives(): Record<string, any> {
  const c = cfg();
  return c?.passives || {};
}
export function getStages(): any[] {
  const c = cfg();
  return c?.stages || [];
}
export function getUILayout(): any {
  const c = cfg();
  return c?.ui_layout || {};
}
export function getMetaShop(): any[] {
  const c = cfg();
  return c?.meta_shop || [];
}
export function getAchievements(): any[] {
  const c = cfg();
  return c?.achievements || [];
}
export function getAssets(): any {
  const c = cfg();
  return c?.assets || {};
}
export function getPickups(): Record<string, any> {
  const c = cfg();
  return c?.pickups || {};
}
export function getEnemiesForStage(stageId: string): any[] {
  const stage = getStages().find((s: any) => s.id === stageId);
  if (!stage) return [];
  return [
    ...(stage.enemies_common || []),
    ...(stage.minibosses || []),
    ...(stage.bosses || []),
  ];
}
export function getSaveKeys(): { settings: string; progress: string } {
  const c = cfg();
  return (
    c?.gameplay?.save?.keys || {
      settings: 'he_vs_settings',
      progress: 'he_vs_progress',
    }
  );
}

// Back-compat: attach to window so legacy JS continues to work during migration
declare global {
  interface Window {
    GAME_CONFIG: typeof GAME_CONFIG;
    gameConfig: any;
    loadGameConfig: typeof loadGameConfig;
    getText: typeof getText;
    isRTL: typeof isRTL;
    isMetersLTR: typeof isMetersLTR;
    getCharacters: typeof getCharacters;
    getWeapons: typeof getWeapons;
    getPassives: typeof getPassives;
    getStages: typeof getStages;
    getUILayout: typeof getUILayout;
    getMetaShop: typeof getMetaShop;
    getAchievements: typeof getAchievements;
    getAssets: typeof getAssets;
    getPickups: typeof getPickups;
    getEnemiesForStage: typeof getEnemiesForStage;
    getSaveKeys: typeof getSaveKeys;
  }
}

// Attach globals
window.GAME_CONFIG = GAME_CONFIG;
window.gameConfig = gameConfig;
window.loadGameConfig = loadGameConfig;
window.getText = getText;
window.isRTL = isRTL;
window.isMetersLTR = isMetersLTR;
window.getCharacters = getCharacters;
window.getWeapons = getWeapons;
window.getPassives = getPassives;
window.getStages = getStages;
window.getUILayout = getUILayout;
window.getMetaShop = getMetaShop;
window.getAchievements = getAchievements;
window.getAssets = getAssets;
window.getPickups = getPickups;
window.getEnemiesForStage = getEnemiesForStage;
window.getSaveKeys = getSaveKeys;



