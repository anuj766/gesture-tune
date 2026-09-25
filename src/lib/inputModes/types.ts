import {
  HandDetectionData,
  NoteMappingConfig,
  AppSettings,
  ActiveNoteInfo,
  ChordResult,
  InputModeId,
  FingerState,
} from '@/types';
import { ChordHysteresisStabilizer } from '../chordEngine';

export interface InputModeProcessResult {
  activeNotes: ActiveNoteInfo[];
  chordResult: ChordResult;
  activeGestureId?: string;
}

export interface InputModeHandler {
  id: InputModeId;
  name: string;
  description: string;
  iconName: string;
  isAvailable: boolean;
  badge?: string;
  processInput: (
    hands: HandDetectionData[],
    mappingConfig: NoteMappingConfig,
    settings: AppSettings,
    stabilizer: ChordHysteresisStabilizer
  ) => InputModeProcessResult;
}

export interface GestureDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  chordName: string;
  symbol: string;
  quality: string;
  notes: string[];
  formula: string;
  pattern: FingerState;
}
