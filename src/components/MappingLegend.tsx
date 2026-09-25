'use client';

import { NoteMappingConfig, HandDetectionData, Finger, InputModeId } from '@/types';
import { Hand as HandIcon, Info, Sparkles } from 'lucide-react';
import { GESTURE_DEFINITIONS } from '@/lib/inputModes/gestureMode';

interface MappingLegendProps {
  mappingConfig: NoteMappingConfig;
  detectedHands: HandDetectionData[];
  inputMode?: InputModeId;
  activeGestureId?: string;
  capoFret?: number;
  instrumentId?: string;
}

const FINGERS_ORDER: { finger: Finger; label: string }[] = [
  { finger: 'thumb', label: 'Thumb' },
  { finger: 'index', label: 'Index' },
  { finger: 'middle', label: 'Middle' },
  { finger: 'ring', label: 'Ring' },
  { finger: 'pinky', label: 'Pinky' },
];

export function MappingLegend({
  mappingConfig,
  detectedHands,
  inputMode = 'finger-mapping',
  activeGestureId,
  capoFret = 0,
  instrumentId,
}: MappingLegendProps) {
  const leftHandData = detectedHands.find((h) => h.hand === 'Left');
  const rightHandData = detectedHands.find((h) => h.hand === 'Right');
  const isSitar = instrumentId === 'sitar';

  if (inputMode === 'circular-keyboard') {
    return (
      <div className={`w-full rounded-2xl p-5 backdrop-blur-xl transition-all duration-700 ease-in-out ${
        isSitar
          ? 'bg-[#2a070e]/85 border border-[#d4af37]/50 shadow-[0_0_35px_rgba(212,175,55,0.15)]'
          : 'bg-slate-950/60 border border-pink-500/20 shadow-[0_0_25px_rgba(255,0,127,0.08)]'
      }`}>
        <div className={`flex items-center justify-between mb-3 pb-2 border-b ${
          isSitar ? 'border-[#d4af37]/30' : 'border-slate-800/80'
        }`}>
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${isSitar ? 'text-amber-400' : 'text-pink-400'}`} />
            <span className={`text-xs font-mono font-bold tracking-widest uppercase ${
              isSitar ? 'text-[#fcd34d]' : 'text-pink-200'
            }`}>
              {isSitar ? '🪕 Sitar Circular Note Dial Guide' : 'Circular Note Dial Guide'}
            </span>
          </div>
          <span className={`text-[11px] font-mono ${isSitar ? 'text-amber-300' : 'text-pink-400'}`}>12 Chromatic Sectors (360°)</span>
        </div>
        <p className={`text-xs font-mono leading-relaxed ${isSitar ? 'text-amber-100/80' : 'text-slate-300'}`}>
          Move your index finger around the circular note dial to select notes. The active note is triggered immediately as your fingertip crosses sector boundaries.
        </p>
      </div>
    );
  }

  if (inputMode === 'gesture-mode') {
    return (
      <div className={`w-full rounded-2xl p-5 backdrop-blur-xl transition-all duration-700 ease-in-out ${
        isSitar
          ? 'bg-[#2a070e]/85 border border-[#d4af37]/50 shadow-[0_0_35px_rgba(212,175,55,0.15)]'
          : 'bg-slate-950/60 border border-cyan-500/20 shadow-[0_0_25px_rgba(0,243,255,0.08)]'
      }`}>
        <div className={`flex flex-wrap items-center justify-between gap-2 mb-4 pb-2 border-b ${
          isSitar ? 'border-[#d4af37]/30' : 'border-slate-800/80'
        }`}>
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${isSitar ? 'text-amber-400' : 'text-cyan-400'}`} />
            <span className={`text-xs font-mono font-bold tracking-widest uppercase ${
              isSitar ? 'text-[#fcd34d]' : 'text-cyan-200'
            }`}>
              {isSitar ? '🪕 9 Sitar Guitar Chords Map' : '9 Open Guitar Chords Map'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {capoFret > 0 && (
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                isSitar
                  ? 'bg-amber-500/20 text-[#fcd34d] border-amber-400/50'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
              }`}>
                🎸 Capo Fret {capoFret} (+{capoFret} semitones per string)
              </span>
            )}
            <span className={`text-[11px] font-mono ${isSitar ? 'text-amber-300' : 'text-cyan-400'}`}>
              Preserves authentic string voicings
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {GESTURE_DEFINITIONS.map((item) => {
            const isActive = activeGestureId === item.id;
            return (
              <div
                key={item.id}
                className={`flex flex-col p-2.5 rounded-xl border transition-all ${
                  isActive
                    ? isSitar
                      ? 'bg-amber-500/30 border-[#d4af37] text-white shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-[1.02]'
                      : 'bg-cyan-500/25 border-cyan-400 text-white shadow-[0_0_20px_rgba(0,243,255,0.4)] scale-[1.02]'
                    : isSitar
                    ? 'bg-[#3b0a13]/70 border-[#d4af37]/30 text-amber-100/90 hover:border-[#d4af37]/60'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{item.icon}</span>
                  <span
                    className={`text-xs font-mono font-black px-2 py-0.5 rounded-md ${
                      isActive
                        ? isSitar ? 'bg-[#d4af37] text-black' : 'bg-cyan-400 text-black'
                        : isSitar ? 'bg-[#2a070e] text-[#fcd34d] border border-[#d4af37]/40' : 'bg-slate-800 text-cyan-300'
                    }`}
                  >
                    {item.symbol}
                  </span>
                </div>
                <span className="text-xs font-bold font-mono mt-1.5 line-clamp-1">{item.name}</span>
                <span className={`text-[10px] font-sans line-clamp-1 ${isSitar ? 'text-amber-200/70' : 'text-slate-400'}`}>
                  {item.description}
                </span>
                <div className={`mt-2 pt-1.5 border-t flex items-center justify-between text-[11px] font-mono font-bold ${
                  isSitar ? 'border-[#d4af37]/30 text-[#fcd34d]' : 'border-slate-800/60 text-cyan-300'
                }`}>
                  <span>{item.chordName}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl p-5 bg-slate-950/60 border border-violet-500/20 backdrop-blur-xl shadow-[0_0_25px_rgba(139,92,246,0.08)]">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-mono font-bold tracking-widest text-violet-200 uppercase">
            Finger-to-Note Mapping Reference
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Scale: C Major (C4 - E5)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left Hand Card */}
        <div className="rounded-xl p-4 bg-cyan-950/20 border border-cyan-500/30">
          <div className="flex items-center justify-between mb-3 text-cyan-300 font-mono text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <HandIcon className="w-4 h-4 text-cyan-400" /> Left Hand
            </span>
            <span className="text-[10px] text-cyan-400/80">C4 — G4</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 text-center">
            {FINGERS_ORDER.map(({ finger, label }) => {
              const note = mappingConfig.Left[finger];
              const isExtended = leftHandData?.fingers[finger] ?? false;
              return (
                <div
                  key={`left-${finger}`}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                    isExtended
                      ? 'bg-cyan-500/30 text-cyan-100 border border-cyan-400 shadow-[0_0_12px_rgba(0,243,255,0.4)] scale-105'
                      : 'bg-slate-900/60 text-slate-400 border border-slate-800'
                  }`}
                >
                  <span className="text-sm font-mono font-black">{note}</span>
                  <span className="text-[9px] uppercase tracking-tighter opacity-70 mt-0.5">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Hand Card */}
        <div className="rounded-xl p-4 bg-pink-950/20 border border-pink-500/30">
          <div className="flex items-center justify-between mb-3 text-pink-300 font-mono text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <HandIcon className="w-4 h-4 text-pink-400" /> Right Hand
            </span>
            <span className="text-[10px] text-pink-400/80">A4 — E5</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 text-center">
            {FINGERS_ORDER.map(({ finger, label }) => {
              const note = mappingConfig.Right[finger];
              const isExtended = rightHandData?.fingers[finger] ?? false;
              return (
                <div
                  key={`right-${finger}`}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                    isExtended
                      ? 'bg-pink-500/30 text-pink-100 border border-pink-400 shadow-[0_0_12px_rgba(255,0,127,0.4)] scale-105'
                      : 'bg-slate-900/60 text-slate-400 border border-slate-800'
                  }`}
                >
                  <span className="text-sm font-mono font-black">{note}</span>
                  <span className="text-[9px] uppercase tracking-tighter opacity-70 mt-0.5">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
