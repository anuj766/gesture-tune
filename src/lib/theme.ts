import { InstrumentId } from './instruments/types';

export interface ThemeConfig {
  id: InstrumentId;
  name: string;
  bgColor: string;
  headerBg: string;
  headerBorder: string;
  headerGlow: string;
  cardBg: string;
  cardBorder: string;
  cardGlow: string;
  accentText: string;
  accentBadge: string;
  primaryGlow: string;
  secondaryGlow: string;
}

export const THEME_CONFIGS: Record<InstrumentId, ThemeConfig> = {
  piano: {
    id: 'piano',
    name: 'Piano Modern Dark',
    bgColor: 'bg-[#070B14]',
    headerBg: 'bg-slate-950/70',
    headerBorder: 'border-cyan-500/20',
    headerGlow: 'shadow-[0_0_35px_rgba(0,229,255,0.1)]',
    cardBg: 'bg-slate-950/60',
    cardBorder: 'border-slate-800/80',
    cardGlow: 'shadow-[0_0_25px_rgba(0,229,255,0.08)]',
    accentText: 'text-cyan-300',
    accentBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    primaryGlow: 'rgba(0, 229, 255, 0.15)',
    secondaryGlow: 'rgba(109, 91, 255, 0.15)',
  },
  guitar: {
    id: 'guitar',
    name: 'Acoustic Guitar Amber',
    bgColor: 'bg-[#1a0e08]',
    headerBg: 'bg-[#2b170e]/80',
    headerBorder: 'border-[#f59e0b]/30',
    headerGlow: 'shadow-[0_0_35px_rgba(245,158,11,0.15)]',
    cardBg: 'bg-[#26140b]/70',
    cardBorder: 'border-[#f59e0b]/25',
    cardGlow: 'shadow-[0_0_25px_rgba(245,158,11,0.12)]',
    accentText: 'text-amber-300',
    accentBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    primaryGlow: 'rgba(245, 158, 11, 0.2)',
    secondaryGlow: 'rgba(217, 119, 6, 0.15)',
  },
  sitar: {
    id: 'sitar',
    name: 'Indian Classical Sitar',
    bgColor: 'bg-[#1c0509]',
    headerBg: 'bg-[#2a070e]/85',
    headerBorder: 'border-[#d4af37]/40',
    headerGlow: 'shadow-[0_0_40px_rgba(212,175,55,0.2)]',
    cardBg: 'bg-[#2a070e]/75',
    cardBorder: 'border-[#d4af37]/30',
    cardGlow: 'shadow-[0_0_30px_rgba(212,175,55,0.15)]',
    accentText: 'text-[#fcd34d]',
    accentBadge: 'bg-[#d4af37]/20 text-[#fcd34d] border-[#d4af37]/40',
    primaryGlow: 'rgba(212, 175, 55, 0.25)',
    secondaryGlow: 'rgba(128, 15, 47, 0.2)',
  },
  violin: {
    id: 'violin',
    name: 'Orchestral Violin',
    bgColor: 'bg-[#140c09]',
    headerBg: 'bg-[#24150f]/80',
    headerBorder: 'border-[#d97706]/30',
    headerGlow: 'shadow-[0_0_35px_rgba(217,119,6,0.15)]',
    cardBg: 'bg-[#1f110c]/70',
    cardBorder: 'border-[#d97706]/25',
    cardGlow: 'shadow-[0_0_25px_rgba(217,119,6,0.12)]',
    accentText: 'text-amber-200',
    accentBadge: 'bg-amber-600/20 text-amber-200 border-amber-500/40',
    primaryGlow: 'rgba(217, 119, 6, 0.2)',
    secondaryGlow: 'rgba(180, 83, 9, 0.15)',
  },
  synth: {
    id: 'synth',
    name: 'Cyber Synthwave',
    bgColor: 'bg-[#0f071c]',
    headerBg: 'bg-[#1d0a33]/80',
    headerBorder: 'border-pink-500/30',
    headerGlow: 'shadow-[0_0_35px_rgba(236,72,153,0.18)]',
    cardBg: 'bg-[#18082b]/70',
    cardBorder: 'border-violet-500/30',
    cardGlow: 'shadow-[0_0_25px_rgba(139,92,246,0.15)]',
    accentText: 'text-pink-300',
    accentBadge: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    primaryGlow: 'rgba(236, 72, 153, 0.25)',
    secondaryGlow: 'rgba(139, 92, 246, 0.2)',
  },
};

export function getThemeConfig(instrumentId?: string): ThemeConfig {
  const key = (instrumentId as InstrumentId) || 'piano';
  return THEME_CONFIGS[key] || THEME_CONFIGS.piano;
}
