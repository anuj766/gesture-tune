/**
 * Multi-Instrument Audio Engine for Chordture
 * Supports:
 * - 🎹 Acoustic Grand Piano
 * - 🪕 Indian Classical Sitar
 *
 * Features:
 * - Real sample playback (decoded AudioBuffer nodes for Piano & Sitar soundfonts)
 * - Nearest-neighbor pitch interpolation for low latency & memory efficiency
 * - Polyphonic voice allocation with Master Dynamics Compressor (limiter)
 * - 5ms linear attack & 350ms exponential release envelope (zero clicks/pops)
 * - Modular sample management for future instrument expansion
 */

import { INSTRUMENTS, getInstrument } from './instruments/registry';

export type PlayMode = 'piano' | 'synth' | 'arpeggiator';

interface VoiceRecord {
  gainNode: GainNode;
  sourceNode?: AudioBufferSourceNode;
  synthNodes?: (AudioNode | AudioScheduledSourceNode)[];
  startTime: number;
}

const NOTE_TO_MIDI: Record<string, number> = {
  'C': 0, 'C#': 1, 'DB': 1,
  'D': 2, 'D#': 3, 'EB': 3,
  'E': 4,
  'F': 5, 'F#': 6, 'GB': 6,
  'G': 7, 'G#': 8, 'AB': 8,
  'A': 9, 'A#': 10, 'BB': 10,
  'B': 11,
};

