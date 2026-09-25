'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ActiveNoteInfo } from '@/types';
import { Music } from 'lucide-react';

import { getThemeConfig } from '@/lib/theme';

interface NoteDisplayProps {
  activeNotes: ActiveNoteInfo[];
  instrumentId?: string;
}

export function NoteDisplay({ activeNotes, instrumentId }: NoteDisplayProps) {
  const theme = getThemeConfig(instrumentId);
  const isSitar = instrumentId === 'sitar';

  return (
    <div className={`w-full rounded-2xl p-5 backdrop-blur-xl transition-all duration-700 ease-in-out ${theme.cardBg} border ${theme.cardBorder} ${theme.cardGlow}`}>
      <div className={`flex items-center justify-between mb-3 pb-2 border-b ${
        isSitar ? 'border-[#d4af37]/30' : 'border-slate-800/80'
      }`}>
        <div className="flex items-center gap-2">
          <Music className={`w-4 h-4 ${theme.accentText}`} />
          <span className={`text-xs font-mono font-bold tracking-widest uppercase ${theme.accentText}`}>
            Active Tone Matrix
          </span>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {activeNotes.length} Note{activeNotes.length !== 1 ? 's' : ''} Active
        </span>
      </div>

      <div className="flex flex-wrap gap-2.5 min-h-[52px] items-center">
        <AnimatePresence>
          {activeNotes.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs font-mono text-slate-500 italic w-full text-center py-2"
            >
              No notes triggered. Extend fingers on either hand.
            </motion.p>
          ) : (
            activeNotes.map((item) => {
              const isLeft = item.hand === 'Left';
              return (
                <motion.div
                  key={`${item.hand}-${item.finger}-${item.note}`}
                  initial={{ scale: 0.6, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.6, opacity: 0, y: -10 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-mono font-bold border transition-all ${
                    isLeft
                      ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50 shadow-[0_0_15px_rgba(0,243,255,0.3)]'
                      : 'bg-pink-500/20 text-pink-200 border-pink-400/50 shadow-[0_0_15px_rgba(255,0,127,0.3)]'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isLeft ? 'bg-cyan-400 shadow-[0_0_8px_#00f3ff]' : 'bg-pink-400 shadow-[0_0_8px_#ff007f]'
                    }`}
                  />
                  <span className="text-base tracking-tight">{item.note}</span>
                  <span className="text-[10px] opacity-75 font-normal capitalize">
                    ({item.hand[0]}•{item.finger})
                  </span>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
