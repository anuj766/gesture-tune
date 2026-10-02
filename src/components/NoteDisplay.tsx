'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ActiveNoteInfo } from '@/types';
import { Music } from 'lucide-react';

interface NoteDisplayProps {
  activeNotes: ActiveNoteInfo[];
  instrumentId?: string;
}

export function NoteDisplay({ activeNotes }: NoteDisplayProps) {
  const count = activeNotes.length;

  return (
    <div className="flex flex-col gap-2.5">
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <span className="mac-section-title">Active Notes</span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: count > 0 ? 'var(--apple-green)' : 'var(--text-tertiary)',
            background: count > 0 ? 'var(--apple-green-bg)' : 'transparent',
            padding: count > 0 ? '1px 6px' : '0',
            borderRadius: '10px',
          }}
        >
          {count > 0 ? `${count} sounding` : '0 sounding'}
        </span>
      </div>

      {/* Note Pills Container */}
      <div
        style={{
          minHeight: '62px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center',
          padding: '8px 10px',
          background: 'var(--surface-inset)',
          borderRadius: '10px',
        }}
      >
        <AnimatePresence mode="popLayout">
          {count === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                width: '100%',
                textAlign: 'center',
                padding: '6px 0',
                color: 'var(--text-tertiary)',
                fontSize: '12.5px',
                fontWeight: 400,
              }}
            >
              Extend fingers to sound notes
            </motion.div>
          ) : (
            activeNotes.map((item) => (
              <motion.div
                key={`${item.hand}-${item.finger}-${item.note}`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.12 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '5px 11px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05), 0 0 1px rgba(0, 0, 0, 0.08)',
                }}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'var(--apple-green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                  }}
                >
                  <Music style={{ width: '10px', height: '10px' }} />
                </div>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {item.note}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  {item.hand[0]} · {item.finger}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
