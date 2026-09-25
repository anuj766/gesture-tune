export type InstrumentId = 'piano' | 'sitar' | 'guitar' | 'violin' | 'synth';

export interface InstrumentDefinition {
  id: InstrumentId;
  name: string;
  category: string;
  icon: string;
  description: string;
  soundfontName: string;
  supportedNotes: { minMidi: number; maxMidi: number };
}
