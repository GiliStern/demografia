// Procedural sound effect generator for Hebrew Vampire Survivors

class SoundGenerator {
  constructor() {
    this.audioContext = null;
    this.sounds = new Map();
    this.initialize();
  }

  async initialize() {
    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      this.generateAllSounds();
      console.log(
        "Sound generator initialized with",
        this.sounds.size,
        "sounds"
      );
    } catch (error) {
      console.warn("Sound generator failed to initialize:", error);
    }
  }

  generateAllSounds() {
    // Generate all the sound effects the game needs
    this.sounds.set("button_click", this.generateButtonClick());
    this.sounds.set("weapon_fire", this.generateWeaponFire());
    this.sounds.set("enemy_hit", this.generateEnemyHit());
    this.sounds.set("pickup_item", this.generatePickupItem());
    this.sounds.set("level_up", this.generateLevelUp());
    this.sounds.set("player_hurt", this.generatePlayerHurt());
    this.sounds.set("enemy_death", this.generateEnemyDeath());
    this.sounds.set("powerup", this.generatePowerup());

    // Additional Hebrew-themed sounds
    this.sounds.set("shofar_blast", this.generateShofarBlast());
    this.sounds.set("coin_collect", this.generateCoinCollect());
    this.sounds.set("chicken_flap", this.generateChickenFlap());
    this.sounds.set("chair_throw", this.generateChairThrow());
    this.sounds.set("cactus_hit", this.generateCactusHit());
  }

  generateButtonClick() {
    return this.createSound((audioContext, time) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Quick click sound
      oscillator.frequency.setValueAtTime(800, time);
      oscillator.frequency.exponentialRampToValueAtTime(600, time + 0.1);

      gainNode.gain.setValueAtTime(0.3, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

      oscillator.type = "square";
      oscillator.start(time);
      oscillator.stop(time + 0.1);
    });
  }

  generateWeaponFire() {
    return this.createSound((audioContext, time) => {
      // Create noise for weapon fire
      const bufferSize = audioContext.sampleRate * 0.2;
      const noiseBuffer = audioContext.createBuffer(
        1,
        bufferSize,
        audioContext.sampleRate
      );
      const output = noiseBuffer.getChannelData(0);

      // Generate noise
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = audioContext.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = audioContext.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(300, time);

      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0.2, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);

      whiteNoise.start(time);
      whiteNoise.stop(time + 0.2);
    });
  }

  generateEnemyHit() {
    return this.createSound((audioContext, time) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Quick hit sound with pitch drop
      oscillator.frequency.setValueAtTime(400, time);
      oscillator.frequency.exponentialRampToValueAtTime(100, time + 0.15);

      gainNode.gain.setValueAtTime(0.4, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

      oscillator.type = "sawtooth";
      oscillator.start(time);
      oscillator.stop(time + 0.15);
    });
  }

  generatePickupItem() {
    return this.createSound((audioContext, time) => {
      // Ascending arpeggio for pickup
      const notes = [440, 554.37, 659.25, 880]; // A, C#, E, A

      notes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(freq, time + index * 0.05);
        gainNode.gain.setValueAtTime(0.3, time + index * 0.05);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          time + index * 0.05 + 0.2
        );

        oscillator.type = "triangle";
        oscillator.start(time + index * 0.05);
        oscillator.stop(time + index * 0.05 + 0.2);
      });
    });
  }

  generateLevelUp() {
    return this.createSound((audioContext, time) => {
      // Triumphant ascending sound
      const frequencies = [261.63, 329.63, 392.0, 523.25]; // C, E, G, C

      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(freq, time + index * 0.1);
        gainNode.gain.setValueAtTime(0.4, time + index * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          time + index * 0.1 + 0.3
        );

        oscillator.type = "sine";
        oscillator.start(time + index * 0.1);
        oscillator.stop(time + index * 0.1 + 0.3);
      });
    });
  }

  generatePlayerHurt() {
    return this.createSound((audioContext, time) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Descending hurt sound
      oscillator.frequency.setValueAtTime(600, time);
      oscillator.frequency.exponentialRampToValueAtTime(200, time + 0.3);

      gainNode.gain.setValueAtTime(0.5, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

      oscillator.type = "square";
      oscillator.start(time);
      oscillator.stop(time + 0.3);
    });
  }

  generateEnemyDeath() {
    return this.createSound((audioContext, time) => {
      // Explosion-like sound
      const bufferSize = audioContext.sampleRate * 0.5;
      const noiseBuffer = audioContext.createBuffer(
        1,
        bufferSize,
        audioContext.sampleRate
      );
      const output = noiseBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const decay = 1 - i / bufferSize;
        output[i] = (Math.random() * 2 - 1) * decay;
      }

      const whiteNoise = audioContext.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = audioContext.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, time);
      filter.frequency.exponentialRampToValueAtTime(100, time + 0.5);

      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0.3, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);

      whiteNoise.start(time);
      whiteNoise.stop(time + 0.5);
    });
  }

  generatePowerup() {
    return this.createSound((audioContext, time) => {
      // Magical powerup sound
      [0, 0.1, 0.2, 0.3].forEach((delay, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const baseFreq = 440 * Math.pow(2, index * 0.25);
        oscillator.frequency.setValueAtTime(baseFreq, time + delay);
        oscillator.frequency.exponentialRampToValueAtTime(
          baseFreq * 2,
          time + delay + 0.4
        );

        gainNode.gain.setValueAtTime(0.2, time + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + delay + 0.4);

        oscillator.type = "sine";
        oscillator.start(time + delay);
        oscillator.stop(time + delay + 0.4);
      });
    });
  }

  generateShofarBlast() {
    return this.createSound((audioContext, time) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Traditional shofar blast - long, wavering tone
      oscillator.frequency.setValueAtTime(220, time);
      oscillator.frequency.setValueAtTime(230, time + 0.1);
      oscillator.frequency.setValueAtTime(220, time + 0.2);
      oscillator.frequency.setValueAtTime(240, time + 0.3);
      oscillator.frequency.setValueAtTime(220, time + 0.4);

      gainNode.gain.setValueAtTime(0.4, time);
      gainNode.gain.setValueAtTime(0.4, time + 0.4);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.8);

      oscillator.type = "sawtooth";
      oscillator.start(time);
      oscillator.stop(time + 0.8);
    });
  }

  generateCoinCollect() {
    return this.createSound((audioContext, time) => {
      // Israeli shekel collect sound - quick ping
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(1000, time);
      oscillator.frequency.exponentialRampToValueAtTime(1500, time + 0.1);

      gainNode.gain.setValueAtTime(0.3, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

      oscillator.type = "triangle";
      oscillator.start(time);
      oscillator.stop(time + 0.1);
    });
  }

  generateChickenFlap() {
    return this.createSound((audioContext, time) => {
      // Quick flapping sound for chicken weapon
      const bufferSize = audioContext.sampleRate * 0.3;
      const noiseBuffer = audioContext.createBuffer(
        1,
        bufferSize,
        audioContext.sampleRate
      );
      const output = noiseBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const envelope = Math.sin((i / bufferSize) * Math.PI * 3);
        output[i] = (Math.random() * 2 - 1) * envelope * 0.3;
      }

      const whiteNoise = audioContext.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = audioContext.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1000, time);
      filter.Q.setValueAtTime(5, time);

      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0.2, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);

      whiteNoise.start(time);
      whiteNoise.stop(time + 0.3);
    });
  }

  generateChairThrow() {
    return this.createSound((audioContext, time) => {
      // Whoosh sound for throwing chairs
      const bufferSize = audioContext.sampleRate * 0.4;
      const noiseBuffer = audioContext.createBuffer(
        1,
        bufferSize,
        audioContext.sampleRate
      );
      const output = noiseBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const progress = i / bufferSize;
        const envelope = Math.sin(progress * Math.PI);
        output[i] = (Math.random() * 2 - 1) * envelope * 0.4;
      }

      const whiteNoise = audioContext.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = audioContext.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2000, time);
      filter.frequency.exponentialRampToValueAtTime(500, time + 0.4);

      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0.25, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);

      whiteNoise.start(time);
      whiteNoise.stop(time + 0.4);
    });
  }

  generateCactusHit() {
    return this.createSound((audioContext, time) => {
      // Spiky hit sound for cactus fruit
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, time);
      oscillator.frequency.exponentialRampToValueAtTime(300, time + 0.1);

      gainNode.gain.setValueAtTime(0.3, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

      oscillator.type = "sawtooth";
      oscillator.start(time);
      oscillator.stop(time + 0.1);

      // Add a quick high frequency spike for the "spike" effect
      const spike = audioContext.createOscillator();
      const spikeGain = audioContext.createGain();

      spike.connect(spikeGain);
      spikeGain.connect(audioContext.destination);

      spike.frequency.setValueAtTime(1500, time);
      spikeGain.gain.setValueAtTime(0.2, time);
      spikeGain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

      spike.type = "square";
      spike.start(time);
      spike.stop(time + 0.05);
    });
  }

  createSound(generator) {
    return {
      play: (volume = 1.0, pitch = 1.0) => {
        if (!this.audioContext) return;

        try {
          // Create a temporary audio context to generate the sound
          const time = this.audioContext.currentTime;
          generator(this.audioContext, time, volume, pitch);
        } catch (error) {
          console.warn("Error playing generated sound:", error);
        }
      },
    };
  }

  getSound(id) {
    return this.sounds.get(id);
  }

  playSound(id, volume = 1.0, pitch = 1.0) {
    const sound = this.getSound(id);
    if (sound) {
      sound.play(volume, pitch);
    } else {
      console.warn("Sound not found:", id);
    }
  }

  // Export sounds as audio files (for development/testing)
  async exportSound(id, duration = 2.0) {
    if (!this.audioContext) return null;

    try {
      // Create offline context for rendering
      const offlineContext = new OfflineAudioContext(
        1,
        this.audioContext.sampleRate * duration,
        this.audioContext.sampleRate
      );

      // Get the sound generator
      const sound = this.sounds.get(id);
      if (!sound) return null;

      // Generate sound in offline context
      // Note: This would need modification to work with offline context

      const renderedBuffer = await offlineContext.startRendering();
      return this.audioBufferToWav(renderedBuffer);
    } catch (error) {
      console.error("Error exporting sound:", error);
      return null;
    }
  }

  audioBufferToWav(buffer) {
    // Convert AudioBuffer to WAV format
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, length * 2, true);

    // Convert float samples to 16-bit PCM
    const samples = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, sample * 0x7fff, true);
      offset += 2;
    }

    return new Blob([arrayBuffer], { type: "audio/wav" });
  }
}

// Initialize sound generator
let soundGenerator = null;

// Function to initialize sound generator on user interaction
function initializeSoundGenerator() {
  if (!soundGenerator) {
    soundGenerator = new SoundGenerator();
  }
  return soundGenerator;
}

// Export for use in other modules
window.SoundGenerator = SoundGenerator;
window.initializeSoundGenerator = initializeSoundGenerator;
window.getSoundGenerator = () => soundGenerator;
