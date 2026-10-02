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
  barCount = 20,
}: SoundWaveVisualizerProps) {
  const [heights, setHeights] = useState<number[]>(Array(barCount).fill(10));

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (active) {
      interval = setInterval(() => {
        setHeights(
          Array.from({ length: barCount }, (_, i) => {
            const centerFactor = 1 - Math.abs(i - barCount / 2) / (barCount / 2);
            const randomH = Math.random() * 65 + 20;
            return Math.min(100, Math.max(12, randomH * (0.4 + centerFactor * 0.6)));
          })
        );
      }, 80);
    } else {
      setHeights(Array(barCount).fill(8));
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [active, barCount]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '3px',
        height: '32px',
        padding: '0 12px',
        borderRadius: '6px',
        background: 'var(--surface-inset)',
        border: '1px solid var(--separator-subtle)',
      }}
    >
      {heights.map((h, idx) => (
        <motion.div
          key={idx}
          animate={{ height: `${h}%` }}
          transition={{ duration: 0.1 }}
          style={{
            width: '2px',
            borderRadius: '2px',
            background: active ? 'var(--green)' : 'var(--label-4)',
            transition: 'background 0.2s',
          }}
        />
      ))}
    </div>
  );
}
