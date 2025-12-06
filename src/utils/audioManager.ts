interface AudioHandle {
  id: string;
  audio: HTMLAudioElement;
}

const sfxCache = new Map<string, AudioHandle>();
let musicHandle: AudioHandle | null = null;

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

export function playMusic(path: string, volume = 0.5, loop = true) {
  if (musicHandle?.id === path) return;
  stopMusic();
  const audio = new Audio(path);
  audio.loop = loop;
  audio.volume = volume;
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
