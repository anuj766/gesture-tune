'use client';

import { NoteMappingConfig, HandDetectionData, Finger, InputModeId } from '@/types';
import { GESTURE_DEFINITIONS } from '@/lib/inputModes/gestureMode';
import { getThemeConfig } from '@/lib/theme';

interface MappingLegendProps {
  mappingConfig: NoteMappingConfig;
  detectedHands: HandDetectionData[];
  inputMode?: InputModeId;
  activeGestureId?: string;
  capoFret?: number;
  instrumentId?: string;
}

const FINGERS_ORDER: { finger: Finger; label: string }[] = [
  { finger: 'thumb',  label: 'Thumb' },
  { finger: 'index',  label: 'Index' },
  { finger: 'middle', label: 'Mid'   },
  { finger: 'ring',   label: 'Ring'  },
  { finger: 'pinky',  label: 'Pinky' },
];

export function MappingLegend({
  mappingConfig,
  detectedHands,
  inputMode = 'finger-mapping',
  activeGestureId,
  capoFret = 0,
  instrumentId,
}: MappingLegendProps) {
  const leftHandData  = detectedHands.find((h) => h.hand === 'Left');
  const rightHandData = detectedHands.find((h) => h.hand === 'Right');
  const theme = getThemeConfig(instrumentId);

  /* ── Circular Keyboard mode ── */
  if (inputMode === 'circular-keyboard') {
    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="mac-section-title">Circular Dial Guide</span>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>12 Chromatic Sectors</span>
        </div>
        <div style={{ padding: '12px 14px', background: 'var(--surface-inset)', borderRadius: '10px' }}>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Rotate your index fingertip around the 360° circular dial to trigger musical pitches across chromatic sector boundaries.
          </p>
        </div>
      </div>
    );
  }

  /* ── Gesture mode (9 chords) ── */
  if (inputMode === 'gesture-mode') {
    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="mac-section-title">{theme.name} Chords</span>
          {capoFret > 0 && (
            <span style={{ fontSize: '11px', color: 'var(--apple-green)', fontWeight: 600 }}>
              Capo {capoFret}
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {GESTURE_DEFINITIONS.map((item) => {
            const isActive = activeGestureId === item.id;
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '9px 10px',
                  borderRadius: '10px',
                  background: isActive ? '#ffffff' : 'var(--surface-inset)',
                  border: isActive ? '1px solid rgba(52, 199, 89, 0.3)' : '1px solid transparent',
                  boxShadow: isActive ? '0 6px 16px rgba(52, 199, 89, 0.16)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '14px' }}>{item.icon}</span>
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: isActive ? 'var(--apple-green)' : 'var(--text-primary)',
                    }}
                  >
                    {item.symbol}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: isActive ? 'var(--apple-green)' : 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.chordName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Finger mapping mode (default) ── */
  return (
    <div className="flex flex-col gap-3.5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <span className="mac-section-title">Finger Mapping</span>
        <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', fontWeight: 400 }}>
          C Major · C4–E5
        </span>
      </div>

      {/* Hand Mapping Groups */}
      <div className="flex flex-col gap-3">
        {(['Left', 'Right'] as const).map((side) => {
          const handData = side === 'Left' ? leftHandData : rightHandData;
          const noteMap  = side === 'Left' ? mappingConfig.Left : mappingConfig.Right;
          const isTracked = !!handData;

          return (
            <div
              key={side}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '11px 12px',
                borderRadius: '12px',
                background: 'rgba(0, 0, 0, 0.02)',
              }}
            >
              {/* Hand Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: isTracked ? 'var(--apple-green)' : 'var(--text-quaternary)',
                      boxShadow: isTracked ? '0 0 6px var(--apple-green-glow)' : 'none',
                    }}
                  />
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {side} Hand
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  {side === 'Left' ? 'C4 – G4' : 'A4 – E5'}
                </span>
              </div>

              {/* 5 Vertical Capsule Slots (Inspired by Reference Image 1 Streak Slots) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                {FINGERS_ORDER.map(({ finger, label }) => {
                  const note       = noteMap[finger];
                  const isExtended = handData?.fingers[finger] ?? false;

                  return (
                    <div
                      key={`${side}-${finger}`}
                      className={`finger-slot-capsule ${isExtended ? 'active' : ''}`}
                    >
                      {/* Top Status Circle */}
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: isExtended ? 'var(--apple-green)' : 'rgba(0, 0, 0, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isExtended ? '0 2px 8px var(--apple-green-glow)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isExtended && (
                          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ffffff' }} />
                        )}
                      </div>

                      {/* Middle Note Pitch */}
                      <span
                        style={{
                          fontSize: '13.5px',
                          fontWeight: 600,
                          color: isExtended ? 'var(--text-primary)' : 'var(--text-secondary)',
                          lineHeight: 1.2,
                          marginTop: '4px',
                        }}
                      >
                        {note}
                      </span>

                      {/* Bottom Finger Name */}
                      <span
                        style={{
                          fontSize: '9.5px',
                          fontWeight: 500,
                          color: isExtended ? 'var(--apple-green)' : 'var(--text-tertiary)',
                          marginTop: '3px',
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
