import { NoteMappingConfig, Hand, Finger, ActiveNoteInfo } from '@/types';

export const DEFAULT_NOTE_MAPPING: NoteMappingConfig = {
  Left: {
    thumb: 'C4',
    index: 'D4',
    middle: 'E4',
    ring: 'F4',
    pinky: 'G4',
  },
  Right: {
    thumb: 'A4',
    index: 'B4',
    middle: 'C5',
    ring: 'D5',
    pinky: 'E5',
  },
};

export const PRESET_MAPPINGS: { name: string; description: string; mapping: NoteMappingConfig }[] = [
  {
    name: 'C Major Diatonic (Default)',
    description: 'Walks straight through C Major scale across both hands (C D E F G | A B C D E)',
    mapping: DEFAULT_NOTE_MAPPING,
  },
  {
    name: 'Avicii — The Nights',
    description: 'Optimized for playing F - C - G - Am chords & melody lines from Avicii',
    mapping: {
      Left: { thumb: 'F3', index: 'C4', middle: 'G3', ring: 'A3', pinky: 'E4' },
      Right: { thumb: 'F4', index: 'G4', middle: 'A4', ring: 'C5', pinky: 'E5' },
    },
  },
  {
    name: 'Pop 4-Chords (I - V - vi - IV)',
    description: 'Quickly trigger C, G, Am, and F chords with individual fingers',
    mapping: {
      Left: { thumb: 'C4', index: 'G4', middle: 'A4', ring: 'F4', pinky: 'E4' },
      Right: { thumb: 'E4', index: 'B4', middle: 'C5', ring: 'A4', pinky: 'G5' },
    },
  },
  {
    name: 'Pentatonic Chill Vibe',
    description: 'Harmonious C Pentatonic scale (C D E G A) - impossible to play a wrong note',
    mapping: {
      Left: { thumb: 'C4', index: 'D4', middle: 'E4', ring: 'G4', pinky: 'A4' },
      Right: { thumb: 'C5', index: 'D5', middle: 'E5', ring: 'G5', pinky: 'A5' },
    },
  },
];

const NOTE_TO_PITCH_CLASS: Record<string, number> = {
  'C': 0, 'C#': 1, 'DB': 1,
  'D': 2, 'D#': 3, 'EB': 3,
  'E': 4,
  'F': 5, 'F#': 6, 'GB': 6,
  'G': 7, 'G#': 8, 'AB': 8,
  'A': 9, 'A#': 10, 'BB': 10,
  'B': 11,
};

export const PITCH_CLASS_TO_NOTE_NAME = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function parseNote(noteStr: string): { noteName: string; pitchClass: number; octave: number } {
  const match = noteStr.trim().match(/^([A-Ga-g][#b]?)(-?\d+)?$/);
  if (!match) {
    return { noteName: noteStr, pitchClass: 0, octave: 4 };
  }
  const rootStr = match[1].toUpperCase();
  const octave = match[2] ? parseInt(match[2], 10) : 4;
  const pitchClass = NOTE_TO_PITCH_CLASS[rootStr] ?? 0;
  return { noteName: `${rootStr}${octave}`, pitchClass, octave };
}

export function transposeNote(noteStr: string, semitones: number): string {
  if (semitones === 0) return noteStr;
  const { pitchClass, octave } = parseNote(noteStr);
  const midiNum = (octave + 1) * 12 + pitchClass + semitones;
  const newOctave = Math.floor(midiNum / 12) - 1;
  const newPitchClass = (midiNum % 12 + 12) % 12;
  const newNoteName = PITCH_CLASS_TO_NOTE_NAME[newPitchClass];
  return `${newNoteName}${newOctave}`;
}

export function getActiveNotesFromGestures(
  leftFingers: Record<Finger, boolean> | null,
  rightFingers: Record<Finger, boolean> | null,
  mappingConfig: NoteMappingConfig
): ActiveNoteInfo[] {
  const activeNotes: ActiveNoteInfo[] = [];

  const fingersList: Finger[] = ['thumb', 'index', 'middle', 'ring', 'pinky'];

  if (leftFingers) {
    for (const finger of fingersList) {
      if (leftFingers[finger]) {
        const noteStr = mappingConfig.Left[finger];
        const { pitchClass, octave } = parseNote(noteStr);
        activeNotes.push({
          note: noteStr,
          hand: 'Left',
          finger,
          pitchClass,
          octave,
        });
      }
    }
  }

  if (rightFingers) {
    for (const finger of fingersList) {
      if (rightFingers[finger]) {
        const noteStr = mappingConfig.Right[finger];
        const { pitchClass, octave } = parseNote(noteStr);
        activeNotes.push({
          note: noteStr,
          hand: 'Right',
          finger,
          pitchClass,
          octave,
        });
      }
    }
  }

  return activeNotes;
}

const STORAGE_KEY = 'chordture_note_mapping_v1';

export function loadSavedMapping(): NoteMappingConfig {
  if (typeof window === 'undefined') return DEFAULT_NOTE_MAPPING;
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (!item) return DEFAULT_NOTE_MAPPING;
    const parsed = JSON.parse(item);
    if (parsed && parsed.Left && parsed.Right) {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to load note mapping from localStorage', e);
  }
  return DEFAULT_NOTE_MAPPING;
}

export function saveMapping(config: NoteMappingConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save note mapping to localStorage', e);
  }
}
