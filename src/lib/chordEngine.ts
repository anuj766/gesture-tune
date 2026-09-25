import { ActiveNoteInfo, ChordResult, ChordTemplate } from '@/types';
import { PITCH_CLASS_TO_NOTE_NAME } from './noteMapping';

export const CHORD_TEMPLATES: ChordTemplate[] = [
  // Triads
  { name: 'Major', symbol: '', quality: 'Major Triad', intervals: [0, 4, 7], formula: '1 - 3 - 5' },
  { name: 'Minor', symbol: 'm', quality: 'Minor Triad', intervals: [0, 3, 7], formula: '1 - ♭3 - 5' },
  { name: 'Diminished', symbol: 'dim', quality: 'Diminished Triad', intervals: [0, 3, 6], formula: '1 - ♭3 - ♭5' },
  { name: 'Augmented', symbol: 'aug', quality: 'Augmented Triad', intervals: [0, 4, 8], formula: '1 - 3 - ♯5' },

  // Suspended
  { name: 'Sus2', symbol: 'sus2', quality: 'Suspended 2nd', intervals: [0, 2, 7], formula: '1 - 2 - 5' },
  { name: 'Sus4', symbol: 'sus4', quality: 'Suspended 4th', intervals: [0, 5, 7], formula: '1 - 4 - 5' },

  // 7th Chords
  { name: 'Major 7th', symbol: 'Maj7', quality: 'Major 7th', intervals: [0, 4, 7, 11], formula: '1 - 3 - 5 - 7' },
  { name: 'Dominant 7th', symbol: '7', quality: 'Dominant 7th', intervals: [0, 4, 7, 10], formula: '1 - 3 - 5 - ♭7' },
  { name: 'Minor 7th', symbol: 'm7', quality: 'Minor 7th', intervals: [0, 3, 7, 10], formula: '1 - ♭3 - 5 - ♭7' },
  { name: 'Half-Diminished 7th', symbol: 'm7♭5', quality: 'Half-Diminished 7th', intervals: [0, 3, 6, 10], formula: '1 - ♭3 - ♭5 - ♭7' },
  { name: 'Diminished 7th', symbol: 'dim7', quality: 'Diminished 7th', intervals: [0, 3, 6, 9], formula: '1 - ♭3 - ♭5 - ♭♭7' },

  // 6th & Add Chords
  { name: 'Major 6th', symbol: '6', quality: 'Major 6th', intervals: [0, 4, 7, 9], formula: '1 - 3 - 5 - 6' },
  { name: 'Minor 6th', symbol: 'm6', quality: 'Minor 6th', intervals: [0, 3, 7, 9], formula: '1 - ♭3 - 5 - 6' },
  { name: 'Add9', symbol: 'add9', quality: 'Added 9th', intervals: [0, 2, 4, 7], formula: '1 - 2 - 3 - 5' },
  { name: '9th', symbol: '9', quality: 'Dominant 9th', intervals: [0, 2, 4, 7, 10], formula: '1 - 2 - 3 - 5 - ♭7' },
  { name: 'Major 9th', symbol: 'Maj9', quality: 'Major 9th', intervals: [0, 2, 4, 7, 11], formula: '1 - 2 - 3 - 5 - 7' },
];

