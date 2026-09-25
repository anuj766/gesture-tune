'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { DIAL_NOTES } from '@/lib/inputModes/circularDialMode';
import { HandDetectionData } from '@/types';
import { Disc, Sparkles } from 'lucide-react';

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
  instrumentId,
}: CircularDialHUDProps) {
  // Extract index fingertip landmark (8) for real-time laser cursor position
  const primaryHand = detectedHands[0];
  const indexTip = primaryHand?.landmarks?.[8];

  const cursorX = indexTip ? (mirrorVideo ? 1 - indexTip.x : indexTip.x) * 100 : null;
  const cursorY = indexTip ? indexTip.y * 100 : null;
  const isSitar = instrumentId === 'sitar';

  return (
    <div className={`relative w-full rounded-2xl p-6 transition-all duration-700 ease-in-out backdrop-blur-2xl flex flex-col items-center justify-center overflow-hidden min-h-[420px] ${
      isSitar
        ? 'bg-[#2a070e]/85 border border-[#d4af37]/50 shadow-[0_0_45px_rgba(212,175,55,0.25)]'
        : 'bg-slate-950/80 border border-cyan-500/30 shadow-[0_0_40px_rgba(0,243,255,0.15)]'
    }`}>
      {/* Ambient Radial Background Glow */}
      <div className={`absolute inset-0 pointer-events-none ${
        isSitar
          ? 'bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.12)_0%,transparent_70%)]'
          : 'bg-[radial-gradient(circle_at_center,rgba(0,243,255,0.08)_0%,transparent_70%)]'
      }`} />

      {/* Header Tag */}
      <div className={`flex items-center gap-2 mb-4 px-3.5 py-1 rounded-full border text-xs font-mono tracking-widest uppercase transition-all duration-700 ${
        isSitar
          ? 'bg-[#d4af37]/15 border-[#d4af37]/40 text-[#fcd34d]'
          : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
      }`}>
        <Disc className={`w-3.5 h-3.5 animate-spin-slow ${isSitar ? 'text-amber-400' : 'text-cyan-400'}`} />
        <span>{isSitar ? '🪕 Sitar 360° Circular Note Dial' : '360° Circular Note Dial Interface'}</span>
      </div>

      {/* Main Interactive Circular Dial Container */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-2">
        {/* Outer Glowing Ring Accent */}
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 shadow-[0_0_30px_rgba(0,243,255,0.1)] pointer-events-none animate-pulse" />

        {/* 12 Sector Radial Arc Buttons */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {DIAL_NOTES.map((item, idx) => {
            const isSelected = activeNote === item.name;
            const startAngle = idx * 30 - 15;
            const endAngle = idx * 30 + 15;

            // SVG Arc Path Calculation
            const r1 = 45; // Inner radius
            const r2 = 92; // Outer radius

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
                      ? 'fill-cyan-400/50 stroke-cyan-300 stroke-2 drop-shadow-[0_0_12px_#00f3ff]'
                      : 'fill-slate-900/70 stroke-slate-800/80 hover:fill-cyan-500/20'
                  }`}
                />
              </g>
            );
          })}
        </svg>

        {/* 12 Musical Note Labels Positioned Radially Around Circle */}
        {DIAL_NOTES.map((item, idx) => {
          const isSelected = activeNote === item.name;
          const angleDeg = idx * 30 - 90; // Start C at 12 o'clock (top)
          const angleRad = (angleDeg * Math.PI) / 180;
          const distance = 118; // Radius position from center in px

          const left = 144 + distance * Math.cos(angleRad) - 16;
          const top = 144 + distance * Math.sin(angleRad) - 16;

          return (
            <motion.div
              key={`label-${item.name}`}
              style={{ left: `${left}px`, top: `${top}px` }}
              animate={{ scale: isSelected ? 1.25 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className={`absolute w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs transition-all pointer-events-none ${
                isSelected
                  ? 'bg-gradient-to-tr from-cyan-400 to-pink-500 text-black shadow-[0_0_20px_rgba(0,243,255,0.8)] z-20'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-300'
              }`}
            >
              {item.label}
            </motion.div>
          );
        })}

        {/* Center Display Hub */}
        <div className="absolute w-24 h-24 rounded-full bg-slate-950/95 border-2 border-cyan-500/40 flex flex-col items-center justify-center text-center shadow-[inset_0_0_20px_rgba(0,243,255,0.2)] z-10">
          <AnimatePresence mode="wait">
            {activeNote ? (
              <motion.div
                key={activeNote}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                className="flex flex-col items-center"
              >
                <span className="text-2xl font-black font-mono text-cyan-300 drop-shadow-[0_0_10px_#00f3ff]">
                  {activeNote}
                </span>
                <span className="text-[9px] font-mono text-slate-400 uppercase">Triggered</span>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center">
                <Sparkles className="w-5 h-5 text-slate-500 animate-pulse mb-0.5" />
                <span className="text-[9px] font-mono text-slate-500 text-center px-1">
                  Point Index Fingertip
                </span>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Index Fingertip Real-Time Laser Cursor */}
        {cursorX !== null && cursorY !== null && (
          <div
            className="absolute w-5 h-5 rounded-full border-2 border-pink-400 bg-pink-500/40 shadow-[0_0_15px_#ff007f] pointer-events-none z-30 transition-all duration-75 transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${cursorX}%`, top: `${cursorY}%` }}
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping" />
          </div>
        )}
      </div>

      {/* Footer Instruction */}
      <p className="mt-3 text-xs font-mono text-slate-400 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" /> Move index finger in a circle around center to switch pitches
      </p>
    </div>
  );
}
