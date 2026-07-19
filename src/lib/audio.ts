export type SoundName = 'box-move' | 'box-open' | 'reward-reveal';

const soundPaths: Record<SoundName, string> = {
  'box-move': '/sounds/box-move.mp3',
  'box-open': '/sounds/box-open.mp3',
  'reward-reveal': '/sounds/reward-reveal.mp3',
};

class AudioManager {
  private cache: Map<SoundName, HTMLAudioElement> = new Map();
  private initialized = false;
  private disabled = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.checkAccessibility();
    }
  }

  private checkAccessibility() {
    try {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const connection = (navigator as any).connection;
      const saveData = connection && connection.saveData === true;
      if (prefersReducedMotion || saveData) {
        this.disabled = true;
      }
    } catch (err) {
      // Ignore errors in checking
    }
  }

  // Must be called inside a user interaction (e.g. onClick)
  public init() {
    if (this.initialized || this.disabled || typeof window === 'undefined') return;
    
    // Create audio objects and preload
    Object.entries(soundPaths).forEach(([key, path]) => {
      try {
        const audio = new Audio(path);
        audio.preload = 'auto';
        // Simply loading the audio within a user gesture unlocks it for future playback
        audio.load();
        this.cache.set(key as SoundName, audio);
      } catch (err) {
        console.warn(`Failed to initialize audio ${key}:`, err);
      }
    });

    this.initialized = true;
  }

  public play(name: SoundName, volume: number = 1.0) {
    if (this.disabled || typeof window === 'undefined') return;

    try {
      const audio = this.cache.get(name);
      if (audio) {
        audio.currentTime = 0; // Rewind
        audio.volume = volume;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Ignore errors (e.g., autoplay blocked or file not found)
          });
        }
      }
    } catch (err) {
      console.warn(`Failed to play audio ${name}:`, err);
    }
  }

  public stop(name: SoundName) {
    if (this.disabled || typeof window === 'undefined') return;

    try {
      const audio = this.cache.get(name);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    } catch (err) {
      console.warn(`Failed to stop audio ${name}:`, err);
    }
  }

  public stopAll() {
    if (this.disabled || typeof window === 'undefined') return;

    try {
      this.cache.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    } catch (err) {
      console.warn('Failed to stop all audio:', err);
    }
  }
}

export const audioManager = new AudioManager();
