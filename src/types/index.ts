export type Hand = 'Left' | 'Right';

export type Finger = 'thumb' | 'index' | 'middle' | 'ring' | 'pinky';

export type InputModeId =
  | 'finger-mapping'
  | 'gesture-mode'
  | 'circular-keyboard'
  | 'virtual-piano'
  | 'scale-mode'
  | 'custom-mapping';

export type NoteName = 
  | 'C3' | 'C#3' | 'D3' | 'D#3' | 'E3' | 'F3' | 'F#3' | 'G3' | 'G#3' | 'A3' | 'A#3' | 'B3'
  | 'C4' | 'C#4' | 'D4' | 'D#4' | 'E4' | 'F4' | 'F#4' | 'G4' | 'G#4' | 'A4' | 'A#4' | 'B4'
  | 'C5' | 'C#5' | 'D5' | 'E5' | 'F5' | 'G5' | 'A5' | 'B5' | string;

export interface FingerState {
  thumb: boolean;
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface HandDetectionData {
  hand: Hand;
  landmarks: Landmark[];
  fingers: FingerState;
  score: number;
}

export type NoteMappingConfig = Record<Hand, Record<Finger, string>>;

export interface ActiveNoteInfo {
  note: string;
  hand: Hand;
  finger: Finger;
  pitchClass: number;
  octave: number;
}

export interface DirectGestureChord {
  id: string;
  name: string;
  icon: string;
  description: string;
  fingerMatch: FingerState;
  chordName: string;
  root: string;
  symbol: string;
  quality: string;
  notes: string[];
  formula: string;
}

export interface ChordTemplate {
  name: string;
  symbol: string;
  quality: string;
  intervals: number[];
  formula: string;
}

export interface ChordResult {
  chordName: string;
  root: string;
  symbol: string;
  quality: string;
  notes: string[];
  intervals: string[];
  type: 'chord' | 'interval' | 'single' | 'none';
  formattedFormula?: string;
  confidence: number;
}

export interface AppSettings {
  inputMode: InputModeId;
  instrumentId: string;
  capoFret: number;
  cameraDeviceId: string;
  mirrorVideo: boolean;
  swapHandedness: boolean;
  hysteresisMs: number;
  showSkeleton: boolean;
  showLandmarkDots: boolean;
  soundEnabled: boolean;
  synthVolume: number;
  synthWaveform: OscillatorType;
}
