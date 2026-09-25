import {
  HandDetectionData,
  ActiveNoteInfo,
  ChordResult,
  FingerState,
} from '@/types';
import { parseNote, transposeNote } from '../noteMapping';
import { InputModeHandler, InputModeProcessResult, GestureDefinition } from './types';
import { TemporalGestureStabilizer } from '../gestureStabilizer';

export const GESTURE_DEFINITIONS: GestureDefinition[] = [
  {
    id: 'c-major',
    name: 'Closed Fist',
    icon: '✊',
    description: 'All fingers folded',
    chordName: 'C Major',
    symbol: 'C',
    quality: 'Open Guitar Chord',
    notes: ['C3', 'G3', 'C4', 'E4', 'G4'],
    formula: '1 - 3 - 5 (C Major)',
    pattern: { thumb: false, index: false, middle: false, ring: false, pinky: false },
  },
  {
    id: 'g-major',
    name: 'Index Finger',
    icon: '☝️',
    description: 'Index extended only',
    chordName: 'G Major',
    symbol: 'G',
    quality: 'Open Guitar Chord',
    notes: ['G2', 'B2', 'D3', 'G3', 'B3', 'G4'],
    formula: '1 - 3 - 5 (G Major)',
    pattern: { thumb: false, index: true, middle: false, ring: false, pinky: false },
  },
  {
    id: 'd-major',
    name: 'Peace Sign',
    icon: '✌️',
    description: 'Index + Middle extended',
    chordName: 'D Major',
    symbol: 'D',
    quality: 'Open Guitar Chord',
    notes: ['D3', 'A3', 'D4', 'F#4', 'A4'],
    formula: '1 - 3 - 5 (D Major)',
    pattern: { thumb: false, index: true, middle: true, ring: false, pinky: false },
  },
  {
    id: 'a-major',
    name: 'Three Fingers',
    icon: '🖐️3',
    description: 'Index + Middle + Ring',
    chordName: 'A Major',
    symbol: 'A',
    quality: 'Open Guitar Chord',
    notes: ['A2', 'E3', 'A3', 'C#4', 'E4'],
    formula: '1 - 3 - 5 (A Major)',
    pattern: { thumb: false, index: true, middle: true, ring: true, pinky: false },
  },
  {
    id: 'e-major',
    name: 'Four Fingers',
    icon: '🖐️4',
    description: 'Index + Middle + Ring + Pinky',
    chordName: 'E Major',
    symbol: 'E',
    quality: 'Open Guitar Chord',
    notes: ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'],
    formula: '1 - 3 - 5 (E Major)',
    pattern: { thumb: false, index: true, middle: true, ring: true, pinky: true },
  },
  {
    id: 'a-minor',
    name: 'Thumbs Up',
    icon: '👍',
    description: 'Thumb extended only',
    chordName: 'A Minor',
    symbol: 'Am',
    quality: 'Open Guitar Chord',
    notes: ['A2', 'E3', 'A3', 'C4', 'E4'],
    formula: '1 - ♭3 - 5 (A Minor)',
    pattern: { thumb: true, index: false, middle: false, ring: false, pinky: false },
  },
  {
    id: 'e-minor',
    name: 'Thumb + Index',
    icon: '👍☝️',
    description: 'Thumb + Index extended',
    chordName: 'E Minor',
    symbol: 'Em',
    quality: 'Open Guitar Chord',
    notes: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
    formula: '1 - ♭3 - 5 (E Minor)',
    pattern: { thumb: true, index: true, middle: false, ring: false, pinky: false },
  },
  {
    id: 'd-minor',
    name: 'Call Me',
    icon: '🤙',
    description: 'Thumb + Pinky extended',
    chordName: 'D Minor',
    symbol: 'Dm',
    quality: 'Open Guitar Chord',
    notes: ['D3', 'A3', 'D4', 'F4', 'A4'],
    formula: '1 - ♭3 - 5 (D Minor)',
    pattern: { thumb: true, index: false, middle: false, ring: false, pinky: true },
  },
  {
    id: 'f-major',
    name: 'Five Fingers Up',
    icon: '🖐️',
    description: 'All 5 fingers extended',
    chordName: 'F Major',
    symbol: 'F',
    quality: 'Open Guitar Chord',
    notes: ['F3', 'C4', 'F4', 'A4', 'C5'],
    formula: '1 - 3 - 5 (F Major)',
    pattern: { thumb: true, index: true, middle: true, ring: true, pinky: true },
  },
];

function isPatternMatch(fingers: FingerState, pattern: FingerState): boolean {
  return (
    fingers.thumb === pattern.thumb &&
    fingers.index === pattern.index &&
    fingers.middle === pattern.middle &&
    fingers.ring === pattern.ring &&
    fingers.pinky === pattern.pinky
  );
}

