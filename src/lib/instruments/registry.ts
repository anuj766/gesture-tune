import { InstrumentDefinition } from './types';

export const INSTRUMENTS: InstrumentDefinition[] = [
  {
    id: 'piano',
    name: 'Acoustic Grand Piano',
    category: 'Keyboard',
    icon: '🎹',
    description: 'Concert Grand Piano with rich resonance and polyphonic dynamics',
    soundfontName: 'acoustic_grand_piano-mp3',
    supportedNotes: { minMidi: 40, maxMidi: 88 },
  },
  {
    id: 'guitar',
    name: 'Acoustic Guitar',
    category: 'Plucked Strings',
    icon: '🎸',
    description: 'Steel-string acoustic guitar with natural warm voicings and string resonance',
    soundfontName: 'acoustic_guitar_steel-mp3',
    supportedNotes: { minMidi: 40, maxMidi: 84 },
  },
  {
    id: 'sitar',
    name: 'Indian Classical Sitar',
    category: 'World Strings',
    icon: '🪕',
    description: 'Traditional Sitar with sympathetic strings (Tarab) and rich Indian classical timbres',
    soundfontName: 'sitar-mp3',
    supportedNotes: { minMidi: 40, maxMidi: 84 },
  },
  {
    id: 'violin',
    name: 'Orchestral Violin',
    category: 'Bowed Strings',
    icon: '🎻',
    description: 'Warm orchestral violin with expressive sustain and warm walnut acoustics',
    soundfontName: 'violin-mp3',
    supportedNotes: { minMidi: 55, maxMidi: 90 },
  },
  {
    id: 'synth',
    name: 'Cyber Lead Synth',
    category: 'Electronic',
    icon: '🎛️',
    description: 'Futuristic polyphonic analog synthesizer with glowing retro synthwave timbres',
    soundfontName: 'lead_1_square-mp3',
    supportedNotes: { minMidi: 40, maxMidi: 88 },
  },
];

export function getInstrument(id: string): InstrumentDefinition {
  return INSTRUMENTS.find((inst) => inst.id === id) || INSTRUMENTS[0];
}
