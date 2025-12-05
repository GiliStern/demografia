// Audio system for music and sound effects

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;

    this.sounds = new Map();
    this.music = new Map();
    this.currentMusic = null;
    this.musicLoopTimeout = null;

    this.settings = {
      masterVolume: 1.0,
      musicVolume: 0.7,
      sfxVolume: 0.8,
      muted: false,
    };

    // Disable external file loading to avoid 404s; use procedural/silent placeholders
    this.useExternalFiles = false;

    this.loadQueue = [];
    this.loadPromises = new Map();

    this.initializeAudio();
  }

  async initializeAudio() {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Create gain nodes
      this.masterGain = this.audioContext.createGain();
      this.musicGain = this.audioContext.createGain();
      this.sfxGain = this.audioContext.createGain();

      // Connect the chain
      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);

      // Set initial volumes
      this.updateVolumes();

      console.log("Audio system initialized");

      // Load game sounds
      this.loadGameAudio();
    } catch (error) {
      console.warn("Audio initialization failed:", error);
      // Fallback to HTML5 audio
      this.initializeHTMLAudio();
    }
  }

  initializeHTMLAudio() {
    console.log("Using HTML5 audio fallback");
    this.htmlAudioMode = true;
    this.loadGameAudio();
  }

  async loadGameAudio() {
    // If disabled, register placeholders and return to avoid 404s
    if (!this.useExternalFiles) {
      const sfxIds = [
        "button_click",
        "weapon_fire",
        "enemy_hit",
        "pickup_item",
        "level_up",
        "player_hurt",
        "enemy_death",
        "powerup",
      ];

      // Prefer procedural generator for SFX
      const generator = window.getSoundGenerator
        ? window.getSoundGenerator()
        : null;
      for (const id of sfxIds) {
        const sound = generator?.getSound ? generator.getSound(id) : null;
        if (sound) {
          this.sounds.set(id, sound);
        } else {
          this.createSilentPlaceholder(id, "sfx");
        }
      }

      // Music placeholders
      const musicIds = ["menu_music", "gameplay_music", "victory_music"];
      for (const id of musicIds) {
        const music = this.createProceduralMusic(id);
        if (music) this.music.set(id, music);
      }

      console.log("Audio placeholders initialized (no external files)");
      return;
    }

    // External files path (not used when useExternalFiles = false)
    const audioFiles = [
      { id: "menu_music", path: "music/menu.ogg", type: "music" },
      { id: "gameplay_music", path: "music/gameplay.ogg", type: "music" },
      { id: "victory_music", path: "music/victory.ogg", type: "music" },
      { id: "button_click", path: "sfx/button_click.ogg", type: "sfx" },
      { id: "weapon_fire", path: "sfx/weapon_fire.ogg", type: "sfx" },
      { id: "enemy_hit", path: "sfx/enemy_hit.ogg", type: "sfx" },
      { id: "pickup_item", path: "sfx/pickup_item.ogg", type: "sfx" },
      { id: "level_up", path: "sfx/level_up.ogg", type: "sfx" },
      { id: "player_hurt", path: "sfx/player_hurt.ogg", type: "sfx" },
      { id: "enemy_death", path: "sfx/enemy_death.ogg", type: "sfx" },
      { id: "powerup", path: "sfx/powerup.ogg", type: "sfx" },
    ];

    const loadPromises = audioFiles.map((file) => this.loadAudioFile(file));
    await Promise.allSettled(loadPromises);
  }

  async loadAudioFile({ id, path, type }) {
    const fullPath = `hebrew_vampire_survivors_package/${path}`;

    try {
      if (this.htmlAudioMode) {
        return this.loadHTMLAudio(id, fullPath, type);
      } else {
        return this.loadWebAudio(id, fullPath, type);
      }
    } catch (error) {
      console.warn(`Failed to load audio file ${id}:`, error);
      // Create silent placeholder
      this.createSilentPlaceholder(id, type);
    }
  }

  async loadHTMLAudio(id, path, type) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();

      audio.addEventListener("canplaythrough", () => {
        if (type === "music") {
          audio.loop = true;
          this.music.set(id, audio);
        } else {
          this.sounds.set(id, audio);
        }
        resolve();
      });

      audio.addEventListener("error", reject);

      // Try multiple formats
      const formats = [".ogg", ".mp3", ".wav"];
      let formatIndex = 0;

      const tryNextFormat = () => {
        if (formatIndex >= formats.length) {
          reject(new Error("No supported format found"));
          return;
        }

        const basePath = path.replace(/\.[^.]+$/, "");
        audio.src = basePath + formats[formatIndex];
        formatIndex++;
      };

      audio.addEventListener("error", () => {
        tryNextFormat();
      });

      tryNextFormat();
    });
  }

  async loadWebAudio(id, path, type) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(path);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(
          arrayBuffer
        );

        if (type === "music") {
          this.music.set(id, audioBuffer);
        } else {
          this.sounds.set(id, audioBuffer);
        }

        resolve();
      } catch (error) {
        // Try alternative formats
        const formats = [".mp3", ".wav"];
        const basePath = path.replace(/\.[^.]+$/, "");

        for (const format of formats) {
          try {
            const response = await fetch(basePath + format);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(
              arrayBuffer
            );

            if (type === "music") {
              this.music.set(id, audioBuffer);
            } else {
              this.sounds.set(id, audioBuffer);
            }

            resolve();
            return;
          } catch (e) {
            continue;
          }
        }

        reject(error);
      }
    });
  }

  createSilentPlaceholder(id, type) {
    // Try to use procedural sound generator first for SFX
    if (type === "sfx" && window.getSoundGenerator) {
      const generator = window.getSoundGenerator();
      if (generator && generator.getSound(id)) {
        console.log("Using procedural sound for:", id);
        this.sounds.set(id, generator.getSound(id));
        return;
      }
    }

    if (this.htmlAudioMode) {
      const silentAudio = new Audio();
      silentAudio.src =
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+brvmsbCzaH0fi8diMFl3PH8N+PTQNFR5LRq4E4H2/BhFqSf0YQAAAAABsBAR5m";
      if (type === "music") {
        this.music.set(id, silentAudio);
      } else {
        this.sounds.set(id, silentAudio);
      }
    } else {
      // Fallback to silent buffer for Web Audio
      const buffer = this.audioContext.createBuffer(
        1,
        1,
        this.audioContext.sampleRate
      );
      if (type === "music") {
        this.music.set(id, buffer);
      } else {
        this.sounds.set(id, buffer);
      }
    }
  }

  playSound(id, volume = 1.0, pitch = 1.0) {
    if (this.settings.muted) return;

    let sound = this.sounds.get(id);
    if (!sound) {
      // Try procedural sound generator as fallback
      if (window.getSoundGenerator) {
        const generator = window.getSoundGenerator();
        if (generator) {
          sound = generator.getSound(id);
          if (sound) {
            // Store the procedural sound for future use
            this.sounds.set(id, sound);
          } else {
            console.warn("Sound not found:", id);
            return;
          }
        } else {
          console.warn("Sound not found:", id);
          return;
        }
      } else {
        console.warn("Sound not found:", id);
        return;
      }
    }

    try {
      // Check if sound is a procedural sound object
      if (sound && typeof sound.play === "function" && !sound.cloneNode) {
        // This is a procedural sound
        const adjustedVolume =
          volume * this.settings.sfxVolume * this.settings.masterVolume;
        sound.play(adjustedVolume, pitch);
        return sound;
      }

      if (this.htmlAudioMode) {
        const audioClone = sound.cloneNode();
        audioClone.volume =
          volume * this.settings.sfxVolume * this.settings.masterVolume;
        audioClone.playbackRate = pitch;
        audioClone.play().catch((e) => console.warn("Sound play failed:", e));
        return audioClone;
      } else {
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = sound;
        source.playbackRate.value = pitch;
        gainNode.gain.value = volume;

        source.connect(gainNode);
        gainNode.connect(this.sfxGain);

        source.start();
        return source;
      }
    } catch (error) {
      console.warn("Error playing sound:", error);
    }
  }

  playMusic(id, fadeIn = true) {
    if (this.currentMusic === id) return;

    // Stop current music
    this.stopMusic();

    let music = this.music.get(id);
    if (!music) {
      // Try procedural music generator as fallback
      if (window.getSoundGenerator) {
        const generator = window.getSoundGenerator();
        if (generator) {
          // Create a simple procedural music placeholder
          music = this.createProceduralMusic(id);
          if (music) {
            this.music.set(id, music);
          } else {
            console.warn("Music not found:", id);
            return;
          }
        } else {
          console.warn("Music not found:", id);
          return;
        }
      } else {
        console.warn("Music not found:", id);
        return;
      }
    }

    try {
      if (this.htmlAudioMode) {
        music.volume = 0;
        music.currentTime = 0;
        music.play().catch((e) => console.warn("Music play failed:", e));

        if (fadeIn) {
          this.fadeInMusic(music);
        } else {
          music.volume = this.settings.musicVolume * this.settings.masterVolume;
        }

        this.currentMusic = id;
        this.currentMusicElement = music;
      } else {
        const source = this.audioContext.createBufferSource();
        source.buffer = music;
        source.loop = true;
        source.connect(this.musicGain);

        if (fadeIn) {
          this.musicGain.gain.setValueAtTime(0, this.audioContext.currentTime);
          this.musicGain.gain.linearRampToValueAtTime(
            this.settings.musicVolume,
            this.audioContext.currentTime + 1
          );
        }

        source.start();
        this.currentMusic = id;
        this.currentMusicSource = source;
      }
    } catch (error) {
      console.warn("Error playing music:", error);
    }
  }

  stopMusic(fadeOut = true) {
    if (!this.currentMusic) return;

    try {
      if (this.htmlAudioMode && this.currentMusicElement) {
        if (fadeOut) {
          this.fadeOutMusic(this.currentMusicElement);
        } else {
          this.currentMusicElement.pause();
          this.currentMusicElement.currentTime = 0;
        }
      } else if (this.currentMusicSource) {
        if (fadeOut) {
          this.musicGain.gain.linearRampToValueAtTime(
            0,
            this.audioContext.currentTime + 0.5
          );
          setTimeout(() => {
            if (this.currentMusicSource) {
              this.currentMusicSource.stop();
            }
          }, 500);
        } else {
          this.currentMusicSource.stop();
        }
      }
    } catch (error) {
      console.warn("Error stopping music:", error);
    }

    this.currentMusic = null;
    this.currentMusicSource = null;
    this.currentMusicElement = null;
  }

  fadeInMusic(musicElement) {
    const targetVolume = this.settings.musicVolume * this.settings.masterVolume;
    const steps = 20;
    const stepTime = 50;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      musicElement.volume = (currentStep / steps) * targetVolume;

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
      }
    }, stepTime);
  }

  fadeOutMusic(musicElement) {
    const startVolume = musicElement.volume;
    const steps = 10;
    const stepTime = 50;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      musicElement.volume = startVolume * (1 - currentStep / steps);

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        musicElement.pause();
        musicElement.currentTime = 0;
      }
    }, stepTime);
  }

  createProceduralMusic(id) {
    // Create a simple procedural music placeholder
    // For now, just create a very quiet ambient tone that loops
    if (this.htmlAudioMode) {
      const silentAudio = new Audio();
      silentAudio.src =
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+brvmsbCzaH0fi8diMFl3PH8N+PTQNFR5LRq4E4H2/BhFqSf0YQAAAAABsBAR5m";
      silentAudio.loop = true;
      return silentAudio;
    } else {
      // Create a short silent buffer that can be looped
      const buffer = this.audioContext.createBuffer(
        1,
        this.audioContext.sampleRate * 2,
        this.audioContext.sampleRate
      );
      return buffer;
    }
  }

  updateVolumes() {
    if (this.masterGain) {
      this.masterGain.gain.value = this.settings.masterVolume;
    }
    if (this.musicGain) {
      this.musicGain.gain.value = this.settings.musicVolume;
    }
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.settings.sfxVolume;
    }

    // Update HTML audio volumes
    if (this.currentMusicElement) {
      this.currentMusicElement.volume =
        this.settings.musicVolume * this.settings.masterVolume;
    }
  }

  setMasterVolume(volume) {
    this.settings.masterVolume = MathUtils.clamp(volume, 0, 1);
    this.updateVolumes();
  }

  setMusicVolume(volume) {
    this.settings.musicVolume = MathUtils.clamp(volume, 0, 1);
    this.updateVolumes();
  }

  setSFXVolume(volume) {
    this.settings.sfxVolume = MathUtils.clamp(volume, 0, 1);
    this.updateVolumes();
  }

  mute() {
    this.settings.muted = true;
    if (this.masterGain) {
      this.masterGain.gain.value = 0;
    }
    if (this.currentMusicElement) {
      this.currentMusicElement.volume = 0;
    }
  }

  unmute() {
    this.settings.muted = false;
    this.updateVolumes();
  }

  toggleMute() {
    if (this.settings.muted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  // Resume audio context on user interaction
  resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume().then(() => {
        console.log("Audio context resumed");
      });
    }
  }

  // Convenience methods for common game sounds
  playButtonClick() {
    this.playSound("button_click", 0.5);
  }

  playWeaponFire() {
    this.playSound("weapon_fire", 0.3, MathUtils.random(0.9, 1.1));
  }

  playEnemyHit() {
    this.playSound("enemy_hit", 0.4, MathUtils.random(0.8, 1.2));
  }

  playPickupItem() {
    this.playSound("pickup_item", 0.6);
  }

  playLevelUp() {
    this.playSound("level_up", 0.8);
  }

  playPlayerHurt() {
    this.playSound("player_hurt", 0.7);
  }

  playEnemyDeath() {
    this.playSound("enemy_death", 0.5, MathUtils.random(0.9, 1.1));
  }

  playPowerup() {
    this.playSound("powerup", 0.8);
  }

  // Music management for different game states
  playMenuMusic() {
    this.playMusic("menu_music");
  }

  playGameplayMusic() {
    this.playMusic("gameplay_music");
  }

  playVictoryMusic() {
    this.playMusic("victory_music");
  }

  // Get current settings for save system
  getSettings() {
    return { ...this.settings };
  }

  // Load settings from save system
  loadSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    this.updateVolumes();
  }

  // Clean up
  destroy() {
    this.stopMusic(false);

    if (this.audioContext) {
      this.audioContext.close();
    }

    this.sounds.clear();
    this.music.clear();
  }
}

// Audio manager instance
let audioManager = null;

// Initialize audio on first user interaction
function initializeAudioOnInteraction() {
  if (audioManager) {
    audioManager.resumeAudioContext();
    return;
  }

  audioManager = new AudioManager();

  // Remove listeners after first interaction
  document.removeEventListener("click", initializeAudioOnInteraction);
  document.removeEventListener("touchstart", initializeAudioOnInteraction);
  document.removeEventListener("keydown", initializeAudioOnInteraction);
}

// Add event listeners for user interaction
document.addEventListener("click", initializeAudioOnInteraction);
document.addEventListener("touchstart", initializeAudioOnInteraction);
document.addEventListener("keydown", initializeAudioOnInteraction);

// Export audio manager
window.AudioManager = AudioManager;
window.getAudioManager = () => audioManager;
