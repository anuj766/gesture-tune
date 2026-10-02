'use client';

import { motion } from 'framer-motion';
import { Sitar3DModel } from '@/components/Sitar3DModel';

interface SitarBackgroundProps {
  active: boolean;
  activeNotesCount?: number;
}

export function SitarBackground({ active, activeNotesCount = 0 }: SitarBackgroundProps) {
  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.15 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Sitar3DModel activeNotesCount={activeNotesCount} />
    </motion.div>
  );
}
