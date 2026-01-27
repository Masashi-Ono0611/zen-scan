// Zen Scan - Sound Utilities

/**
 * Creates a singing bowl (おりん) sound using Web Audio API.
 * The sound has multiple harmonics that decay over time, creating a rich, meditative tone.
 */
export class SingingBowlSound {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;

  constructor() {
    // Initialize on first use to avoid autoplay restrictions
  }

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    }
  }

  /**
   * Play a singing bowl sound with harmonics.
   * @param frequency Base frequency in Hz (default: 264 Hz - lower, deeper tone)
   * @param duration Duration in seconds (default: 5 - longer resonance)
   * @param volume Volume level 0-1 (default: 0.3)
   */
  play(frequency: number = 264, duration: number = 5, volume: number = 0.3) {
    if (this.audioContext && this.audioContext.state === 'closed') {
      return;
    }
    
    this.initAudioContext();
    
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;

    // Create multiple oscillators for harmonics (overtones)
    // More harmonics for richer, deeper sound
    const harmonics = [
      { freq: frequency, gain: 1.0 },           // Fundamental
      { freq: frequency * 2.0, gain: 0.6 },     // 2nd harmonic (stronger)
      { freq: frequency * 3.0, gain: 0.4 },     // 3rd harmonic (stronger)
      { freq: frequency * 4.0, gain: 0.25 },    // 4th harmonic
      { freq: frequency * 5.5, gain: 0.2 },     // Inharmonic (bell-like)
      { freq: frequency * 7.2, gain: 0.15 },    // Inharmonic
      { freq: frequency * 0.5, gain: 0.3 },     // Sub-harmonic for depth
    ];

    harmonics.forEach(({ freq, gain }) => {
      const oscillator = this.audioContext!.createOscillator();
      const harmonicGain = this.audioContext!.createGain();

      // Use sine wave for pure tone
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;

      // Set initial gain
      harmonicGain.gain.value = volume * gain;

      // Exponential decay envelope (like a real bell)
      harmonicGain.gain.setValueAtTime(volume * gain, now);
      harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      // Connect: oscillator -> harmonicGain -> masterGain -> destination
      oscillator.connect(harmonicGain);
      harmonicGain.connect(this.gainNode!);

      // Start and stop
      oscillator.start(now);
      oscillator.stop(now + duration);
    });
  }

  /**
   * Play a gentle ambient loop for meditation background.
   * Creates a subtle, continuous tone that doesn't distract.
   * @returns Stop function to end the ambient sound
   */
  playAmbientLoop(baseFrequency: number = 432, volume: number = 0.15): () => void {
    this.initAudioContext();
    
    if (!this.audioContext || !this.gainNode) {
      return () => {};
    }

    const now = this.audioContext.currentTime;

    const osc1 = this.audioContext.createOscillator();
    const osc2 = this.audioContext.createOscillator();
    const ambientGain = this.audioContext.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.value = baseFrequency;
    osc2.frequency.value = baseFrequency * 1.5;

    ambientGain.gain.value = volume;
    ambientGain.gain.setValueAtTime(0, now);
    ambientGain.gain.linearRampToValueAtTime(volume, now + 2);

    osc1.connect(ambientGain);
    osc2.connect(ambientGain);
    ambientGain.connect(this.gainNode!);

    osc1.start(now);
    osc2.start(now);

    return () => {
      try {
        if (this.audioContext && this.audioContext.state !== 'closed') {
          const stopTime = this.audioContext.currentTime;
          ambientGain.gain.linearRampToValueAtTime(0, stopTime + 0.5);
          osc1.stop(stopTime + 0.5);
          osc2.stop(stopTime + 0.5);
        }
      } catch (e) {
        // Ignore errors
      }
    };
  }

  /**
   * Play a sequence of singing bowl sounds at intervals.
   * @param interval Interval between sounds in seconds
   * @param count Number of times to play (0 = infinite)
   */
  playSequence(interval: number = 10, count: number = 0): () => void {
    let currentCount = 0;
    let timeoutId: number | null = null;
    let stopped = false;

    const playNext = () => {
      if (stopped) {
        return;
      }
      
      if (!this.audioContext || this.audioContext.state === 'closed') {
        stopped = true;
        return;
      }
      
      this.play();
      currentCount++;

      if (!stopped && (count === 0 || currentCount < count)) {
        timeoutId = window.setTimeout(playNext, interval * 1000);
      }
    };

    playNext();

    return () => {
      stopped = true;
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
  }

  /**
   * Stop all sounds and clean up.
   */
  stop() {
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
      this.gainNode = null;
    }
  }
}

/**
 * Global singing bowl instance for easy access.
 */
export const singingBowl = new SingingBowlSound();
