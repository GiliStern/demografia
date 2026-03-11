interface AudioHandle {
  id: string;
  audio: HTMLAudioElement;
}

const sfxCache = new Map<string, AudioHandle>();
let musicHandle: AudioHandle | null = null;
const DEFAULT_MUSIC_VOLUME = 0.1;

/** Applies mute state to currently playing music. Called by settings store. */
export function applyMusicMuted(muted: boolean): void {
  if (musicHandle) {
    musicHandle.audio.volume = muted ? 0 : DEFAULT_MUSIC_VOLUME;
  }
}

export function playSfx(path: string, volume = 1) {
  const cached = sfxCache.get(path);
  const audio = cached?.audio ?? new Audio(path);
  audio.volume = volume;
  audio.currentTime = 0;
  audio.play().catch(() => {
    // Ignore autoplay blocks in dev
    console.error(`Failed to play SFX: ${path}`);
  });
  if (!cached) {
    sfxCache.set(path, { id: path, audio });
  }
}

export function playMusic(path: string, loop = true, muted = false) {
  if (musicHandle?.id === path) return;
  stopMusic();
  const audio = new Audio(path);
  audio.loop = loop;
  audio.volume = muted ? 0 : DEFAULT_MUSIC_VOLUME;
  audio.play().catch(() => {
    console.error(`Failed to play music: ${path}`);
  });
  musicHandle = { id: path, audio };
}

export function stopMusic() {
  if (musicHandle) {
    musicHandle.audio.pause();
    musicHandle = null;
  }
}
