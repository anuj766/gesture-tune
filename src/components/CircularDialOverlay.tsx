'use client';

import { DIAL_NOTES } from '@/lib/inputModes/circularDialMode';
import { HandDetectionData } from '@/types';
import { motion } from 'framer-motion';
import { getThemeConfig } from '@/lib/theme';

interface CircularDialOverlayProps {
  activeNote?: string;
  detectedHands: HandDetectionData[];
  mirrorVideo?: boolean;
  instrumentId?: string;
}

export function CircularDialOverlay({
  activeNote,
  detectedHands,
  mirrorVideo = true,
  instrumentId,
}: CircularDialOverlayProps) {
  const theme = getThemeConfig(instrumentId);

  const primaryHand = detectedHands[0];
  const indexTip    = primaryHand?.landmarks?.[8];
  const cursorX     = indexTip ? (mirrorVideo ? 1 - indexTip.x : indexTip.x) * 100 : null;
  const cursorY     = indexTip ? indexTip.y * 100 : null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
      <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">

        {/* Outer ring — minimal */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ border: `1px solid rgba(255,255,255,0.12)` }}
        />

        {/* 12 Sector Arcs */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {DIAL_NOTES.map((item, idx) => {
            const isSelected = activeNote === item.name;
            const startAngle = idx * 30 - 15;
            const endAngle   = idx * 30 + 15;

            const r1 = 40;
            const r2 = 94;

            const rad1 = (startAngle * Math.PI) / 180;
            const rad2 = (endAngle   * Math.PI) / 180;

            const x1 = 100 + r1 * Math.cos(rad1);
            const y1 = 100 + r1 * Math.sin(rad1);
            const x2 = 100 + r2 * Math.cos(rad1);
            const y2 = 100 + r2 * Math.sin(rad1);
            const x3 = 100 + r2 * Math.cos(rad2);
            const y3 = 100 + r2 * Math.sin(rad2);
            const x4 = 100 + r1 * Math.cos(rad2);
            const y4 = 100 + r1 * Math.sin(rad2);

            const d = `M ${x1} ${y1} L ${x2} ${y2} A ${r2} ${r2} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${r1} ${r1} 0 0 0 ${x1} ${y1} Z`;

            return (
              <g key={item.name}>
                <path
                  d={d}
                  style={{
                    fill:        isSelected ? `${theme.accentHex}30` : 'rgba(8,9,12,0.5)',
                    stroke:      isSelected ? theme.accentHex         : 'rgba(255,255,255,0.08)',
                    strokeWidth: isSelected ? 1.5 : 0.5,
                    transition:  'fill 0.12s ease, stroke 0.12s ease',
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Note labels */}
        {DIAL_NOTES.map((item, idx) => {
          const isSelected = activeNote === item.name;
          const angle = idx * 30 - 90;
          const radius = 68;
          const rad = (angle * Math.PI) / 180;
          const x = 50 + radius * Math.cos(rad) * 0.5;
          const y = 50 + radius * Math.sin(rad) * 0.5;

          return (
            <div
              key={item.name}
              style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: isSelected ? '15px' : '11px',
                fontWeight: isSelected ? 700 : 500,
                color: isSelected ? theme.accentHex : 'rgba(255,255,255,0.6)',
                transition: 'font-size 0.12s ease, color 0.12s ease',
              }}
            >
              {item.name}
            </div>
          );
        })}

        {/* Center hub */}
        <div
          className="absolute w-16 h-16 rounded-full flex flex-col items-center justify-center"
          style={{
            background: 'rgba(8,9,12,0.85)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '9px',
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            OFF
          </span>
        </div>
      </div>

      {/* Fingertip cursor */}
      {cursorX !== null && cursorY !== null && (
        <motion.div
          animate={{ left: `${cursorX}%`, top: `${cursorY}%` }}
          transition={{ type: 'spring', stiffness: 520, damping: 30 }}
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{
              background: `${theme.accentHex}55`,
              border: `1.5px solid ${theme.accentHex}`,
            }}
          />
        </motion.div>
      )}

      {/* Bottom status bar */}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-full text-xs"
        style={{
          background: 'rgba(8,9,12,0.72)',
          border: '1px solid rgba(255,255,255,0.1)',
          fontFamily: "'JetBrains Mono', monospace",
          color: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span>Circular Dial</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: activeNote ? theme.accentHex : 'rgba(255,255,255,0.3)' }}
          />
          {activeNote || 'Center · Off'}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
        <span>12 chromatic</span>
      </div>
    </div>
  );
}
