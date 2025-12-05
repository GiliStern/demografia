// Save system using localStorage

class SaveSystem {
    constructor() {
        this.saveKeys = getSaveKeys();
        this.settings = this.loadSettings();
        this.progress = this.loadProgress();
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Listen for setting changes
        window.addEventListener('settingChanged', (e) => {
            this.updateSetting(e.detail.path, e.detail.value);
        });
        
        // Auto-save every 30 seconds during gameplay
        setInterval(() => {
            if (window.gameState && window.gameState.currentScreen === 'gameplay') {
                this.saveProgress();
            }
        }, 30000);
        
        // Save before page unload
        window.addEventListener('beforeunload', () => {
            this.saveAll();
        });
    }
    
    // Settings management
    loadSettings() {
        try {
            const saved = localStorage.getItem(this.saveKeys.settings);
            if (saved) {
                const settings = JSON.parse(saved);
                return this.validateSettings(settings);
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
        
        return this.getDefaultSettings();
    }
    
    getDefaultSettings() {
        return {
            music_volume: 70,
            sfx_volume: 80,
            fullscreen: false,
            pixel_scale: 2,
            language: 'he',
            controls: {
                keyboard: true,
                gamepad: true,
                touch: true
            },
            accessibility: {
                high_contrast: false,
                reduced_motion: false,
                screen_flash: true
            }
        };
    }
    
    validateSettings(settings) {
        const defaults = this.getDefaultSettings();
        const validated = { ...defaults };
        
        // Validate and clamp numeric values
        if (typeof settings.music_volume === 'number') {
            validated.music_volume = MathUtils.clamp(settings.music_volume, 0, 100);
        }
        if (typeof settings.sfx_volume === 'number') {
            validated.sfx_volume = MathUtils.clamp(settings.sfx_volume, 0, 100);
        }
        if (typeof settings.pixel_scale === 'number') {
            validated.pixel_scale = MathUtils.clamp(settings.pixel_scale, 1, 4);
        }
        
        // Validate boolean values
        if (typeof settings.fullscreen === 'boolean') {
            validated.fullscreen = settings.fullscreen;
        }
        
        // Validate string values
        if (typeof settings.language === 'string') {
            validated.language = settings.language;
        }
        
        // Validate nested objects
        if (settings.controls && typeof settings.controls === 'object') {
            validated.controls = { ...defaults.controls, ...settings.controls };
        }
        
        if (settings.accessibility && typeof settings.accessibility === 'object') {
            validated.accessibility = { ...defaults.accessibility, ...settings.accessibility };
        }
        
        return validated;
    }
    
    saveSettings() {
        try {
            localStorage.setItem(this.saveKeys.settings, JSON.stringify(this.settings));
            console.log('Settings saved');
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }
    
    updateSetting(path, value) {
        const parts = path.split('.');
        let obj = this.settings;
        
        // Navigate to the parent object
        for (let i = 0; i < parts.length - 1; i++) {
            if (!obj[parts[i]]) {
                obj[parts[i]] = {};
            }
            obj = obj[parts[i]];
        }
        
        // Set the value
        obj[parts[parts.length - 1]] = value;
        
        // Apply setting immediately
        this.applySetting(path, value);
        
        // Save to localStorage
        this.saveSettings();
    }
    
    applySetting(path, value) {
        const audioManager = getAudioManager();
        
        switch (path) {
            case 'settings.music_volume':
                if (audioManager) {
                    audioManager.setMusicVolume(value / 100);
                }
                break;
                
            case 'settings.sfx_volume':
                if (audioManager) {
                    audioManager.setSFXVolume(value / 100);
                }
                break;
                
            case 'settings.fullscreen':
                if (value && !document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(console.warn);
                } else if (!value && document.fullscreenElement) {
                    document.exitFullscreen().catch(console.warn);
                }
                break;
                
            case 'settings.pixel_scale':
                this.updatePixelScale(value);
                break;
                
            default:
                console.log('Setting applied:', path, value);
        }
    }
    
    updatePixelScale(scale) {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            // Update canvas scaling
            const baseWidth = GAME_CONFIG.CANVAS_WIDTH;
            const baseHeight = GAME_CONFIG.CANVAS_HEIGHT;
            
            canvas.style.width = `${baseWidth * scale}px`;
            canvas.style.height = `${baseHeight * scale}px`;
            
            // Update CSS pixel rendering
            canvas.style.imageRendering = scale > 1 ? 'pixelated' : 'auto';
        }
    }
    
    getSetting(path) {
        const parts = path.split('.');
        let obj = this.settings;
        
        for (const part of parts) {
            if (obj && obj[part] !== undefined) {
                obj = obj[part];
            } else {
                return null;
            }
        }
        
        return obj;
    }
    
    // Progress management
    loadProgress() {
        try {
            const saved = localStorage.getItem(this.saveKeys.progress);
            if (saved) {
                const progress = JSON.parse(saved);
                return this.validateProgress(progress);
            }
        } catch (error) {
            console.warn('Failed to load progress:', error);
        }
        
        return this.getDefaultProgress();
    }
    
    getDefaultProgress() {
        return {
            version: gameConfig?.meta?.version || '0.1.0',
            player: {
                gold: 0,
                totalGold: 0,
                totalPlayTime: 0,
                gamesPlayed: 0,
                gamesWon: 0
            },
            characters: {
                unlocked: ['sruLik'], // Default character unlocked
                stats: {}
            },
            stages: {
                unlocked: ['tel_aviv'], // Default stage unlocked
                bestTimes: {},
                highScores: {}
            },
            weapons: {
                unlocked: ['magic_wand'],
                stats: {},
                evolutions: []
            },
            achievements: {
                unlocked: [],
                progress: {}
            },
            meta_upgrades: {
                purchased: {},
                levels: {}
            },
            statistics: {
                totalEnemiesKilled: 0,
                totalDamageDealt: 0,
                totalExperienceGained: 0,
                favoriteWeapon: null,
                longestSurvivalTime: 0
            }
        };
    }
    
    validateProgress(progress) {
        const defaults = this.getDefaultProgress();
        
        // Ensure all required sections exist
        const validated = {
            version: progress.version || defaults.version,
            player: { ...defaults.player, ...(progress.player || {}) },
            characters: { ...defaults.characters, ...(progress.characters || {}) },
            stages: { ...defaults.stages, ...(progress.stages || {}) },
            weapons: { ...defaults.weapons, ...(progress.weapons || {}) },
            achievements: { ...defaults.achievements, ...(progress.achievements || {}) },
            meta_upgrades: { ...defaults.meta_upgrades, ...(progress.meta_upgrades || {}) },
            statistics: { ...defaults.statistics, ...(progress.statistics || {}) }
        };
        
        // Ensure arrays are valid
        if (!Array.isArray(validated.characters.unlocked)) {
            validated.characters.unlocked = defaults.characters.unlocked;
        }
        if (!Array.isArray(validated.stages.unlocked)) {
            validated.stages.unlocked = defaults.stages.unlocked;
        }
        if (!Array.isArray(validated.weapons.unlocked)) {
            validated.weapons.unlocked = defaults.weapons.unlocked;
        }
        if (!Array.isArray(validated.achievements.unlocked)) {
            validated.achievements.unlocked = defaults.achievements.unlocked;
        }
        
        // Ensure numeric values are valid
        validated.player.gold = Math.max(0, validated.player.gold || 0);
        validated.player.totalGold = Math.max(0, validated.player.totalGold || 0);
        validated.player.totalPlayTime = Math.max(0, validated.player.totalPlayTime || 0);
        
        return validated;
    }
    
    saveProgress() {
        try {
            localStorage.setItem(this.saveKeys.progress, JSON.stringify(this.progress));
            console.log('Progress saved');
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    }
    
    updateProgress(updates) {
        // Deep merge updates into progress
        this.progress = this.deepMerge(this.progress, updates);
        this.saveProgress();
    }
    
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }
    
    // Character management
    unlockCharacter(characterId) {
        if (!this.progress.characters.unlocked.includes(characterId)) {
            this.progress.characters.unlocked.push(characterId);
            this.saveProgress();
            
            // Trigger achievement check
            this.checkAchievements('character_unlock', { characterId });
            
            return true;
        }
        return false;
    }
    
    isCharacterUnlocked(characterId) {
        return this.progress.characters.unlocked.includes(characterId);
    }
    
    // Stage management
    unlockStage(stageId) {
        if (!this.progress.stages.unlocked.includes(stageId)) {
            this.progress.stages.unlocked.push(stageId);
            this.saveProgress();
            
            this.checkAchievements('stage_unlock', { stageId });
            
            return true;
        }
        return false;
    }
    
    isStageUnlocked(stageId) {
        return this.progress.stages.unlocked.includes(stageId);
    }
    
    updateBestTime(stageId, time) {
        const currentBest = this.progress.stages.bestTimes[stageId];
        if (!currentBest || time < currentBest) {
            this.progress.stages.bestTimes[stageId] = time;
            this.saveProgress();
            return true;
        }
        return false;
    }
    
    // Achievement system
    checkAchievements(eventType, data) {
        const achievements = getAchievements();
        
        achievements.forEach(achievement => {
            if (this.progress.achievements.unlocked.includes(achievement.id)) {
                return; // Already unlocked
            }
            
            if (this.checkAchievementCondition(achievement, eventType, data)) {
                this.unlockAchievement(achievement.id);
            }
        });
    }
    
    checkAchievementCondition(achievement, eventType, data) {
        // This would contain the logic for checking achievement conditions
        // For now, we'll implement basic examples
        
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
    
    unlockAchievement(achievementId) {
        this.progress.achievements.unlocked.push(achievementId);
        this.saveProgress();
        
        // Show achievement notification
        this.showAchievementNotification(achievementId);
        
        console.log('Achievement unlocked:', achievementId);
    }
    
    showAchievementNotification(achievementId) {
        const achievements = getAchievements();
        const achievement = achievements.find(a => a.id === achievementId);
        
        if (achievement) {
            // Create achievement notification
            const notification = document.createElement('div');
            notification.className = 'achievement-notification';
            notification.innerHTML = `
                <h3>🏆 ${getText('ui_strings.achievements.title')}</h3>
                <p>${achievement.name_he}</p>
            `;
            
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0,0,0,0.9);
                color: #f39c12;
                padding: 15px;
                border-radius: 8px;
                border: 2px solid #f39c12;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
            `;
            
            document.body.appendChild(notification);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                notification.style.animation = 'fadeOut 0.5s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 500);
            }, 5000);
            
            // Play achievement sound
            const audioManager = getAudioManager();
            if (audioManager) {
                audioManager.playPowerup();
            }
        }
    }
    
    // Meta upgrade system
    buyMetaUpgrade(upgradeId, cost) {
        if (this.progress.player.gold >= cost) {
            this.progress.player.gold -= cost;
            
            // Increase upgrade level
            const currentLevel = this.progress.meta_upgrades.levels[upgradeId] || 0;
            this.progress.meta_upgrades.levels[upgradeId] = currentLevel + 1;
            
            if (!this.progress.meta_upgrades.purchased[upgradeId]) {
                this.progress.meta_upgrades.purchased[upgradeId] = true;
            }
            
            this.saveProgress();
            
            this.checkAchievements('meta_upgrade', { upgradeId, level: currentLevel + 1 });
            
            return true;
        }
        return false;
    }
    
    getMetaUpgradeLevel(upgradeId) {
        return this.progress.meta_upgrades.levels[upgradeId] || 0;
    }
    
    // Game session management
    startGameSession(characterId, stageId) {
        this.currentSession = {
            startTime: Date.now(),
            characterId,
            stageId,
            stats: {
                enemiesKilled: 0,
                damageDealt: 0,
                experienceGained: 0,
                goldEarned: 0
            }
        };
    }
    
    updateSessionStats(stats) {
        if (this.currentSession) {
            Object.assign(this.currentSession.stats, stats);
        }
    }
    
    endGameSession(result) {
        if (!this.currentSession) return;
        
        const sessionTime = (Date.now() - this.currentSession.startTime) / 1000;
        const stats = this.currentSession.stats;
        
        // Update player progress
        this.updateProgress({
            player: {
                totalPlayTime: this.progress.player.totalPlayTime + sessionTime,
                gamesPlayed: this.progress.player.gamesPlayed + 1,
                gamesWon: this.progress.player.gamesWon + (result.victory ? 1 : 0),
                gold: this.progress.player.gold + stats.goldEarned,
                totalGold: this.progress.player.totalGold + stats.goldEarned
            },
            statistics: {
                totalEnemiesKilled: this.progress.statistics.totalEnemiesKilled + stats.enemiesKilled,
                totalDamageDealt: this.progress.statistics.totalDamageDealt + stats.damageDealt,
                totalExperienceGained: this.progress.statistics.totalExperienceGained + stats.experienceGained,
                longestSurvivalTime: Math.max(this.progress.statistics.longestSurvivalTime, sessionTime)
            }
        });
        
        // Update stage best times
        if (result.victory) {
            this.updateBestTime(this.currentSession.stageId, sessionTime);
        }
        
        // Check achievements
        this.checkAchievements('game_complete', {
            survivalTime: sessionTime,
            victory: result.victory,
            ...stats
        });
        
        this.currentSession = null;
    }
    
    // Data management
    saveAll() {
        this.saveSettings();
        this.saveProgress();
    }
    
    exportData() {
        return {
            settings: this.settings,
            progress: this.progress,
            exportDate: new Date().toISOString()
        };
    }
    
    importData(data) {
        try {
            if (data.settings) {
                this.settings = this.validateSettings(data.settings);
                this.saveSettings();
            }
            
            if (data.progress) {
                this.progress = this.validateProgress(data.progress);
                this.saveProgress();
            }
            
            console.log('Data imported successfully');
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }
    
    resetProgress() {
        this.progress = this.getDefaultProgress();
        this.saveProgress();
        console.log('Progress reset');
    }
    
    resetSettings() {
        this.settings = this.getDefaultSettings();
        this.saveSettings();
        console.log('Settings reset');
    }
    
    // Get data for UI
    getPlayerData() {
        return {
            ...this.progress.player,
            settings: this.settings,
            unlockedCharacters: this.progress.characters.unlocked,
            unlockedStages: this.progress.stages.unlocked,
            unlockedAchievements: this.progress.achievements.unlocked
        };
    }
}

// Create save system instance
const saveSystem = new SaveSystem();

// Export save system
window.SaveSystem = SaveSystem;
window.saveSystem = saveSystem;

