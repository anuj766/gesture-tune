'use client';

import React, { useEffect, useRef } from 'react';
import { Camera, AlertTriangle, RefreshCw, Hand as HandIcon, Sparkles } from 'lucide-react';
import { HandDetectionData, ChordResult } from '@/types';

import { CircularDialOverlay } from '@/components/CircularDialOverlay';

interface CameraFeedProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isLoading: boolean;
  error: string | null;
  mirrorVideo: boolean;
  detectedHands: HandDetectionData[];
  chordResult?: ChordResult;
  instrumentId?: string;
  inputMode?: string;
  activeNote?: string;
  onRetry?: () => void;
}

export function CameraFeed({
  videoRef,
  canvasRef,
  isLoading,
  error,
  mirrorVideo,
  detectedHands,
  chordResult,
  instrumentId,
  inputMode,
  activeNote,
  onRetry,
}: CameraFeedProps) {
  const leftHandDetected = detectedHands.some((h) => h.hand === 'Left');
  const rightHandDetected = detectedHands.some((h) => h.hand === 'Right');

  const waveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animIdRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  const isSitar = instrumentId === 'sitar';
  const isChordActive = chordResult && chordResult.type !== 'none';

  // Continuous Edge-to-Edge Oscilloscope Waveform Loop
  useEffect(() => {
    const canvas = waveCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const renderWave = () => {
      if (!isRunning || !canvas) return;

      const w = (canvas.width = canvas.clientWidth);
      const h = (canvas.height = canvas.clientHeight);

      ctx.clearRect(0, 0, w, h);

      phaseRef.current += isChordActive ? 0.15 : 0.04;
      const phase = phaseRef.current;
      const centerY = h * 0.75;
      const amplitude = isChordActive ? 28 : 6;

      ctx.beginPath();
      ctx.moveTo(0, centerY);

      for (let x = 0; x < w; x += 4) {
        const freq = 0.015;
        const y = centerY + Math.sin(x * freq + phase) * amplitude * Math.sin((x / w) * Math.PI);
        ctx.lineTo(x, y);
      }

      ctx.lineWidth = isChordActive ? 3.5 : 1.5;
      ctx.strokeStyle = isSitar
        ? isChordActive
          ? '#fcd34d'
          : 'rgba(212, 175, 55, 0.4)'
        : isChordActive
        ? '#00f3ff'
        : 'rgba(0, 243, 255, 0.3)';
      ctx.shadowColor = isSitar ? '#f59e0b' : '#00f3ff';
      ctx.shadowBlur = isChordActive ? 16 : 4;
      ctx.stroke();

      animIdRef.current = requestAnimationFrame(renderWave);
    };

    animIdRef.current = requestAnimationFrame(renderWave);

    return () => {
      isRunning = false;
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [isChordActive, isSitar]);

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-video rounded-3xl overflow-hidden bg-slate-950/90 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl group flex items-center justify-center">
      {/* Video Element (Uncropped object-contain) */}
      <video
        ref={videoRef}
        className={`w-full h-full object-contain transition-transform duration-300 ${
          mirrorVideo ? 'scale-x-[-1]' : ''
        }`}
        playsInline
        muted
      />

      {/* Skeleton Overlay Canvas (MediaPipe Finger Landmarks) */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full pointer-events-none ${
          mirrorVideo ? 'scale-x-[-1]' : ''
        }`}
      />

      {/* Horizontal Oscilloscope Audio Waveform Canvas */}
      <canvas ref={waveCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

      {/* Interactive 360° Circular Note Dial Wheel Overlay (Circular Dial Mode) */}
      {inputMode === 'circular-keyboard' && !isLoading && !error && (
        <CircularDialOverlay
          activeNote={activeNote}
          detectedHands={detectedHands}
          mirrorVideo={mirrorVideo}
          instrumentId={instrumentId}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md z-20">
          <div className="relative flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <Camera className="w-6 h-6 text-cyan-400 absolute animate-pulse" />
          </div>
          <p className="text-cyan-300 font-mono text-sm tracking-widest uppercase animate-pulse">
            Initializing Hand Tracking & WASM...
          </p>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-red-950/85 backdrop-blur-lg z-20 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 mb-4 border border-red-500/40">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-red-200 mb-2">Camera Feed Error</h3>
          <p className="text-sm text-red-300/80 max-w-md mb-5 leading-relaxed">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 transition-all cursor-pointer font-medium text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Retry Connection
            </button>
          )}
        </div>
      )}

      {/* HUD Floating Overlays Directly On Video */}
      {!isLoading && !error && (
        <>
          {/* Top Floating Status Bar */}
          <div className="absolute top-5 left-5 right-5 flex items-center justify-between pointer-events-none z-20">
            {/* Hand Tracking Pill */}
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-md">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  detectedHands.length > 0
                    ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
                    : 'bg-amber-400 animate-ping'
                }`}
              />
              <span className="text-xs font-mono tracking-wider text-slate-200 uppercase">
                {detectedHands.length > 0
                  ? `${detectedHands.length} Hand${detectedHands.length > 1 ? 's' : ''} Active`
                  : 'Searching for hands...'}
              </span>
            </div>

            {/* Hand Badges */}
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all ${
                  leftHandDetected
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,243,255,0.4)]'
                    : 'bg-black/40 text-slate-500 border border-white/5'
                }`}
              >
                <HandIcon className="w-3.5 h-3.5" /> Left
              </div>
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all ${
                  rightHandDetected
                    ? 'bg-pink-500/25 text-pink-300 border border-pink-400/50 shadow-[0_0_12px_rgba(255,0,127,0.4)]'
                    : 'bg-black/40 text-slate-500 border border-white/5'
                }`}
              >
                <HandIcon className="w-3.5 h-3.5" /> Right
              </div>
            </div>
          </div>

          {/* Bottom Center Floating Chord HUD & Roman Numeral Overlay */}
          {chordResult && chordResult.type !== 'none' && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center pointer-events-none z-20 animate-fade-in">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold tracking-widest uppercase mb-1 text-amber-300/90">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>SOUNDING CHORD</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_20px_rgba(252,211,77,0.8)]">
                {chordResult.symbol || chordResult.chordName}
              </h2>
              <span className="text-sm font-mono text-amber-200/90 mt-0.5">
                {chordResult.quality}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
