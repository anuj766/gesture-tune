'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SoundWaveVisualizerProps {
  active: boolean;
  instrumentId?: string;
  barCount?: number;
}

export function SoundWaveVisualizer({
  active,
  instrumentId,
  barCount = 24,
}: SoundWaveVisualizerProps) {
  const isSitar = instrumentId === 'sitar';
  const [heights, setHeights] = useState<number[]>(Array(barCount).fill(15));

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (active) {
      interval = setInterval(() => {
        setHeights(
          Array.from({ length: barCount }, (_, i) => {
            // Harmonic wave physics logic
            const centerFactor = 1 - Math.abs(i - barCount / 2) / (barCount / 2);
            const randomH = Math.random() * 75 + 25;
            return Math.min(100, Math.max(18, randomH * (0.5 + centerFactor * 0.5)));
          })
        );
      }, 70);
    } else {
      setHeights(Array(barCount).fill(12));
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [active, barCount]);

  return (
    <div className="flex items-center justify-center gap-1.5 h-14 my-3 px-4 py-2 rounded-xl bg-slate-950/40 border border-white/5 backdrop-blur-md">
      {heights.map((h, idx) => (
        <motion.div
          key={idx}
          animate={{ height: `${h}%` }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className={`w-1.5 rounded-full transition-colors duration-300 ${
            active
              ? isSitar
                ? 'bg-gradient-to-t from-amber-600 via-[#f59e0b] to-[#fcd34d] shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                : 'bg-gradient-to-t from-cyan-600 via-violet-500 to-pink-400 shadow-[0_0_8px_rgba(0,243,255,0.6)]'
              : 'bg-slate-800/60'
          }`}
        />
      ))}
    </div>
  );
}
