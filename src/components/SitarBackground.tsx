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
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      {/* 3D Rotating Glowing Hero Sitar Model (/classical_musical_instrument_-_sitar.glb) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-85 scale-125">
        <Sitar3DModel activeNotesCount={activeNotesCount} />
      </div>

      {/* Deep Maroon & Warm Saffron Radial Vignette Glows */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#120306] via-transparent to-[#1c060a]/80" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#800f2f]/30 via-[#b8860b]/15 to-transparent rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-gradient-to-tl from-[#f59e0b]/20 via-[#4a0e17]/35 to-transparent rounded-full blur-[140px]" />

      {/* Rotating Vector Mandala Overlay (Top-Left) */}
      <svg
        className="absolute top-[-60px] left-[-60px] w-96 h-96 opacity-25 text-[#d4af37] animate-[spin_120s_linear_infinite]"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="1" />
        {Array.from({ length: 12 }).map((_, i) => (
          <path
            key={i}
            d={`M100 100 L${100 + 85 * Math.cos((i * 30 * Math.PI) / 180)} ${100 + 85 * Math.sin((i * 30 * Math.PI) / 180)}`}
            stroke="currentColor"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Rotating Vector Mandala Overlay (Bottom-Right) */}
      <svg
        className="absolute bottom-[-80px] right-[-80px] w-[450px] h-[450px] opacity-20 text-[#d4af37] animate-[spin_160s_linear_infinite_reverse]"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="75" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" />
        <circle cx="100" cy="100" r="45" stroke="currentColor" strokeWidth="1.5" />
        {Array.from({ length: 16 }).map((_, i) => (
          <path
            key={i}
            d={`M100 100 L${100 + 90 * Math.cos((i * 22.5 * Math.PI) / 180)} ${100 + 90 * Math.sin((i * 22.5 * Math.PI) / 180)}`}
            stroke="currentColor"
            strokeWidth="0.8"
          />
        ))}
      </svg>
    </motion.div>
  );
}
