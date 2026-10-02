'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { DIAL_NOTES } from '@/lib/inputModes/circularDialMode';
import { HandDetectionData } from '@/types';

interface CircularDialHUDProps {
  activeNote?: string;
  detectedHands: HandDetectionData[];
  mirrorVideo?: boolean;
  instrumentId?: string;
}

export function CircularDialHUD({
  activeNote,
  detectedHands,
  mirrorVideo = true,
}: CircularDialHUDProps) {
  const primaryHand = detectedHands[0];
  const indexTip    = primaryHand?.landmarks?.[8];

  const cursorX = indexTip ? (mirrorVideo ? 1 - indexTip.x : indexTip.x) * 100 : null;
  const cursorY = indexTip ? indexTip.y * 100 : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="mac-section-title">Circular Dial HUD</span>
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>360° Chromatic</span>
      </div>

      {/* Circular dial */}
      <div style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Outer ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '1px solid var(--separator-subtle)',
            pointerEvents: 'none',
          }}
        />

        {/* 12 sector arcs */}
        <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 200 200">
          {DIAL_NOTES.map((item, idx) => {
            const isSelected = activeNote === item.name;
            const startAngle = idx * 30 - 15;
            const endAngle   = idx * 30 + 15;

            const r1 = 45;
            const r2 = 91;

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
                    fill: isSelected ? 'var(--apple-green-bg)' : 'var(--surface-inset)',
                    stroke: isSelected ? 'var(--apple-green)' : 'var(--separator-subtle)',
                    strokeWidth: isSelected ? 1.5 : 0.75,
                    transition: 'fill 0.12s ease, stroke 0.12s ease',
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Note labels */}
        {DIAL_NOTES.map((item, idx) => {
          const isSelected = activeNote === item.name;
          const angleDeg   = idx * 30 - 90;
          const angleRad   = (angleDeg * Math.PI) / 180;
          const distance   = 68; // percentage radius
          const x          = 50 + distance * Math.cos(angleRad) * 0.5;
          const y          = 50 + distance * Math.sin(angleRad) * 0.5;

          return (
            <div
              key={`label-${item.name}`}
              style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                fontSize: isSelected ? '13px' : '10.5px',
                fontWeight: isSelected ? 600 : 450,
                color: isSelected ? 'var(--apple-green)' : 'var(--text-secondary)',
                pointerEvents: 'none',
                transition: 'all 0.12s ease',
              }}
            >
              {item.label}
            </div>
          );
        })}

        {/* Center hub */}
        <div
          style={{
            position: 'absolute',
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: '#ffffff',
            border: '1px solid var(--separator)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            zIndex: 10,
          }}
        >
          <AnimatePresence mode="wait">
            {activeNote ? (
              <motion.div
                key={activeNote}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--apple-green)' }}>
                  {activeNote}
                </span>
              </motion.div>
            ) : (
              <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>
                Center
              </span>
            )}
          </AnimatePresence>
        </div>

        {/* Fingertip cursor */}
        {cursorX !== null && cursorY !== null && (
          <div
            style={{
              position: 'absolute',
              left: `${cursorX}%`,
              top: `${cursorY}%`,
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'var(--apple-green)',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 30,
              boxShadow: '0 0 0 2px #fff',
            }}
          />
        )}
      </div>

      <p style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', margin: 0, textAlign: 'center', lineHeight: 1.4 }}>
        Rotate index finger around dial to sound pitches
      </p>
    </div>
  );
}