const TWO_NOTE_INTERVALS: Record<number, { name: string; short: string }> = {
  0: { name: 'Unison / Octave', short: 'P1 / P8' },
  1: { name: 'Minor 2nd', short: 'm2' },
  2: { name: 'Major 2nd', short: 'M2' },
  3: { name: 'Minor 3rd', short: 'm3' },
  4: { name: 'Major 3rd', short: 'M3' },
  5: { name: 'Perfect 4th', short: 'P4' },
  6: { name: 'Tritone / Diminished 5th', short: 'TT / d5' },
  7: { name: 'Perfect 5th', short: 'P5' },
  8: { name: 'Minor 6th', short: 'm6' },
  9: { name: 'Major 6th', short: 'M6' },
  10: { name: 'Minor 7th', short: 'm7' },
  11: { name: 'Major 7th', short: 'M7' },
};

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function recognizeChord(activeNotes: ActiveNoteInfo[]): ChordResult {
  if (activeNotes.length === 0) {
    return {
      chordName: 'No Gesture Detected',
      root: '',
      symbol: '',
      quality: 'Idle',
      notes: [],
      intervals: [],
      type: 'none',
      confidence: 0,
    };
  }

  const rawNotesList = activeNotes.map((n) => n.note);
  const uniquePitchClasses = Array.from(new Set(activeNotes.map((n) => n.pitchClass))).sort((a, b) => a - b);

  // Single Note
  if (uniquePitchClasses.length === 1) {
    const rootName = PITCH_CLASS_TO_NOTE_NAME[uniquePitchClasses[0]];
    return {
      chordName: `${rootName} Note`,
      root: rootName,
      symbol: rootName,
      quality: 'Single Note',
      notes: rawNotesList,
      intervals: ['Unison'],
      type: 'single',
      formattedFormula: '1',
      confidence: 1,
    };
  }

  // 2 Notes -> Interval Detection
  if (uniquePitchClasses.length === 2) {
    const [p1, p2] = uniquePitchClasses;
    const intervalSemitones = (p2 - p1 + 12) % 12;
    const intervalInfo = TWO_NOTE_INTERVALS[intervalSemitones] || { name: 'Interval', short: '' };
    const root1 = PITCH_CLASS_TO_NOTE_NAME[p1];
    const root2 = PITCH_CLASS_TO_NOTE_NAME[p2];

    return {
      chordName: `${root1} - ${root2} (${intervalInfo.name})`,
      root: root1,
      symbol: `${root1}:${root2}`,
      quality: intervalInfo.name,
      notes: rawNotesList,
      intervals: [intervalInfo.short],
      type: 'interval',
      formattedFormula: `Interval: ${intervalInfo.name}`,
      confidence: 0.95,
    };
  }

  // 3+ Notes -> Chord Template Matcher
  let bestMatch: {
    template: ChordTemplate;
    rootPitchClass: number;
    score: number;
    intervalNames: string[];
  } | null = null;

  for (const candidateRoot of uniquePitchClasses) {
    const intervalsFromCandidate = uniquePitchClasses
      .map((pc) => (pc - candidateRoot + 12) % 12)
      .sort((a, b) => a - b);

    for (const template of CHORD_TEMPLATES) {
      if (arraysEqual(intervalsFromCandidate, template.intervals)) {
        // Exact match
        const rootName = PITCH_CLASS_TO_NOTE_NAME[candidateRoot];
        return {
          chordName: `${rootName}${template.symbol ? ' ' + template.symbol : ''} (${template.name})`,
          root: rootName,
          symbol: `${rootName}${template.symbol}`,
          quality: template.name,
          notes: rawNotesList,
          intervals: template.intervals.map((i: number) => TWO_NOTE_INTERVALS[i]?.short || `${i}st`),
          type: 'chord',
          formattedFormula: template.formula,
          confidence: 1,
        };
      }

      // Check partial/subset match (e.g. 4 notes played that contain a triad + extra note)
      const matchesAllTemplateNotes = template.intervals.every((ti: number) => intervalsFromCandidate.includes(ti));
      if (matchesAllTemplateNotes) {
        const score = template.intervals.length / intervalsFromCandidate.length;
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = {
            template,
            rootPitchClass: candidateRoot,
            score,
            intervalNames: template.intervals.map((i: number) => TWO_NOTE_INTERVALS[i]?.short || `${i}st`),
          };
        }
      }
    }
  }

  if (bestMatch) {
    const rootName = PITCH_CLASS_TO_NOTE_NAME[bestMatch.rootPitchClass];
    const template = bestMatch.template;
    return {
      chordName: `${rootName}${template.symbol} (${template.name} + Ext)`,
      root: rootName,
      symbol: `${rootName}${template.symbol}`,
      quality: `${template.name} (Extended)`,
      notes: rawNotesList,
      intervals: bestMatch.intervalNames,
      type: 'chord',
      formattedFormula: template.formula,
      confidence: 0.8,
    };
  }

  // Fallback for complex unrecognized note combinations
  const rootName = PITCH_CLASS_TO_NOTE_NAME[uniquePitchClasses[0]];
  return {
    chordName: `${rootName} Cluster (${uniquePitchClasses.length} Notes)`,
    root: rootName,
    symbol: `${rootName} Cluster`,
    quality: 'Custom Tone Cluster',
    notes: rawNotesList,
    intervals: uniquePitchClasses.map((pc) => PITCH_CLASS_TO_NOTE_NAME[pc]),
    type: 'chord',
    formattedFormula: 'Polytonal Cluster',
    confidence: 0.6,
  };
}

/**
 * Hysteresis Debouncer to stabilize active chord result
 */
export class ChordHysteresisStabilizer {
  private lastNotesKey: string = '';
  private lastStableResult: ChordResult | null = null;
  private pendingResult: ChordResult | null = null;
  private pendingStartTime: number = 0;

  public update(activeNotes: ActiveNoteInfo[], hysteresisMs: number): ChordResult {
    const currentNotesKey = activeNotes
      .map((n) => n.note)
      .sort()
      .join(',');

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();

    if (currentNotesKey === this.lastNotesKey) {
      if (this.pendingResult && now - this.pendingStartTime >= hysteresisMs) {
        this.lastStableResult = this.pendingResult;
      }
    } else {
      // Notes changed, compute new candidate
      this.lastNotesKey = currentNotesKey;
      this.pendingResult = recognizeChord(activeNotes);
      this.pendingStartTime = now;

      // If transition to empty notes, clear fast after short delay
      if (activeNotes.length === 0) {
        if (!this.lastStableResult || this.lastStableResult.type === 'none') {
          this.lastStableResult = this.pendingResult;
        }
      }
    }

    return this.lastStableResult || this.pendingResult || recognizeChord(activeNotes);
  }
}
