'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChordResult } from '@/types';
import { SoundWaveVisualizer } from '@/components/SoundWaveVisualizer';

interface ChordDisplayProps {
  chordResult: ChordResult;
  instrumentId?: string;
}

export function ChordDisplay({ chordResult, instrumentId }: ChordDisplayProps) {
  const isNoChord = chordResult.type === 'none';

  return (
    <div
      className="panel"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <span className="section-label" style={{ marginBottom: '8px' }}>
        Detected Chord
      </span>

      <div style={{ minHeight: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={chordResult.chordName}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {isNoChord ? (
              <span style={{ fontSize: '13px', color: 'var(--label-3)' }}>
                Form a gesture to trigger a chord
              </span>
            ) : (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '44px',
                    fontWeight: 700,
                    color: 'var(--label)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {chordResult.symbol || chordResult.chordName}
                </span>
                {chordResult.quality && (
                  <span style={{ fontSize: '16px', color: 'var(--label-2)', fontWeight: 500 }}>
                    {chordResult.quality}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={{ marginTop: '12px' }}>
        <SoundWaveVisualizer active={!isNoChord} instrumentId={instrumentId} />
      </div>

      {!isNoChord && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '12px',
            fontSize: '11px',
            color: 'var(--label-2)',
          }}
        >
          {chordResult.formattedFormula && (
            <span>{chordResult.formattedFormula}</span>
          )}
          {chordResult.notes && chordResult.notes.length > 0 && (
            <>
              <span style={{ color: 'var(--separator)' }}>•</span>
              <span>{chordResult.notes.join(' · ')}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
