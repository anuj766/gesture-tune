'use client';

import { motion } from 'framer-motion';

export function ViolinBackground({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.08 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        padding: '48px 0',
      }}
    >
      {/* Subtle musical staff lines */}
      {Array.from({ length: 4 }).map((_, staffIdx) => (
        <div key={staffIdx} style={{ position: 'relative', width: '100%', height: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ width: '100%', height: '1px', background: 'var(--label-3)' }} />
          <div style={{ width: '100%', height: '1px', background: 'var(--label-3)' }} />
          <div style={{ width: '100%', height: '1px', background: 'var(--label-3)' }} />
          <div style={{ width: '100%', height: '1px', background: 'var(--label-3)' }} />
          <div style={{ width: '100%', height: '1px', background: 'var(--label-3)' }} />
        </div>
      ))}
    </motion.div>
  );
}
