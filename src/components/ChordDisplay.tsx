'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Music, Sparkles } from 'lucide-react';
import { ChordResult } from '@/types';

import { SoundWaveVisualizer } from '@/components/SoundWaveVisualizer';

interface ChordDisplayProps {
  chordResult: ChordResult;
  instrumentId?: string;
}

export function ChordDisplay({ chordResult, instrumentId }: ChordDisplayProps) {
  const isNoChord = chordResult.type === 'none';
  const isSitar = instrumentId === 'sitar';

  return (
    <div className={`relative w-full rounded-2xl p-6 transition-all duration-700 ease-in-out backdrop-blur-2xl flex flex-col items-center justify-center text-center overflow-hidden min-h-[220px] ${
      isSitar
        ? 'bg-[#2a070e]/85 border border-[#d4af37]/50 shadow-[0_0_45px_rgba(212,175,55,0.25)]'
        : 'bg-slate-950/70 border border-violet-500/30 shadow-[0_0_40px_rgba(139,92,246,0.15)]'
    }`}>
      {/* Background Decorative Glow */}
      <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
        isSitar ? 'bg-[#800f2f]/30' : 'bg-violet-600/20'
      }`} />
      <div className={`absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
        isSitar ? 'bg-[#d4af37]/20' : 'bg-cyan-600/20'
      }`} />

      {/* Header Tag */}
      <div className={`flex items-center gap-2 mb-3 px-3.5 py-1 rounded-full border text-xs font-mono tracking-widest uppercase transition-all duration-700 ${
        isSitar
          ? 'bg-[#d4af37]/15 border-[#d4af37]/40 text-[#fcd34d]'
          : 'bg-violet-500/10 border-violet-500/20 text-violet-300'
      }`}>
        <Sparkles className={`w-3.5 h-3.5 ${isSitar ? 'text-amber-400' : 'text-violet-400'}`} />
        <span>{isSitar ? '🪕 Sitar Indian Classical HUD' : 'Recognized Chord HUD'}</span>
      </div>

      {/* Main Chord Name Animated Typography */}
      <div className="relative my-2 w-full flex items-center justify-center min-h-[70px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={chordResult.chordName}
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex flex-col items-center w-full"
          >
            {isNoChord ? (
              <p className={`text-2xl font-light font-mono italic tracking-wide ${
                isSitar ? 'text-amber-200/60' : 'text-slate-500'
              }`}>
                Form gesture or play notes to trigger chord
              </p>
            ) : (
              <div className="flex flex-col items-center justify-center w-full">
                <div className="flex items-baseline justify-center gap-3 flex-wrap">
                  <h1 className={`text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r transition-all duration-700 ${
                    isSitar
                      ? 'from-[#fff8e7] via-[#fcd34d] to-[#f59e0b] drop-shadow-[0_0_25px_rgba(212,175,55,0.6)]'
                      : 'from-white via-cyan-100 to-violet-200 drop-shadow-[0_0_25px_rgba(167,139,250,0.6)]'
                  }`}>
                    {chordResult.symbol || chordResult.chordName}
                  </h1>
                  {chordResult.symbol && (
                    <span className={`text-xl sm:text-2xl font-semibold font-mono ${
                      isSitar ? 'text-[#fcd34d]' : 'text-violet-300'
                    }`}>
                      ({chordResult.quality})
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dynamic Sound Wave Audio Frequency Visualizer */}
      <SoundWaveVisualizer active={!isNoChord} instrumentId={instrumentId} />

      {/* Footer Info: Formula & Active Notes */}
      {!isNoChord && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mt-3 pt-3 border-t w-full flex flex-wrap items-center justify-center gap-4 text-xs font-mono ${
            isSitar ? 'border-[#d4af37]/30 text-amber-100/90' : 'border-slate-800/80 text-slate-300'
          }`}
        >
          {/* Quality Badge */}
          <div className={`px-2.5 py-1 rounded-md font-semibold border ${
            isSitar
              ? 'bg-[#3b0a13]/90 border-[#d4af37]/50 text-[#fcd34d]'
              : 'bg-slate-900/80 border-slate-700 text-cyan-300'
          }`}>
            {chordResult.quality}
          </div>

          {/* Formula */}
          {chordResult.formattedFormula && (
            <div className={`flex items-center gap-1.5 ${isSitar ? 'text-amber-200' : 'text-violet-300'}`}>
              <span className={isSitar ? 'text-amber-400/80' : 'text-slate-500'}>Formula:</span>
              <span className={`font-bold ${isSitar ? 'text-[#fcd34d]' : 'text-violet-200'}`}>{chordResult.formattedFormula}</span>
            </div>
          )}

          {/* Active Pitch Classes */}
          {chordResult.notes && chordResult.notes.length > 0 && (
            <div className={`flex items-center gap-1.5 ${isSitar ? 'text-[#f59e0b]' : 'text-emerald-400'}`}>
              <Music className="w-3.5 h-3.5" />
              <span>[{chordResult.notes.join(' • ')}]</span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
