// Web Audio API custom organic synthesizer for interactive sound effects.
// No external downloads required, 100% reliable offline operation.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private calmDroneNodes: {
    oscillators: OscillatorNode[];
    gainNodes: GainNode[];
    filter: BiquadFilterNode;
    lfo: OscillatorNode;
    masterGain: GainNode;
  } | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Play an elegant crystal-shattering, mind-clearing sound effect (粉碎/澄清音效)
   * Formulated as a cluster of quick exponential-decay pure tones + sweep-highpassed noise
   */
  public playShatter() {
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Splintering noise crackle (synthesized white noise burst with sweep bandpass/highpass filter)
    try {
      const bufferSize = ctx.sampleRate * 0.15; // Short 150ms burst
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const hpFilter = ctx.createBiquadFilter();
      hpFilter.type = "highpass";
      hpFilter.frequency.setValueAtTime(5000, now);
      hpFilter.frequency.exponentialRampToValueAtTime(1500, now + 0.12);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.06, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      noiseNode.connect(hpFilter);
      hpFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseNode.start(now);
    } catch (e) {
      console.warn("Noise audio breakdown skipped safely:", e);
    }

    // 2. Sparkling crystalline sine frequencies for high-pitch pristine shatter feeling
    const baseFreqs = [1500, 2040, 2480, 2960, 3600];
    
    baseFreqs.forEach((freq, idx) => {
      try {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        // Slightly delay each tone for a scattering ripple effect
        const t = now + (idx * 0.01);

        osc.type = idx % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, t);
        // Minor pitch descent to represent dissolution/shattering
        osc.frequency.exponentialRampToValueAtTime(freq * 0.7, t + 0.3);

        gainNode.gain.setValueAtTime(0, t);
        // Quick ramp up
        gainNode.gain.linearRampToValueAtTime(0.12, t + 0.005);
        // Clean exponential release
        gainNode.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.45);
      } catch (err) {
        console.warn("Oscillator play safety catch:", err);
      }
    });
  }

  /**
   * Starts a deep, serene sub-bass & lowpass-swept dream chord (闭眼音效设计)
   * Mimics entering a dark, silent inner space when eyes close
   */
  public startCalmDrone() {
    const ctx = this.initCtx();
    if (!ctx) return;

    if (this.calmDroneNodes) return; // Already humming

    const now = ctx.currentTime;

    // Harmonic frequencies: D2, A2, D3, A3 (Warm, stable chord)
    const baseFreqs = [73.42, 110.00, 146.83, 220.00];

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(100, now);
    // Sweeps open very slowly for gentle depth
    filter.frequency.exponentialRampToValueAtTime(280, now + 4);

    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, now); // Sweet slow breathing frequency (8.3s cycle)
    
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(70, now);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start(now);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    // Swoop-in attack swell over 2.5 seconds to build immersion
    masterGain.gain.linearRampToValueAtTime(0.35, now + 2.5);

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    const oscillators: OscillatorNode[] = [];
    const gainNodes: GainNode[] = [];

    baseFreqs.forEach((freq, index) => {
      try {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        // Detune values to form beautiful organic chorus
        osc.detune.setValueAtTime(index % 2 === 0 ? 5 : -5, now);

        // Slow breathing motion to detune parameters
        osc.detune.linearRampToValueAtTime(index % 2 === 0 ? -3 : 3, now + 10);

        const relativeVol = index === 0 ? 0.4 : (index === 1 ? 0.35 : 0.25);
        oscGain.gain.setValueAtTime(relativeVol, now);

        osc.connect(oscGain);
        oscGain.connect(filter);

        osc.start(now);
        oscillators.push(osc);
        gainNodes.push(oscGain);
      } catch (err) {
        console.warn("Calm oscillator setup bypass:", err);
      }
    });

    this.calmDroneNodes = {
      oscillators,
      gainNodes,
      filter,
      lfo,
      masterGain
    };
  }

  /**
   * Slowly and smoothly fades out the serene backdrop when closing ends
   */
  public stopCalmDrone() {
    if (!this.calmDroneNodes || !this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const { oscillators, lfo, masterGain } = this.calmDroneNodes;

    try {
      if (masterGain) {
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        // Smooth 0.8-second decay
        masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      }
    } catch (e) {
      console.warn("Drone fadeout failed safely:", e);
    }

    const savedOscs = oscillators;
    const savedLfo = lfo;

    setTimeout(() => {
      try {
        savedOscs.forEach(o => o.stop());
        savedLfo.stop();
      } catch (err) {
        // Safe fail
      }
    }, 1000);

    this.calmDroneNodes = null;
  }
}

export const audioService = new SoundEngine();
