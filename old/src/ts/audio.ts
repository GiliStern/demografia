import { MathUtils } from './utils';

type SoundLike = AudioBuffer | HTMLAudioElement | { play: (volume?: number, pitch?: number) => void };

class AudioManagerTS {
  private audioContext: AudioContext | null = null;
  private htmlAudioMode = false;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private sounds: Map<string, SoundLike> = new Map();
  private music: Map<string, SoundLike> = new Map();
  private currentMusic: string | null = null;
  private currentMusicSource: AudioBufferSourceNode | null = null;
  private currentMusicElement: HTMLAudioElement | null = null;
  private useExternalFiles = false; // keep disabled to avoid 404s

  private settings = {
    masterVolume: 1.0,
    musicVolume: 0.7,
    sfxVolume: 0.8,
    muted: false,
  };

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.musicGain = this.audioContext.createGain();
      this.sfxGain = this.audioContext.createGain();
      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);
      this.updateVolumes();
      console.log('Audio system initialized');
      await this.loadGameAudio();
    } catch (error) {
      console.warn('Audio initialization failed:', error);
      this.initializeHTMLAudio();
    }
  }

  private initializeHTMLAudio(): void {
    console.log('Using HTML5 audio fallback');
    this.htmlAudioMode = true;
    this.loadGameAudio();
  }

  private async loadGameAudio(): Promise<void> {
    if (!this.useExternalFiles) {
      const sfxIds = [
        'button_click',
        'weapon_fire',
        'enemy_hit',
        'pickup_item',
        'level_up',
        'player_hurt',
        'enemy_death',
        'powerup',
      ];
      const generator = (window as any).getSoundGenerator ? (window as any).getSoundGenerator() : null;
      for (const id of sfxIds) {
        const sound = generator?.getSound ? generator.getSound(id) : null;
        if (sound) this.sounds.set(id, sound);
        else this.createSilentPlaceholder(id, 'sfx');
      }
      const musicIds = ['menu_music', 'gameplay_music', 'victory_music'];
      for (const id of musicIds) {
        const music = this.createProceduralMusic(id);
        if (music) this.music.set(id, music);
      }
      console.log('Audio placeholders initialized (no external files)');
      return;
    }
    // External file loading path retained but unused
  }

  private createSilentPlaceholder(id: string, type: 'sfx' | 'music'): void {
    if (type === 'sfx' && (window as any).getSoundGenerator) {
      const generator = (window as any).getSoundGenerator();
      const sound = generator?.getSound?.(id);
      if (sound) {
        this.sounds.set(id, sound);
        return;
      }
    }
    if (this.htmlAudioMode) {
      const el = new Audio();
      el.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+brvmsbCzaH0fi8diMFl3PH8N+PTQNFR5LRq4E4H2/BhFqSf0YQAAAAABsBAR5m';
      if (type === 'music') this.music.set(id, el);
      else this.sounds.set(id, el);
    } else if (this.audioContext) {
      const buffer = this.audioContext.createBuffer(1, 1, this.audioContext.sampleRate);
      if (type === 'music') this.music.set(id, buffer);
      else this.sounds.set(id, buffer);
    }
  }

  private createProceduralMusic(): HTMLAudioElement | AudioBuffer | null {
    if (this.htmlAudioMode) {
      const el = new Audio();
      el.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+brvmsbCzaH0fi8diMFl3PH8N+PTQNFR5LRq4E4H2/BhFqSf0YQAAAAABsBAR5m';
      el.loop = true;
      return el;
    }
    if (!this.audioContext) return null;
    return this.audioContext.createBuffer(1, this.audioContext.sampleRate * 2, this.audioContext.sampleRate);
  }

  playSound(id: string, volume = 1.0, pitch = 1.0): any {
    if (this.settings.muted) return;
    let sound = this.sounds.get(id);
    if (!sound) {
      const generator = (window as any).getSoundGenerator ? (window as any).getSoundGenerator() : null;
      sound = generator?.getSound?.(id);
      if (sound) this.sounds.set(id, sound);
      else return;
    }
    try {
      if (typeof (sound as any).play === 'function' && !(sound as any).cloneNode) {
        const adjusted = volume * this.settings.sfxVolume * this.settings.masterVolume;
        (sound as any).play(adjusted, pitch);
        return sound;
      }
      if (this.htmlAudioMode && sound instanceof HTMLAudioElement) {
        const clone = sound.cloneNode() as HTMLAudioElement;
        clone.volume = volume * this.settings.sfxVolume * this.settings.masterVolume;
        clone.playbackRate = pitch;
        clone.play().catch(() => undefined);
        return clone;
      }
      if (this.audioContext && sound instanceof AudioBuffer) {
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        source.buffer = sound;
        source.playbackRate.value = pitch;
        gainNode.gain.value = volume;
        source.connect(gainNode);
        gainNode.connect(this.sfxGain!);
        source.start();
        return source;
      }
    } catch (e) {
      console.warn('Error playing sound:', e);
    }
  }

  playMusic(id: string, fadeIn = true): void {
    if (this.currentMusic === id) return;
    this.stopMusic();
    let music = this.music.get(id);
    if (!music) {
      music = this.createProceduralMusic() as any;
      if (music) this.music.set(id, music);
      else return;
    }
    try {
      if (this.htmlAudioMode && music instanceof HTMLAudioElement) {
        music.volume = 0; music.currentTime = 0; music.play().catch(() => undefined);
        if (fadeIn) this.fadeInMusic(music);
        else music.volume = this.settings.musicVolume * this.settings.masterVolume;
        this.currentMusic = id; this.currentMusicElement = music;
      } else if (this.audioContext && music instanceof AudioBuffer) {
        const source = this.audioContext.createBufferSource();
        source.buffer = music; source.loop = true; source.connect(this.musicGain!);
        if (fadeIn) {
          this.musicGain!.gain.setValueAtTime(0, this.audioContext.currentTime);
          this.musicGain!.gain.linearRampToValueAtTime(this.settings.musicVolume, this.audioContext.currentTime + 1);
        }
        source.start();
        this.currentMusic = id; this.currentMusicSource = source;
      }
    } catch (e) {
      console.warn('Error playing music:', e);
    }
  }

  // Convenience wrappers used across the codebase (parity with legacy JS)
  playMenuMusic(): void { this.playMusic('menu_music'); }
  playGameplayMusic(): void { this.playMusic('gameplay_music'); }

  // Common SFX convenience helpers referenced in TS/JS
  playButtonClick(): void { this.playSound('button_click', 0.8, 1.0); }
  playPowerup(): void { this.playSound('powerup', 0.9, 1.0); }
  playPickupItem(): void { this.playSound('pickup_item', 0.8, 1.0); }
  playEnemyDeath(): void { this.playSound('enemy_death', 0.7, 1.0); }
  playWeaponFire(): void { this.playSound('weapon_fire', 0.6, 1.0); }

  stopMusic(fadeOut = true): void {
    if (!this.currentMusic) return;
    try {
      if (this.htmlAudioMode && this.currentMusicElement) {
        if (fadeOut) this.fadeOutMusic(this.currentMusicElement);
        else { this.currentMusicElement.pause(); this.currentMusicElement.currentTime = 0; }
      } else if (this.audioContext && this.currentMusicSource) {
        if (fadeOut) {
          this.musicGain!.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5);
          setTimeout(() => this.currentMusicSource?.stop(), 500);
        } else {
          this.currentMusicSource.stop();
        }
      }
    } catch (e) {
      // ignore
      void e;
    }
    this.currentMusic = null; this.currentMusicSource = null; this.currentMusicElement = null;
  }

  private fadeInMusic(el: HTMLAudioElement): void {
    const target = this.settings.musicVolume * this.settings.masterVolume;
    const steps = 20; const stepTime = 50; let i = 0;
    const interval = setInterval(() => { i++; el.volume = (i / steps) * target; if (i >= steps) clearInterval(interval); }, stepTime);
  }

  private fadeOutMusic(el: HTMLAudioElement): void {
    const start = el.volume; const steps = 10; const stepTime = 50; let i = 0;
    const interval = setInterval(() => {
      i++; el.volume = start * (1 - i / steps);
      if (i >= steps) { clearInterval(interval); el.pause(); el.currentTime = 0; }
    }, stepTime);
  }

  updateVolumes(): void {
    if (this.masterGain) this.masterGain.gain.value = this.settings.masterVolume;
    if (this.musicGain) this.musicGain.gain.value = this.settings.musicVolume;
    if (this.sfxGain) this.sfxGain.gain.value = this.settings.sfxVolume;
    if (this.currentMusicElement) this.currentMusicElement.volume = this.settings.musicVolume * this.settings.masterVolume;
  }

  setMasterVolume(v: number): void { this.settings.masterVolume = MathUtils.clamp(v, 0, 1); this.updateVolumes(); }
  setMusicVolume(v: number): void { this.settings.musicVolume = MathUtils.clamp(v, 0, 1); this.updateVolumes(); }
  setSFXVolume(v: number): void { this.settings.sfxVolume = MathUtils.clamp(v, 0, 1); this.updateVolumes(); }
  mute(): void { this.settings.muted = true; if (this.masterGain) this.masterGain.gain.value = 0; if (this.currentMusicElement) this.currentMusicElement.volume = 0; }
  unmute(): void { this.settings.muted = false; this.updateVolumes(); }
  toggleMute(): void { if (this.settings.muted) this.unmute(); else this.mute(); }
  resumeAudioContext(): void { if (this.audioContext && this.audioContext.state === 'suspended') this.audioContext.resume().then(() => console.log('Audio context resumed')); }
  getSettings(): any { return { ...this.settings }; }
  loadSettings(settings: any): void { this.settings = { ...this.settings, ...settings }; this.updateVolumes(); }
  destroy(): void { this.stopMusic(false); this.audioContext?.close(); this.sounds.clear(); this.music.clear(); }
}

let audioManagerTS: AudioManagerTS | null = null;
function initializeAudioOnInteractionTS(): void {
  if (audioManagerTS) { audioManagerTS.resumeAudioContext(); return; }
  audioManagerTS = new AudioManagerTS();
  document.removeEventListener('click', initializeAudioOnInteractionTS);
  document.removeEventListener('touchstart', initializeAudioOnInteractionTS);
  document.removeEventListener('keydown', initializeAudioOnInteractionTS);
}

document.addEventListener('click', initializeAudioOnInteractionTS);
document.addEventListener('touchstart', initializeAudioOnInteractionTS);
document.addEventListener('keydown', initializeAudioOnInteractionTS);

declare global {
  interface Window {
    AudioManager: typeof AudioManagerTS;
    getAudioManager: () => AudioManagerTS | null;
  }
}

(window as any).AudioManager = AudioManagerTS;
(window as any).getAudioManager = () => audioManagerTS;

export {};


