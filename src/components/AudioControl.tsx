'use client';

import { Volume2, VolumeX, Sliders, ArrowLeftRight, Sparkles } from 'lucide-react';
import { AppSettings, NoteMappingConfig } from '@/types';
import { audioSynth, PlayMode } from '@/lib/audioSynth';
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
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Input Mode Selector Dropdown */}
      <InputModeSelector
        currentMode={settings.inputMode}
        onSelectMode={(modeId) => onUpdateSettings({ inputMode: modeId })}
      />

      {/* Instrument Selection Dropdown (Piano vs Sitar) */}
      <div className="relative">
        <select
          value={settings.instrumentId || 'piano'}
          onChange={(e) => onUpdateSettings({ instrumentId: e.target.value })}
          className="bg-slate-900/90 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          title="Select Active Instrument Sound Library"
        >
          {INSTRUMENTS.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.icon} Instrument: {inst.name}
            </option>
          ))}
        </select>
      </div>

      {/* Guitar Capo Fret Selector (Exclusive to Gesture Mode) */}
      {settings.inputMode === 'gesture-mode' && (
        <div className="relative">
          <select
            value={settings.capoFret || 0}
            onChange={(e) => onUpdateSettings({ capoFret: Number(e.target.value) })}
            className="bg-slate-900/90 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-400 cursor-pointer shadow-[0_0_15px_rgba(52,211,153,0.2)]"
            title="Guitar Capo Fret Transposition"
          >
            <option value={0}>🎸 Capo: 0 (No Capo)</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((fret) => (
              <option key={`capo-${fret}`} value={fret}>
                🎸 Capo Fret: {fret} (+{fret} semitones)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Song / Scale Presets Quick Dropdown (Visible in Finger Mapping mode) */}
      {settings.inputMode === 'finger-mapping' && (
        <div className="relative">
          <select
            onChange={(e) => handlePresetSelect(Number(e.target.value))}
            className="bg-slate-900/90 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400 cursor-pointer shadow-[0_0_15px_rgba(0,243,255,0.15)]"
          >
            {PRESET_MAPPINGS.map((p, idx) => (
              <option key={p.name} value={idx}>
                🎵 Preset: {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Swap Left/Right Hands Quick Toggle */}
      <button
        onClick={() => onUpdateSettings({ swapHandedness: !settings.swapHandedness })}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
          settings.swapHandedness
            ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.25)]'
            : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:text-white'
        }`}
        title="Swap Left and Right Hand Assignments"
      >
        <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
        <span>{settings.swapHandedness ? 'Hands Swapped' : 'Swap Hands'}</span>
      </button>

      {/* Piano / Sound Toggle */}
      <button
        onClick={handleToggleSound}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
          settings.soundEnabled
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
            : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
        }`}
        title="Toggle Sound"
      >
        {settings.soundEnabled ? (
          <>
            <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Sound ON</span>
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4 text-slate-500" />
            <span>Sound Muted</span>
          </>
        )}
      </button>

      {/* Settings Button */}
      <button
        onClick={onOpenSettings}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,243,255,0.15)]"
        title="Open HUD Settings"
      >
        <Sliders className="w-4 h-4 text-cyan-400" />
        <span>Settings</span>
      </button>
    </div>
  );
}
