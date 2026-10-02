'use client';

import React, { useEffect, useRef } from 'react';
import { Camera, AlertTriangle, RefreshCw, Hand as HandIcon } from 'lucide-react';
import { HandDetectionData, ChordResult } from '@/types';
import { CircularDialOverlay } from '@/components/CircularDialOverlay';
import { getThemeConfig } from '@/lib/theme';

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
  const leftHandDetected  = detectedHands.some((h) => h.hand === 'Left');
  const rightHandDetected = detectedHands.some((h) => h.hand === 'Right');

  const waveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animIdRef     = useRef<number | null>(null);
  const phaseRef      = useRef<number>(0);

  const theme = getThemeConfig(instrumentId);
  const isChordActive = chordResult && chordResult.type !== 'none';

  // Oscilloscope waveform — clean functional visual feedback on camera canvas
  useEffect(() => {
    const canvas = waveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const renderWave = () => {
      if (!isRunning || !canvas) return;
      const w = (canvas.width  = canvas.clientWidth);
      const h = (canvas.height = canvas.clientHeight);

      ctx.clearRect(0, 0, w, h);

      phaseRef.current += isChordActive ? 0.10 : 0.025;
      const phase    = phaseRef.current;
      const centerY  = h * 0.88;
      const amplitude = isChordActive ? 16 : 2.5;

      ctx.beginPath();
      ctx.moveTo(0, centerY);
      for (let x = 0; x < w; x += 3) {
        const y = centerY + Math.sin(x * 0.015 + phase) * amplitude * Math.sin((x / w) * Math.PI);
        ctx.lineTo(x, y);
      }

      ctx.lineWidth   = isChordActive ? 1.5 : 1;
      ctx.strokeStyle = isChordActive ? theme.waveColor : theme.waveColorDim;
      ctx.globalAlpha = isChordActive ? 0.85 : 0.3;
      ctx.stroke();
      ctx.globalAlpha = 1;

      animIdRef.current = requestAnimationFrame(renderWave);
    };

    animIdRef.current = requestAnimationFrame(renderWave);
    return () => {
      isRunning = false;
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [isChordActive, theme.waveColor, theme.waveColorDim]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '360px',
        borderRadius: '14px',
        background: 'var(--canvas-bg)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Video feed */}
      <video
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transform: mirrorVideo ? 'scaleX(-1)' : 'none',
        }}
        playsInline
        muted
      />

      {/* MediaPipe 21-Landmark skeleton overlay */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          transform: mirrorVideo ? 'scaleX(-1)' : 'none',
        }}
      />

      {/* Audio waveform oscilloscope */}
      <canvas
        ref={waveCanvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      {/* Circular dial overlay (active in circular-keyboard mode) */}
      {inputMode === 'circular-keyboard' && !isLoading && !error && (
        <CircularDialOverlay
          activeNote={activeNote}
          detectedHands={detectedHands}
          mirrorVideo={mirrorVideo}
          instrumentId={instrumentId}
        />
      )}

      {/* Loading state */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(14, 14, 17, 0.94)',
            zIndex: 20,
            gap: '12px',
          }}
        >
          <div style={{ position: 'relative', width: '38px', height: '38px' }}>
            <div
              className="animate-spin-slow"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.12)',
                borderTopColor: 'rgba(255,255,255,0.7)',
              }}
            />
            <Camera
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
                width: '15px',
                height: '15px',
                color: 'rgba(255,255,255,0.5)',
              }}
            />
          </div>
          <span style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.01em' }}>
            Connecting camera & MediaPipe tracker…
          </span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'rgba(14, 14, 17, 0.96)',
            zIndex: 20,
            textAlign: 'center',
            gap: '12px',
          }}
        >
          <AlertTriangle style={{ width: '22px', height: '22px', color: 'var(--apple-amber)' }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>
            Camera Inaccessible
          </span>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', maxWidth: '320px', margin: 0, lineHeight: 1.5 }}>
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mac-btn"
              style={{
                marginTop: '4px',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: '#ffffff',
              }}
            >
              <RefreshCw style={{ width: '13px', height: '13px' }} />
              Retry Connection
            </button>
          )}
        </div>
      )}

      {/* Subtle overlays during tracking */}
      {!isLoading && !error && (
        <>
          {/* Top-left: Hand detection count */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(0, 0, 0, 0.52)',
              backdropFilter: 'blur(10px)',
              pointerEvents: 'none',
              zIndex: 20,
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: detectedHands.length > 0 ? 'var(--apple-green)' : 'var(--apple-amber)',
                boxShadow: detectedHands.length > 0 ? '0 0 6px var(--apple-green-glow)' : 'none',
                display: 'inline-block',
                flexShrink: 0,
              }}
              className={detectedHands.length === 0 ? 'animate-blink' : ''}
            />
            <span style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>
              {detectedHands.length > 0
                ? `${detectedHands.length} hand${detectedHands.length > 1 ? 's' : ''} tracked`
                : 'Scanning for hands…'}
            </span>
          </div>

          {/* Top-right: L / R hand indicators */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              display: 'flex',
              gap: '5px',
              pointerEvents: 'none',
              zIndex: 20,
            }}
          >
            {(['Left', 'Right'] as const).map((side) => {
              const active = side === 'Left' ? leftHandDetected : rightHandDetected;
              return (
                <div
                  key={side}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    background: active ? 'rgba(52, 199, 89, 0.25)' : 'rgba(0, 0, 0, 0.45)',
                    border: `1px solid ${active ? 'rgba(52, 199, 89, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <HandIcon
                    style={{
                      width: '10px',
                      height: '10px',
                      color: active ? 'rgba(52, 199, 89, 0.95)' : 'rgba(255, 255, 255, 0.35)',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      color: active ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.35)',
                    }}
                  >
                    {side}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bottom center: Active sounding chord overlay */}
          {chordResult && chordResult.type !== 'none' && (
            <div
              className="animate-fade-up"
              style={{
                position: 'absolute',
                bottom: '22px',
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
                pointerEvents: 'none',
                zIndex: 20,
              }}
            >
              <div
                style={{
                  padding: '7px 22px 9px',
                  borderRadius: '12px',
                  background: 'rgba(0, 0, 0, 0.62)',
                  backdropFilter: 'blur(14px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
                }}
              >
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#ffffff',
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {chordResult.symbol || chordResult.chordName}
                </div>
                {chordResult.quality && (
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginTop: '2px', fontWeight: 500 }}>
                    {chordResult.quality}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
