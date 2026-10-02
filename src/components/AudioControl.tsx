'use client';

import { Volume2, VolumeX, Sliders, ArrowLeftRight } from 'lucide-react';
import { AppSettings, NoteMappingConfig } from '@/types';
import { audioSynth } from '@/lib/audioSynth';
import { PRESET_MAPPINGS } from '@/lib/noteMapping';

import { InputModeSelector } from '@/components/InputModeSelector';
import { INSTRUMENTS } from '@/lib/instruments/registry';

interface AudioControlProps {
  settings: AppSettings;
  mappingConfig: NoteMappingConfig;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onUpdateMapping: (config: NoteMappingConfig) => void;
  onOpenSettings: () => void;
}

export function AudioControl({
  settings,
  mappingConfig,
  onUpdateSettings,
  onUpdateMapping,
  onOpenSettings,
}: AudioControlProps) {
  const handleToggleSound = () => {
    const nextState = !settings.soundEnabled;
    onUpdateSettings({ soundEnabled: nextState });
    if (nextState) {
      audioSynth.unlockAudio();
    }
  };

  const handlePresetSelect = (presetIndex: number) => {
    const selected = PRESET_MAPPINGS[presetIndex];
    if (selected) {
      onUpdateMapping(selected.mapping);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Input Mode Selector */}
      <InputModeSelector
        currentMode={settings.inputMode}
        onSelectMode={(modeId) => onUpdateSettings({ inputMode: modeId })}
      />

      {/* Instrument Select */}
      <select
        value={settings.instrumentId || 'piano'}
        onChange={(e) => onUpdateSettings({ instrumentId: e.target.value })}
        className="mac-select"
        title="Select Instrument"
      >
        {INSTRUMENTS.map((inst) => (
          <option key={inst.id} value={inst.id}>
            {inst.name}
          </option>
        ))}
      </select>

      {/* Tuning / Scale Preset — finger mapping mode */}
      {settings.inputMode === 'finger-mapping' && (
        <select
          onChange={(e) => handlePresetSelect(Number(e.target.value))}
          className="mac-select"
          title="Tuning Scale Preset"
          defaultValue={0}
        >
          {PRESET_MAPPINGS.map((p, idx) => (
            <option key={p.name} value={idx}>
              Scale: {p.name}
            </option>
          ))}
        </select>
      )}

      {/* Capo selector — gesture mode only */}
      {settings.inputMode === 'gesture-mode' && (
        <select
          value={settings.capoFret || 0}
          onChange={(e) => onUpdateSettings({ capoFret: Number(e.target.value) })}
          className="mac-select"
          title="Guitar Capo Fret Transposition"
        >
          <option value={0}>Capo: None</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((fret) => (
            <option key={`capo-${fret}`} value={fret}>
              Capo: Fret {fret}
            </option>
          ))}
        </select>
      )}

      {/* Swap Hands */}
      <button
        onClick={() => onUpdateSettings({ swapHandedness: !settings.swapHandedness })}
        className={`mac-btn ${settings.swapHandedness ? 'active' : ''}`}
        title="Swap Left and Right Hand Assignments"
      >
        <ArrowLeftRight style={{ width: '13px', height: '13px' }} />
        <span>{settings.swapHandedness ? 'Inverted' : 'Swap'}</span>
      </button>

      {/* Sound Toggle */}
      <button
        onClick={handleToggleSound}
        className={`mac-btn ${settings.soundEnabled ? 'active' : ''}`}
        title="Toggle Audio Engine"
      >
        {settings.soundEnabled ? (
          <>
            <Volume2 style={{ width: '13px', height: '13px', color: 'var(--apple-green)' }} />
            <span>Mute</span>
          </>
        ) : (
          <>
            <VolumeX style={{ width: '13px', height: '13px', color: 'var(--text-tertiary)' }} />
            <span>Unmute</span>
          </>
        )}
      </button>

      {/* Settings */}
      <button
        onClick={onOpenSettings}
        className="mac-btn"
        title="Open Audio & Camera Settings"
      >
        <Sliders style={{ width: '13px', height: '13px' }} />
        <span>Settings</span>
      </button>
    </div>
  );
}
