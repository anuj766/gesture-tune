'use client';

import { DIAL_NOTES } from '@/lib/inputModes/circularDialMode';
import { HandDetectionData } from '@/types';
import { motion } from 'framer-motion';

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
  const isSitar = instrumentId === 'sitar';

  // Extract index fingertip landmark (8) for real-time laser cursor position
  const primaryHand = detectedHands[0];
  const indexTip = primaryHand?.landmarks?.[8];

  const cursorX = indexTip ? (mirrorVideo ? 1 - indexTip.x : indexTip.x) * 100 : null;
  const cursorY = indexTip ? indexTip.y * 100 : null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
      {/* 360° Glass Circular Dial Wheel overlay on video */}
      <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
        {/* Outer Ring Accent */}
        <div className={`absolute inset-0 rounded-full border-2 transition-colors duration-700 ${
          isSitar ? 'border-[#d4af37]/30 shadow-[0_0_30px_rgba(212,175,55,0.2)]' : 'border-purple-500/30 shadow-[0_0_35px_rgba(168,85,247,0.25)]'
        }`} />

        {/* 12 Sector Radial Arc Buttons */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {DIAL_NOTES.map((item, idx) => {
            const isSelected = activeNote === item.name;
            const startAngle = idx * 30 - 15;
            const endAngle = idx * 30 + 15;

            // SVG Arc Path Calculation
            const r1 = 40; // Inner radius (OFF center ring)
            const r2 = 94; // Outer radius

            const rad1 = (startAngle * Math.PI) / 180;
            const rad2 = (endAngle * Math.PI) / 180;

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
                  className={`transition-all duration-150 ${
                    isSelected
                      ? isSitar
                        ? 'fill-[#d4af37]/60 stroke-[#fcd34d] stroke-2 drop-shadow-[0_0_15px_#fcd34d]'
                        : 'fill-purple-600/65 stroke-purple-300 stroke-2 drop-shadow-[0_0_18px_#c084fc]'
                      : 'fill-black/55 stroke-white/10'
                  }`}
                />
              </g>
            );
          })}
        </svg>

        {/* Sector Labels (Positioned around 360° circle) */}
        {DIAL_NOTES.map((item, idx) => {
          const isSelected = activeNote === item.name;
          const angle = idx * 30 - 90; // Align C at top (12 o'clock)
          const radius = 68; // Percent from center
          const rad = (angle * Math.PI) / 180;
          const x = 50 + radius * Math.cos(rad) * 0.5;
          const y = 50 + radius * Math.sin(rad) * 0.5;

          return (
            <div
              key={item.name}
              style={{ left: `${x}%`, top: `${y}%` }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 font-mono transition-all duration-150 ${
                isSelected
                  ? 'text-lg sm:text-xl font-black text-white drop-shadow-[0_0_12px_#fff] scale-125'
                  : 'text-xs sm:text-sm font-bold text-white/80'
              }`}
            >
              {item.name}
            </div>
          );
        })}

        {/* Inner Neutral Ring (OFF Center Circle) */}
        <div className="absolute w-20 h-20 rounded-full bg-black/80 border border-white/20 flex flex-col items-center justify-center backdrop-blur-md shadow-inner">
          <span className="text-[11px] font-mono font-bold text-white/50 uppercase tracking-wider">OFF</span>
        </div>
      </div>

      {/* Real-Time Index Fingertip Laser Tracking Cursor */}
      {cursorX !== null && cursorY !== null && (
        <motion.div
          animate={{ left: `${cursorX}%`, top: `${cursorY}%` }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          className="absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex items-center justify-center"
        >
          <div className={`w-full h-full rounded-full border-2 animate-ping opacity-75 ${
            isSitar ? 'border-[#fcd34d]' : 'border-purple-400'
          }`} />
          <div className={`w-3.5 h-3.5 rounded-full shadow-[0_0_15px_#fff] ${
            isSitar ? 'bg-[#fcd34d]' : 'bg-purple-300'
          }`} />
        </motion.div>
      )}

      {/* Bottom Floating Control Bar matching Reference Image */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-black/60 border border-white/15 backdrop-blur-md flex items-center gap-4 text-xs font-mono text-white/90 shadow-2xl z-30">
        <span className="font-bold text-purple-300 flex items-center gap-1.5">
          <span>🎯 Mode:</span>
          <span className="text-white">Circular Dial</span>
        </span>
        <span className="text-white/30">•</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Note: {activeNote || 'None (Center OFF)'}</span>
        </span>
        <span className="text-white/30">•</span>
        <span className="text-white/70">12 Chromatic Sectors</span>
      </div>
    </div>
  );
}
