import {
  HandDetectionData,
  ActiveNoteInfo,
  ChordResult,
} from '@/types';
import { parseNote } from '../noteMapping';
import { InputModeHandler, InputModeProcessResult } from './types';

export const DIAL_NOTES = [
  { name: 'C4', label: 'C', symbol: 'C', angle: 0 },
  { name: 'C#4', label: 'C#', symbol: 'C#', angle: 30 },
  { name: 'D4', label: 'D', symbol: 'D', angle: 60 },
  { name: 'D#4', label: 'D#', symbol: 'D#', angle: 90 },
  { name: 'E4', label: 'E', symbol: 'E', angle: 120 },
  { name: 'F4', label: 'F', symbol: 'F', angle: 150 },
  { name: 'F#4', label: 'F#', symbol: 'F#', angle: 180 },
  { name: 'G4', label: 'G', symbol: 'G', angle: 210 },
  { name: 'G#4', label: 'G#', symbol: 'G#', angle: 240 },
  { name: 'A4', label: 'A', symbol: 'A', angle: 270 },
  { name: 'A#4', label: 'A#', symbol: 'A#', angle: 300 },
  { name: 'B4', label: 'B', symbol: 'B', angle: 330 },
];

export function calculateSectorFromPoint(
  x: number,
  y: number,
  cx: number = 0.5,
  cy: number = 0.5
): number {
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // If too close to exact center, ignore
  if (dist < 0.05) return -1;

  const angleRad = Math.atan2(dy, dx);
  const angleDeg = (angleRad * 180) / Math.PI;
  // Convert 3 o'clock (0deg) to 12 o'clock (0deg)
  const clockAngle = (angleDeg + 90 + 360) % 360;
  return Math.floor(((clockAngle + 15) % 360) / 30);
}

export const circularDialHandler: InputModeHandler = {
  id: 'circular-keyboard',
  name: 'Circular Note Dial',
  description: 'Point index finger at 360° circular note dial to select & trigger notes',
  iconName: 'Disc',
  isAvailable: true,
  badge: 'NEW',
  processInput: (hands, _mappingConfig, settings, _stabilizer): InputModeProcessResult => {
    if (!hands || hands.length === 0) {
      return {
        activeNotes: [],
        chordResult: {
          chordName: 'Circular Note Dial (Idle)',
          root: '',
          symbol: '',
          quality: 'Circular Dial Mode',
          notes: [],
          intervals: [],
          type: 'none',
          formattedFormula: 'Point index fingertip at circular dial sectors',
          confidence: 0,
        },
      };
    }

    // Track index fingertip (Landmark 8) on primary detected hand
    const primaryHand = hands[0];
    const indexTip = primaryHand.landmarks[8];

    if (!indexTip) {
      return {
        activeNotes: [],
        chordResult: {
          chordName: 'Circular Note Dial',
          root: '',
          symbol: '',
          quality: 'Point Index Fingertip',
          notes: [],
          intervals: [],
          type: 'none',
          confidence: 0,
        },
      };
    }

    // Account for video mirroring
    const normX = settings.mirrorVideo ? 1 - indexTip.x : indexTip.x;
    const normY = indexTip.y;

    const sectorIndex = calculateSectorFromPoint(normX, normY);

    if (sectorIndex < 0 || sectorIndex >= DIAL_NOTES.length) {
      return {
        activeNotes: [],
        chordResult: {
          chordName: 'Center Neutral Zone',
          root: '',
          symbol: '',
          quality: 'Hover over outer dial sectors',
          notes: [],
          intervals: [],
          type: 'none',
          confidence: 0,
        },
      };
    }

    const selectedNote = DIAL_NOTES[sectorIndex];
    const { pitchClass, octave } = parseNote(selectedNote.name);

    const activeNotes: ActiveNoteInfo[] = [
      {
        note: selectedNote.name,
        hand: primaryHand.hand,
        finger: 'index',
        pitchClass,
        octave,
      },
    ];

    const chordResult: ChordResult = {
      chordName: `${selectedNote.label} Pitch Note`,
      root: selectedNote.symbol,
      symbol: selectedNote.symbol,
      quality: `Sector ${sectorIndex + 1} / 12 • Circular Dial`,
      notes: [selectedNote.name],
      intervals: ['Unison'],
      type: 'single',
      formattedFormula: `Angle: ${selectedNote.angle}°`,
      confidence: 1.0,
    };

    return {
      activeNotes,
      chordResult,
      activeGestureId: selectedNote.name,
    };
  },
};