export function detectGestureFromHand(fingers: FingerState): GestureDefinition | null {
  for (const def of GESTURE_DEFINITIONS) {
    if (isPatternMatch(fingers, def.pattern)) {
      return def;
    }
  }
  return null;
}

export function getTransposedChordInfo(shapeSymbol: string, capoFret: number): { symbol: string; chordName: string } {
  if (!capoFret || capoFret <= 0) {
    const isMinor = shapeSymbol.endsWith('m');
    return {
      symbol: shapeSymbol,
      chordName: isMinor ? `${shapeSymbol.slice(0, -1)} Minor` : `${shapeSymbol} Major`,
    };
  }

  const isMinor = shapeSymbol.endsWith('m');
  const baseRoot = isMinor ? shapeSymbol.slice(0, -1) : shapeSymbol;
  const transposedRootNote = transposeNote(`${baseRoot}4`, capoFret).replace(/-?\d+$/, '');
  const newSymbol = isMinor ? `${transposedRootNote}m` : transposedRootNote;
  const newChordName = isMinor ? `${transposedRootNote} Minor` : `${transposedRootNote} Major`;

  return { symbol: newSymbol, chordName: newChordName };
}

const gestureStabilizer = new TemporalGestureStabilizer<GestureDefinition>(3);

export const gestureModeHandler: InputModeHandler = {
  id: 'gesture-mode',
  name: 'Gesture Mode',
  description: 'Triggers the 9 open guitar chords (C, G, D, A, E, Am, Em, Dm, F)',
  iconName: 'Hand',
  isAvailable: true,
  badge: '9 CHORDS',
  processInput: (hands, _mappingConfig, settings, _stabilizer): InputModeProcessResult => {
    const capo = settings.capoFret || 0;

    if (!hands || hands.length === 0) {
      gestureStabilizer.reset();
      return {
        activeNotes: [],
        chordResult: {
          chordName: 'No Hand Detected',
          root: '',
          symbol: '',
          quality: 'Idle',
          notes: [],
          intervals: [],
          type: 'none',
          confidence: 0,
        },
      };
    }

    // Find candidate hand matching a known open guitar gesture
    let rawCandidate: GestureDefinition | null = null;
    let matchedHand: HandDetectionData | null = null;

    for (const handData of hands) {
      const gesture = detectGestureFromHand(handData.fingers);
      if (gesture) {
        rawCandidate = gesture;
        matchedHand = handData;
        break;
      }
    }

    // Temporal multi-frame confirmation
    const matchedGesture = gestureStabilizer.update(rawCandidate);

    if (!matchedGesture) {
      return {
        activeNotes: [],
        chordResult: {
          chordName: 'Unrecognized Gesture',
          root: '',
          symbol: '',
          quality: 'Unknown Gesture',
          notes: [],
          intervals: [],
          type: 'none',
          formattedFormula: 'Form one of the 9 open guitar chord gestures',
          confidence: 0,
        },
      };
    }

    const handSide = matchedHand ? matchedHand.hand : 'Left';

    // Transpose each note by Capo Fret
    const transposedNotes = matchedGesture.notes.map((noteStr) => transposeNote(noteStr, capo));

    const activeNotes: ActiveNoteInfo[] = transposedNotes.map((noteStr, idx) => {
      const { pitchClass, octave } = parseNote(noteStr);
      return {
        note: noteStr,
        hand: handSide,
        finger: (['thumb', 'index', 'middle', 'ring', 'pinky'][idx % 5]) as any,
        pitchClass,
        octave,
      };
    });

    const { symbol: outputSymbol, chordName: outputChordName } = getTransposedChordInfo(
      matchedGesture.symbol,
      capo
    );

    const qualityLabel = capo > 0
      ? `Shape: ${matchedGesture.symbol} • Capo: ${capo}`
      : `Shape: ${matchedGesture.symbol} (No Capo)`;

    const origStringVoicing = matchedGesture.notes.join(' • ');
    const capoStringVoicing = transposedNotes.join(' • ');

    const formulaLabel = capo > 0
      ? `Guitar String Shift: [${origStringVoicing}] + Capo ${capo} ➔ [${capoStringVoicing}]`
      : `Guitar String Voicing: [${origStringVoicing}]`;

    const chordResult: ChordResult = {
      chordName: `${outputChordName} (${matchedGesture.icon} Shape ${matchedGesture.symbol}${capo > 0 ? ` + Capo ${capo}` : ''})`,
      root: outputSymbol,
      symbol: outputSymbol,
      quality: qualityLabel,
      notes: transposedNotes,
      intervals: transposedNotes,
      type: 'chord',
      formattedFormula: formulaLabel,
      confidence: 1.0,
    };

    return {
      activeNotes,
      chordResult,
      activeGestureId: matchedGesture.id,
    };
  },
};
