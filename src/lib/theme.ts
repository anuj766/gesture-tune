import { InstrumentId } from './instruments/types';

export interface ThemeConfig {
  id: InstrumentId;
  name: string;
  dataInstrument: string;
  bgColor: string;
  accentHex: string;
  accentRgba: string;
  waveColor: string;
  waveColorDim: string;
}

// All instruments use the same neutral wave color.
// No per-instrument neon — theming is purely functional.
const WAVE       = 'rgba(52,199,89,0.8)';
const WAVE_DIM   = 'rgba(52,199,89,0.25)';

export const THEME_CONFIGS: Record<InstrumentId, ThemeConfig> = {
  piano:  { id: 'piano',  name: 'Piano',  dataInstrument: 'piano',  bgColor: '#f5f5f7', accentHex: '#34c759', accentRgba: 'rgba(52,199,89,', waveColor: WAVE, waveColorDim: WAVE_DIM },
  guitar: { id: 'guitar', name: 'Guitar', dataInstrument: 'guitar', bgColor: '#f5f5f7', accentHex: '#34c759', accentRgba: 'rgba(52,199,89,', waveColor: WAVE, waveColorDim: WAVE_DIM },
  sitar:  { id: 'sitar',  name: 'Sitar',  dataInstrument: 'sitar',  bgColor: '#f5f5f7', accentHex: '#34c759', accentRgba: 'rgba(52,199,89,', waveColor: WAVE, waveColorDim: WAVE_DIM },
  violin: { id: 'violin', name: 'Violin', dataInstrument: 'violin', bgColor: '#f5f5f7', accentHex: '#34c759', accentRgba: 'rgba(52,199,89,', waveColor: WAVE, waveColorDim: WAVE_DIM },
  synth:  { id: 'synth',  name: 'Synth',  dataInstrument: 'synth',  bgColor: '#f5f5f7', accentHex: '#34c759', accentRgba: 'rgba(52,199,89,', waveColor: WAVE, waveColorDim: WAVE_DIM },
};

export function getThemeConfig(instrumentId?: string): ThemeConfig {
  const key = (instrumentId as InstrumentId) || 'piano';
  return THEME_CONFIGS[key] || THEME_CONFIGS.piano;
}