function noteToMidiNumber(noteStr: string): number {
  const match = noteStr.trim().match(/^([A-Ga-g][#b]?)(-?\d+)?$/);
  if (!match) return 60; // Default C4
  const noteName = match[1].toUpperCase();
  const octave = match[2] ? parseInt(match[2], 10) : 4;
  const semitone = NOTE_TO_MIDI[noteName] ?? 0;
  return (octave + 1) * 12 + semitone;
}

// Key sample anchor notes covering octaves E2 to C6
const ANCHOR_SAMPLES = [
  'E2', 'G2', 'A2', 'C3', 'Db3', 'Eb3', 'E3', 'Gb3', 'G3', 'Ab3', 'A3', 'Bb3',
  'C4', 'Db4', 'Eb4', 'E4', 'Gb4', 'G4', 'Ab4', 'A4', 'Bb4',
  'C5', 'Db5', 'Eb5', 'E5', 'Gb5', 'G5', 'Ab5', 'A5', 'Bb5', 'C6'
];

const SOUNDFONT_BASE_URL = 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/';

function noteToSoundfontFilename(noteStr: string): string {
  return noteStr
    .replace('C#', 'Db')
    .replace('D#', 'Eb')
    .replace('F#', 'Gb')
    .replace('G#', 'Ab')
    .replace('A#', 'Bb');
}

class MultiInstrumentAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private activeVoices: Map<string, VoiceRecord> = new Map();

  // Multi-instrument sample buffer caches: Map<instrumentId, Map<midiNum, AudioBuffer>>
  private sampleBuffersMap: Map<string, Map<number, AudioBuffer>> = new Map();
  private loadingInstruments: Set<string> = new Set();
  private currentInstrumentId: string = 'piano';

  private volume: number = 0.7;
  private enabled: boolean = true;
  private playMode: PlayMode = 'piano';

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Dynamics Compressor to normalize polyphonic chord volume & eliminate clipping
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(10, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.unlockAudio();
      this.loadInstrumentSamples(this.currentInstrumentId);
    } catch (e) {
      console.warn('Web Audio API initialization error:', e);
    }
  }

  public unlockAudio() {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      const unlock = () => {
        this.ctx?.resume().then(() => {
          window.removeEventListener('pointerdown', unlock);
          window.removeEventListener('keydown', unlock);
          window.removeEventListener('touchstart', unlock);
        });
      };
      if (typeof window !== 'undefined') {
        window.addEventListener('pointerdown', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });
        window.addEventListener('touchstart', unlock, { once: true });
      }
    }
  }

  public setInstrument(instrumentId: string) {
    if (this.currentInstrumentId === instrumentId) return;
    this.stopAll();
    this.currentInstrumentId = instrumentId;
    if (this.ctx) {
      this.loadInstrumentSamples(instrumentId);
    }
  }

  public getInstrument(): string {
    return this.currentInstrumentId;
  }

  private async loadInstrumentSamples(instrumentId: string) {
    if (this.loadingInstruments.has(instrumentId) || !this.ctx) return;
    if (this.sampleBuffersMap.has(instrumentId)) return;

    this.loadingInstruments.add(instrumentId);
    const instrumentDef = getInstrument(instrumentId);
    const sampleMap = new Map<number, AudioBuffer>();

    try {
      const loadPromises = ANCHOR_SAMPLES.map(async (noteStr) => {
        try {
          const filename = noteToSoundfontFilename(noteStr);
          const url = `${SOUNDFONT_BASE_URL}${instrumentDef.soundfontName}/${filename}.mp3`;
          const resp = await fetch(url);
          if (!resp.ok) return;
          const arrayBuffer = await resp.arrayBuffer();
          if (!this.ctx) return;
          const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
          const midiNum = noteToMidiNumber(noteStr);
          sampleMap.set(midiNum, audioBuffer);
        } catch (e) {
          // Ignore individual note fetch failure
        }
      });

      await Promise.all(loadPromises);

      if (sampleMap.size > 0) {
        this.sampleBuffersMap.set(instrumentId, sampleMap);
      }
    } catch (e) {
      console.warn(`Sample loading error for instrument ${instrumentId}:`, e);
    } finally {
      this.loadingInstruments.delete(instrumentId);
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (enabled && !this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended' && enabled) {
      this.ctx.resume();
    }
    if (!enabled) {
      this.stopAll();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.05);
    }
  }

  public setPlayMode(mode: PlayMode) {
    this.playMode = mode;
    this.stopAll();
  }

  /**
   * Main Polyphonic State Manager:
   * Triggers new notes (0 -> 1), sustains active notes (1 -> 1), and releases dropped notes (1 -> 0).
   */
  public updateActiveNotes(activeNoteNames: string[]) {
    if (!this.enabled) return;

    if (!this.ctx) {
      this.init();
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const currentNotesSet = new Set(activeNoteNames);

    // 1. Release notes no longer active
    for (const [noteStr] of Array.from(this.activeVoices.entries())) {
      if (!currentNotesSet.has(noteStr)) {
        this.noteOff(noteStr);
      }
    }

    // 2. Trigger newly active notes
    for (const noteStr of activeNoteNames) {
      if (!this.activeVoices.has(noteStr)) {
        this.noteOn(noteStr);
      }
    }
  }

  private noteOn(noteStr: string) {
    if (!this.ctx || !this.compressor) return;

    const targetMidi = noteToMidiNumber(noteStr);
    const now = this.ctx.currentTime;

    // Per-Voice Gain Node
    const voiceGain = this.ctx.createGain();
    const peakGain = 0.75;
    const sustainGain = 0.55;

    // Anti-Click Envelope (5ms linear attack)
    voiceGain.gain.setValueAtTime(0.0001, now);
    voiceGain.gain.linearRampToValueAtTime(peakGain, now + 0.005);
    voiceGain.gain.linearRampToValueAtTime(sustainGain, now + 0.12);

    voiceGain.connect(this.compressor);

    // Get sample map for active instrument
    const activeSampleMap = this.sampleBuffersMap.get(this.currentInstrumentId);

    if (activeSampleMap && activeSampleMap.size > 0) {
      // Find closest anchor sample
      let closestMidi = -1;
      let minDiff = Infinity;

      for (const [midiNum] of Array.from(activeSampleMap.entries())) {
        const diff = Math.abs(midiNum - targetMidi);
        if (diff < minDiff) {
          minDiff = diff;
          closestMidi = midiNum;
        }
      }

      const sampleBuffer = activeSampleMap.get(closestMidi);

      if (sampleBuffer) {
        const source = this.ctx.createBufferSource();
        source.buffer = sampleBuffer;

        // Calculate pitch shift ratio
        const pitchShiftSemitones = targetMidi - closestMidi;
        source.playbackRate.setValueAtTime(Math.pow(2, pitchShiftSemitones / 12), now);

        source.connect(voiceGain);
        source.start(now);

        this.activeVoices.set(noteStr, {
          gainNode: voiceGain,
          sourceNode: source,
          startTime: now,
        });

        return;
      }
    }

    // Fallback: Multi-harmonic acoustic physical modeling
    this.noteOnPhysicalModeling(noteStr, targetMidi, voiceGain, now);
  }

  private noteOnPhysicalModeling(noteStr: string, targetMidi: number, voiceGain: GainNode, now: number) {
    if (!this.ctx) return;

    const freq = 440 * Math.pow(2, (targetMidi - 69) / 12);
    const synthNodes: (AudioNode | AudioScheduledSourceNode)[] = [];

    // Multi-Harmonic Overtones
    const harmonics = [
      { ratio: 1.0, gain: 1.0, type: 'triangle' as OscillatorType },
      { ratio: 2.0, gain: 0.4, type: 'sine' as OscillatorType },
      { ratio: 3.0, gain: 0.18, type: 'sine' as OscillatorType },
      { ratio: 4.0, gain: 0.08, type: 'sine' as OscillatorType },
    ];

    harmonics.forEach((h) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const hGain = this.ctx.createGain();

      osc.type = h.type;
      osc.frequency.setValueAtTime(freq * h.ratio, now);
      hGain.gain.setValueAtTime(h.gain, now);

      osc.connect(hGain);
      hGain.connect(voiceGain);

      osc.start(now);
      synthNodes.push(osc, hGain);
    });

    this.activeVoices.set(noteStr, {
      gainNode: voiceGain,
      synthNodes,
      startTime: now,
    });
  }

  private noteOff(noteStr: string) {
    const voice = this.activeVoices.get(noteStr);
    if (!voice || !this.ctx) return;

    const now = this.ctx.currentTime;
    const releaseTime = 0.35; // 350ms smooth acoustic damper release

    try {
      voice.gainNode.gain.cancelScheduledValues(now);
      voice.gainNode.gain.setValueAtTime(voice.gainNode.gain.value, now);
      voice.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime);
    } catch {}

    if (voice.sourceNode) {
      try {
        voice.sourceNode.stop(now + releaseTime + 0.02);
      } catch {}
    }

    if (voice.synthNodes) {
      voice.synthNodes.forEach((node) => {
        if ('stop' in node && typeof node.stop === 'function') {
          try {
            node.stop(now + releaseTime + 0.02);
          } catch {}
        }
      });
    }

    setTimeout(() => {
      try {
        voice.gainNode.disconnect();
        if (voice.sourceNode) voice.sourceNode.disconnect();
        if (voice.synthNodes) {
          voice.synthNodes.forEach((n) => n.disconnect());
        }
      } catch {}
    }, (releaseTime + 0.05) * 1000);

    this.activeVoices.delete(noteStr);
  }

  public stopAll() {
    for (const [noteStr] of Array.from(this.activeVoices.entries())) {
      this.noteOff(noteStr);
    }
    this.activeVoices.clear();
  }

  public getIsSamplesLoaded(instrumentId?: string): boolean {
    const id = instrumentId || this.currentInstrumentId;
    return (this.sampleBuffersMap.get(id)?.size ?? 0) > 0;
  }
}

export const audioSynth = new MultiInstrumentAudioEngine();
