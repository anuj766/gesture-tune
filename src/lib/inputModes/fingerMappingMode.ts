import {
  HandDetectionData,
  NoteMappingConfig,
  AppSettings,
} from '@/types';
import { getActiveNotesFromGestures } from '../noteMapping';
import { ChordHysteresisStabilizer } from '../chordEngine';
import { InputModeHandler, InputModeProcessResult } from './types';

export const fingerMappingHandler: InputModeHandler = {
  id: 'finger-mapping',
  name: 'Finger-to-Note Mapping',
  description: 'Each finger is mapped to an individual pitch note; chords are derived from active note combinations',
  iconName: 'Sliders',
  isAvailable: true,
  badge: 'DEFAULT',
  processInput: (
    hands: HandDetectionData[],
    mappingConfig: NoteMappingConfig,
    settings: AppSettings,
    stabilizer: ChordHysteresisStabilizer
  ): InputModeProcessResult => {
    let leftFingersState = null;
    let rightFingersState = null;

    if (hands) {
      for (const h of hands) {
        if (h.hand === 'Left') leftFingersState = h.fingers;
        if (h.hand === 'Right') rightFingersState = h.fingers;
      }
    }

    const currentActiveNotes = getActiveNotesFromGestures(
      leftFingersState,
      rightFingersState,
      mappingConfig
    );

    const stableChord = stabilizer.update(
      currentActiveNotes,
      settings.hysteresisMs
    );

    return {
      activeNotes: currentActiveNotes,
      chordResult: stableChord,
    };
  },
};
