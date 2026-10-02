'use client';

import { useState } from 'react';
import { X, RefreshCw, Camera, Sliders, Volume2 } from 'lucide-react';
import { NoteMappingConfig, AppSettings, Finger } from '@/types';
import { DEFAULT_NOTE_MAPPING } from '@/lib/noteMapping';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mappingConfig: NoteMappingConfig;
  settings: AppSettings;
  availableDevices: MediaDeviceInfo[];
  onUpdateMapping: (config: NoteMappingConfig) => void;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

const AVAILABLE_NOTES = [
  'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
  'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
  'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'G5', 'A5', 'B5',
];

const FINGERS_LIST: { finger: Finger; label: string }[] = [
  { finger: 'thumb',  label: 'Thumb' },
  { finger: 'index',  label: 'Index' },
  { finger: 'middle', label: 'Mid'   },
  { finger: 'ring',   label: 'Ring'  },
  { finger: 'pinky',  label: 'Pinky' },
];

type Tab = 'mapping' | 'camera' | 'audio';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'mapping', label: 'Note Mapping', icon: <Sliders style={{ width: '13px', height: '13px' }} /> },
  { id: 'camera',  label: 'Camera',       icon: <Camera  style={{ width: '13px', height: '13px' }} /> },
  { id: 'audio',   label: 'Audio',        icon: <Volume2 style={{ width: '13px', height: '13px' }} /> },
];

function ToggleRow({
  label,
  sublabel,
  checked,
  onChange,
}: {
  label: string;
  sublabel?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '11px 14px',
        borderRadius: '10px',
        background: 'var(--surface-inset)',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
        {sublabel && (
          <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{sublabel}</div>
        )}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: '16px', height: '16px', accentColor: 'var(--apple-green)', cursor: 'pointer' }}
      />
    </label>
  );
}

function SliderRow({
  label,
  value,
  displayValue,
  min,
  max,
  step,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '11px 14px',
        borderRadius: '10px',
        background: 'var(--surface-inset)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--apple-green)', cursor: 'pointer' }}
      />
      {hint && (
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{hint}</span>
      )}
    </div>
  );
}

export function SettingsPanel({
  isOpen,
  onClose,
  mappingConfig,
  settings,
  availableDevices,
  onUpdateMapping,
  onUpdateSettings,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('mapping');

  if (!isOpen) return null;

  const handleNoteChange = (hand: 'Left' | 'Right', finger: Finger, newNote: string) => {
    onUpdateMapping({
      ...mappingConfig,
      [hand]: { ...mappingConfig[hand], [finger]: newNote },
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(0, 0, 0, 0.32)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '86vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          borderRadius: '18px',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.18), 0 4px 16px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--separator-subtle)',
          }}
        >
          <span style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Settings
          </span>
          <button
            onClick={onClose}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--surface-inset)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'background 0.1s ease',
            }}
            title="Close Settings"
          >
            <X style={{ width: '13px', height: '13px' }} />
          </button>
        </div>

        {/* macOS Native Segmented Control */}
        <div
          style={{
            padding: '10px 20px',
            borderBottom: '1px solid var(--separator-subtle)',
            background: '#fafafc',
          }}
        >
          <div
            style={{
              display: 'flex',
              background: 'var(--surface-inset)',
              padding: '3px',
              borderRadius: '9px',
              gap: '2px',
            }}
          >
            {TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    height: '28px',
                    fontSize: '12.5px',
                    fontWeight: isSelected ? 600 : 450,
                    borderRadius: '7px',
                    border: 'none',
                    background: isSelected ? '#ffffff' : 'transparent',
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    boxShadow: isSelected ? '0 1px 4px rgba(0, 0, 0, 0.08)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Note Mapping Tab */}
          {activeTab === 'mapping' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  Assign musical pitches to extended finger positions.
                </span>
                <button
                  onClick={() => onUpdateMapping(DEFAULT_NOTE_MAPPING)}
                  className="mac-btn"
                  title="Reset to C Major defaults"
                >
                  <RefreshCw style={{ width: '11px', height: '11px' }} />
                  Reset
                </button>
              </div>

              {(['Left', 'Right'] as const).map((side) => (
                <div
                  key={side}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'var(--surface-inset)',
                  }}
                >
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {side} Hand
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                    {FINGERS_LIST.map(({ finger, label }) => (
                      <div key={`${side}-${finger}`} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>{label}</span>
                        <select
                          value={mappingConfig[side][finger]}
                          onChange={(e) => handleNoteChange(side, finger, e.target.value)}
                          className="mac-select"
                          style={{ width: '100%', fontSize: '12px', height: '28px', padding: '0 18px 0 6px' }}
                        >
                          {AVAILABLE_NOTES.map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Camera Settings Tab */}
          {activeTab === 'camera' && (
            <>
              <ToggleRow
                label="Swap Left & Right Hands"
                sublabel="Enable if your camera feed orientation is inverted."
                checked={settings.swapHandedness}
                onChange={(v) => onUpdateSettings({ swapHandedness: v })}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span className="mac-section-title">Camera Device</span>
                <select
                  value={settings.cameraDeviceId}
                  onChange={(e) => onUpdateSettings({ cameraDeviceId: e.target.value })}
                  className="mac-select"
                  style={{ width: '100%' }}
                >
                  <option value="">Default Camera</option>
                  {availableDevices.map((dev) => (
                    <option key={dev.deviceId} value={dev.deviceId}>
                      {dev.label || `Camera ${dev.deviceId.slice(0, 8)}…`}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                <ToggleRow
                  label="Mirror Video"
                  checked={settings.mirrorVideo}
                  onChange={(v) => onUpdateSettings({ mirrorVideo: v })}
                />
                <ToggleRow
                  label="Hand Skeleton"
                  checked={settings.showSkeleton}
                  onChange={(v) => onUpdateSettings({ showSkeleton: v })}
                />
                <ToggleRow
                  label="Landmark Points"
                  checked={settings.showLandmarkDots}
                  onChange={(v) => onUpdateSettings({ showLandmarkDots: v })}
                />
              </div>

              <SliderRow
                label="Chord Hysteresis"
                value={settings.hysteresisMs}
                displayValue={`${settings.hysteresisMs} ms`}
                min={100}
                max={400}
                step={10}
                onChange={(v) => onUpdateSettings({ hysteresisMs: v })}
                hint="Hold time before chord changes are committed to prevent false triggers during transitions."
              />
            </>
          )}

          {/* Audio Settings Tab */}
          {activeTab === 'audio' && (
            <>
              <ToggleRow
                label="Audio Engine"
                sublabel="Play synthesized audio on detected notes and chords."
                checked={settings.soundEnabled}
                onChange={(v) => onUpdateSettings({ soundEnabled: v })}
              />
              <SliderRow
                label="Master Volume"
                value={settings.synthVolume}
                displayValue={`${Math.round(settings.synthVolume * 100)}%`}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => onUpdateSettings({ synthVolume: v })}
              />
            </>
          )}
        </div>

        {/* Footer with Reference Image 1 inspired pill button */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '14px 20px',
            borderTop: '1px solid var(--separator-subtle)',
            background: '#fafafc',
          }}
        >
          <button
            onClick={onClose}
            className="mac-primary-pill"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
