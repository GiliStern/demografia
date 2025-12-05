class SoundGeneratorTS {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, { play: (volume?: number, pitch?: number) => void }> = new Map();

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.generateAllSounds();
      console.log('Sound generator initialized with', this.sounds.size, 'sounds');
    } catch (error) {
      console.warn('Sound generator failed to initialize:', error);
    }
  }

  private generateAllSounds(): void {
    this.sounds.set('button_click', this.generateButtonClick());
    this.sounds.set('weapon_fire', this.generateWeaponFire());
    this.sounds.set('enemy_hit', this.generateEnemyHit());
    this.sounds.set('pickup_item', this.generatePickupItem());
    this.sounds.set('level_up', this.generateLevelUp());
    this.sounds.set('player_hurt', this.generatePlayerHurt());
    this.sounds.set('enemy_death', this.generateEnemyDeath());
    this.sounds.set('powerup', this.generatePowerup());
    // Extra themed
    this.sounds.set('shofar_blast', this.generateShofarBlast());
    this.sounds.set('coin_collect', this.generateCoinCollect());
    this.sounds.set('chicken_flap', this.generateChickenFlap());
    this.sounds.set('chair_throw', this.generateChairThrow());
    this.sounds.set('cactus_hit', this.generateCactusHit());
  }

  private generateButtonClick() {
    return this.createSound((ac, t) => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.connect(g); g.connect(ac.destination);
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.1);
      g.gain.setValueAtTime(0.3, t);
      g.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc.type = 'square';
      osc.start(t); osc.stop(t + 0.1);
    });
  }

  private generateWeaponFire() {
    return this.createSound((ac, t) => {
      const size = ac.sampleRate * 0.2;
      const buf = ac.createBuffer(1, size, ac.sampleRate);
      const out = buf.getChannelData(0);
      for (let i = 0; i < size; i++) out[i] = Math.random() * 2 - 1;
      const src = ac.createBufferSource(); src.buffer = buf;
      const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.setValueAtTime(300, t);
      const g = ac.createGain(); g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
      src.connect(f); f.connect(g); g.connect(ac.destination);
      src.start(t); src.stop(t + 0.2);
    });
  }

  private generateEnemyHit() {
    return this.createSound((ac, t) => {
      const osc = ac.createOscillator(); const g = ac.createGain();
      osc.connect(g); g.connect(ac.destination);
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);
      g.gain.setValueAtTime(0.4, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      osc.type = 'sawtooth'; osc.start(t); osc.stop(t + 0.15);
    });
  }

  private generatePickupItem() {
    return this.createSound((ac, t) => {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, i) => {
        const osc = ac.createOscillator(); const g = ac.createGain();
        osc.connect(g); g.connect(ac.destination);
        const start = t + i * 0.05;
        osc.frequency.setValueAtTime(freq, start);
        g.gain.setValueAtTime(0.3, start);
        g.gain.exponentialRampToValueAtTime(0.01, start + 0.2);
        osc.type = 'triangle'; osc.start(start); osc.stop(start + 0.2);
      });
    });
  }

  private generateLevelUp() {
    return this.createSound((ac, t) => {
      const freqs = [261.63, 329.63, 392.0, 523.25];
      freqs.forEach((f, i) => {
        const osc = ac.createOscillator(); const g = ac.createGain();
        osc.connect(g); g.connect(ac.destination);
        const start = t + i * 0.1;
        osc.frequency.setValueAtTime(f, start);
        g.gain.setValueAtTime(0.4, start);
        g.gain.exponentialRampToValueAtTime(0.01, start + 0.3);
        osc.type = 'sine'; osc.start(start); osc.stop(start + 0.3);
      });
    });
  }

  private generatePlayerHurt() {
    return this.createSound((ac, t) => {
      const osc = ac.createOscillator(); const g = ac.createGain();
      osc.connect(g); g.connect(ac.destination);
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.3);
      g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      osc.type = 'square'; osc.start(t); osc.stop(t + 0.3);
    });
  }

  private generateEnemyDeath() {
    return this.createSound((ac, t) => {
      const size = ac.sampleRate * 0.5;
      const buf = ac.createBuffer(1, size, ac.sampleRate);
      const out = buf.getChannelData(0);
      for (let i = 0; i < size; i++) out[i] = (Math.random() * 2 - 1) * (1 - i / size);
      const src = ac.createBufferSource(); src.buffer = buf;
      const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(800, t); f.frequency.exponentialRampToValueAtTime(100, t + 0.5);
      const g = ac.createGain(); g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
      src.connect(f); f.connect(g); g.connect(ac.destination);
      src.start(t); src.stop(t + 0.5);
    });
  }

  private generatePowerup() {
    return this.createSound((ac, t) => {
      [0, 0.1, 0.2, 0.3].forEach((delay, idx) => {
        const osc = ac.createOscillator(); const g = ac.createGain();
        osc.connect(g); g.connect(ac.destination);
        const base = 440 * Math.pow(2, idx * 0.25);
        osc.frequency.setValueAtTime(base, t + delay);
        osc.frequency.exponentialRampToValueAtTime(base * 2, t + delay + 0.4);
        g.gain.setValueAtTime(0.2, t + delay);
        g.gain.exponentialRampToValueAtTime(0.01, t + delay + 0.4);
        osc.type = 'sine'; osc.start(t + delay); osc.stop(t + delay + 0.4);
      });
    });
  }

  private generateShofarBlast() {
    return this.createSound((ac, t) => {
      const osc = ac.createOscillator(); const g = ac.createGain();
      osc.connect(g); g.connect(ac.destination);
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.setValueAtTime(230, t + 0.1);
      osc.frequency.setValueAtTime(220, t + 0.2);
      osc.frequency.setValueAtTime(240, t + 0.3);
      osc.frequency.setValueAtTime(220, t + 0.4);
      g.gain.setValueAtTime(0.4, t); g.gain.setValueAtTime(0.4, t + 0.4); g.gain.exponentialRampToValueAtTime(0.01, t + 0.8);
      osc.type = 'sawtooth'; osc.start(t); osc.stop(t + 0.8);
    });
  }

  private generateCoinCollect() {
    return this.createSound((ac, t) => {
      const osc = ac.createOscillator(); const g = ac.createGain();
      osc.connect(g); g.connect(ac.destination);
      osc.frequency.setValueAtTime(1000, t);
      osc.frequency.exponentialRampToValueAtTime(1500, t + 0.1);
      g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc.type = 'triangle'; osc.start(t); osc.stop(t + 0.1);
    });
  }

  private generateChickenFlap() {
    return this.createSound((ac, t) => {
      const size = ac.sampleRate * 0.3;
      const buf = ac.createBuffer(1, size, ac.sampleRate);
      const out = buf.getChannelData(0);
      for (let i = 0; i < size; i++) out[i] = (Math.random() * 2 - 1) * Math.sin((i / size) * Math.PI * 3) * 0.3;
      const src = ac.createBufferSource(); src.buffer = buf;
      const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(1000, t); f.Q.setValueAtTime(5, t);
      const g = ac.createGain(); g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      src.connect(f); f.connect(g); g.connect(ac.destination);
      src.start(t); src.stop(t + 0.3);
    });
  }

  private generateChairThrow() {
    return this.createSound((ac, t) => {
      const size = ac.sampleRate * 0.4;
      const buf = ac.createBuffer(1, size, ac.sampleRate);
      const out = buf.getChannelData(0);
      for (let i = 0; i < size; i++) {
        const progress = i / size;
        out[i] = (Math.random() * 2 - 1) * Math.sin(progress * Math.PI) * 0.4;
      }
      const src = ac.createBufferSource(); src.buffer = buf;
      const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(2000, t); f.frequency.exponentialRampToValueAtTime(500, t + 0.4);
      const g = ac.createGain(); g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
      src.connect(f); f.connect(g); g.connect(ac.destination);
      src.start(t); src.stop(t + 0.4);
    });
  }

  private generateCactusHit() {
    return this.createSound((ac, t) => {
      const osc = ac.createOscillator(); const g = ac.createGain();
      osc.connect(g); g.connect(ac.destination);
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);
      g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc.type = 'sawtooth'; osc.start(t); osc.stop(t + 0.1);
      const spike = ac.createOscillator(); const sg = ac.createGain();
      spike.connect(sg); sg.connect(ac.destination);
      spike.frequency.setValueAtTime(1500, t);
      sg.gain.setValueAtTime(0.2, t); sg.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
      spike.type = 'square'; spike.start(t); spike.stop(t + 0.05);
    });
  }

  private createSound(
    generator: (ac: AudioContext, time: number, volume?: number, pitch?: number) => void
  ): { play: (volume?: number, pitch?: number) => void } {
    return {
      play: (volume = 1.0, pitch = 1.0) => {
        if (!this.audioContext) return;
        try {
          const time = this.audioContext.currentTime;
          generator(this.audioContext, time, volume, pitch);
        } catch (error) {
          console.warn('Error playing generated sound:', error);
        }
      },
    };
  }

  getSound(id: string) {
    return this.sounds.get(id);
  }
}

let soundGeneratorTS: SoundGeneratorTS | null = null;
function initializeSoundGeneratorTS(): SoundGeneratorTS {
  if (!soundGeneratorTS) soundGeneratorTS = new SoundGeneratorTS();
  return soundGeneratorTS;
}

declare global {
  interface Window {
    SoundGenerator: typeof SoundGeneratorTS;
    initializeSoundGenerator: () => SoundGeneratorTS;
    getSoundGenerator: () => SoundGeneratorTS | null;
  }
}

(window as any).SoundGenerator = SoundGeneratorTS;
(window as any).initializeSoundGenerator = initializeSoundGeneratorTS;
(window as any).getSoundGenerator = () => soundGeneratorTS;

export {};


