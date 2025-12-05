// Game configuration loaded from JSON
let gameConfig = null;

// Load the game configuration
async function loadGameConfig() {
    try {
        const response = await fetch('hebrew_vampire_survivors_package/game_assets_hebrew_template_v0_2.json');
        gameConfig = await response.json();
        console.log('Game configuration loaded:', gameConfig.meta.version);
        return gameConfig;
    } catch (error) {
        console.error('Failed to load game configuration:', error);
        throw error;
    }
}

// Helper function to get text from config
function getText(key) {
    if (!gameConfig) return key;
    
    const parts = key.split('.');
    let obj = gameConfig;
    
    for (const part of parts) {
        if (obj && obj[part] !== undefined) {
            obj = obj[part];
        } else {
            return key; // Return the key if not found
        }
    }
    
    return obj;
}

// Helper function to get RTL direction
function isRTL() {
    return gameConfig?.meta?.i18n?.rtl_ui || false;
}

// Helper function to get meters LTR setting
function isMetersLTR() {
    return gameConfig?.meta?.i18n?.meters_ltr || false;
}

// Game constants
const GAME_CONFIG = {
    CANVAS_WIDTH: 1280,
    CANVAS_HEIGHT: 720,
    TARGET_FPS: 60,
    PIXEL_SCALE: 2,
    
    // Colors
    COLORS: {
        PRIMARY: '#4a90e2',
        SECONDARY: '#357abd',
        SUCCESS: '#27ae60',
        WARNING: '#f39c12',
        DANGER: '#e74c3c',
        DARK: '#2c3e50',
        LIGHT: '#ecf0f1'
    },
    
    // Audio
    AUDIO: {
        MASTER_VOLUME: 1.0,
        MUSIC_VOLUME: 0.7,
        SFX_VOLUME: 0.8
    },
    
    // Gameplay
    GAMEPLAY: {
        MAX_ENEMIES: 200,
        ENEMY_SPAWN_RATE: 1.5,
        XP_SCALE_FACTOR: 1.2,
        DAMAGE_SCALE_FACTOR: 1.1,
        PICKUP_RANGE: 40,
        SCREEN_SHAKE_DURATION: 100
    },
    
    // Input
    INPUT: {
        MOVE_SPEED: 150,
        DEADZONE: 0.1
    }
};

// Character data from config
function getCharacters() {
    return gameConfig?.characters || [];
}

// Weapon data from config
function getWeapons() {
    return gameConfig?.weapons || {};
}

// Passive data from config
function getPassives() {
    return gameConfig?.passives || {};
}

// Stages data from config
function getStages() {
    return gameConfig?.stages || [];
}

// UI layout from config
function getUILayout() {
    return gameConfig?.ui_layout || {};
}

// Meta shop data from config
function getMetaShop() {
    return gameConfig?.meta_shop || [];
}

// Achievements data from config
function getAchievements() {
    return gameConfig?.achievements || [];
}

// Assets data from config
function getAssets() {
    return gameConfig?.assets || {};
}

// Pickup data from config
function getPickups() {
    return gameConfig?.pickups || {};
}

// Enemy data from stages
function getEnemiesForStage(stageId) {
    const stage = getStages().find(s => s.id === stageId);
    if (!stage) return [];
    
    return [
        ...(stage.enemies_common || []),
        ...(stage.minibosses || []),
        ...(stage.bosses || [])
    ];
}

// Save keys from config
function getSaveKeys() {
    return gameConfig?.gameplay?.save?.keys || {
        settings: 'he_vs_settings',
        progress: 'he_vs_progress'
    };
}

// Export for use in other modules
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

