'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, X, RefreshCw, Camera, Sliders, Volume2, ArrowLeftRight } from 'lucide-react';
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
  { finger: 'thumb', label: 'Thumb' },
  { finger: 'index', label: 'Index' },
  { finger: 'middle', label: 'Middle' },
  { finger: 'ring', label: 'Ring' },
  { finger: 'pinky', label: 'Pinky' },
];

export function SettingsPanel({
  isOpen,
  onClose,
  mappingConfig,
  settings,
  availableDevices,
  onUpdateMapping,
  onUpdateSettings,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'mapping' | 'camera' | 'audio'>('mapping');

  if (!isOpen) return null;

  const handleNoteChange = (hand: 'Left' | 'Right', finger: Finger, newNote: string) => {
    const updated = {
      ...mappingConfig,
      [hand]: {
        ...mappingConfig[hand],
        [finger]: newNote,
      },
    };
    onUpdateMapping(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900/90 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.2)] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <SettingsIcon className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold font-mono text-cyan-100 tracking-wide">
              HUD System Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('mapping')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeTab === 'mapping'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Note Remapping
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeTab === 'camera'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Camera & Handedness
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeTab === 'audio'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" /> Piano Audio
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300 font-sans">
          {/* Note Remapping Tab */}
          {activeTab === 'mapping' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400 font-mono">
                  Map each extended finger on your left and right hand to a pitch.
                </p>
                <button
                  onClick={() => onUpdateMapping(DEFAULT_NOTE_MAPPING)}
                  className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-lg border border-cyan-500/30 transition-all cursor-pointer font-mono"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset Default
                </button>
              </div>

              {/* Left Hand Remap */}
              <div className="rounded-xl p-4 bg-slate-950/40 border border-cyan-500/20 space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase text-cyan-300">
                  Left Hand Finger Mapping
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {FINGERS_LIST.map(({ finger, label }) => (
                    <div key={`left-remap-${finger}`} className="flex flex-col gap-1">
                      <label className="text-[11px] font-mono text-slate-400">{label}</label>
                      <select
                        value={mappingConfig.Left[finger]}
                        onChange={(e) => handleNoteChange('Left', finger, e.target.value)}
                        className="bg-slate-900 border border-cyan-500/30 text-cyan-200 font-mono text-xs rounded-lg p-2 focus:outline-none focus:border-cyan-400"
                      >
                        {AVAILABLE_NOTES.map((n) => (
                          <option key={`left-${finger}-${n}`} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Hand Remap */}
              <div className="rounded-xl p-4 bg-slate-950/40 border border-pink-500/20 space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase text-pink-300">
                  Right Hand Finger Mapping
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {FINGERS_LIST.map(({ finger, label }) => (
                    <div key={`right-remap-${finger}`} className="flex flex-col gap-1">
                      <label className="text-[11px] font-mono text-slate-400">{label}</label>
                      <select
                        value={mappingConfig.Right[finger]}
                        onChange={(e) => handleNoteChange('Right', finger, e.target.value)}
                        className="bg-slate-900 border border-pink-500/30 text-pink-200 font-mono text-xs rounded-lg p-2 focus:outline-none focus:border-pink-400"
                      >
                        {AVAILABLE_NOTES.map((n) => (
                          <option key={`right-${finger}-${n}`} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Camera & Handedness Tab */}
          {activeTab === 'camera' && (
            <div className="space-y-5">
              {/* Swap Handedness Highlight */}
              <label className="flex items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 cursor-pointer">
                <div>
                  <p className="text-xs font-mono font-bold text-amber-300 flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4" /> Swap Left & Right Hand Assignments
                  </p>
                  <p className="text-[11px] text-amber-200/70 mt-0.5">
                    Enable this if your front/rear camera reverses your left and right hands.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.swapHandedness}
                  onChange={(e) => onUpdateSettings({ swapHandedness: e.target.checked })}
                  className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
                />
              </label>

              {/* Device Select */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-mono text-cyan-300 uppercase">
                  Camera Input Device
                </label>
                <select
                  value={settings.cameraDeviceId}
                  onChange={(e) => onUpdateSettings({ cameraDeviceId: e.target.value })}
                  className="bg-slate-950 border border-cyan-500/30 text-slate-200 font-mono text-xs rounded-xl p-3 focus:outline-none focus:border-cyan-400"
                >
                  <option value="">Default System Camera</option>
                  {availableDevices.map((dev) => (
                    <option key={dev.deviceId} value={dev.deviceId}>
                      {dev.label || `Camera ${dev.deviceId.slice(0, 8)}...`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 cursor-pointer">
                  <span className="text-xs font-mono text-slate-200">Mirror Camera View</span>
                  <input
                    type="checkbox"
                    checked={settings.mirrorVideo}
                    onChange={(e) => onUpdateSettings({ mirrorVideo: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 cursor-pointer">
                  <span className="text-xs font-mono text-slate-200">Show Neon Skeleton Overlay</span>
                  <input
                    type="checkbox"
                    checked={settings.showSkeleton}
                    onChange={(e) => onUpdateSettings({ showSkeleton: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 cursor-pointer">
                  <span className="text-xs font-mono text-slate-200">Show Joint Landmark Dots</span>
                  <input
                    type="checkbox"
                    checked={settings.showLandmarkDots}
                    onChange={(e) => onUpdateSettings({ showLandmarkDots: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Hysteresis Delay */}
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-cyan-300">
                    Chord Hysteresis Threshold
                  </label>
                  <span className="text-xs font-mono text-slate-400">
                    {settings.hysteresisMs} ms
                  </span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={400}
                  step={10}
                  value={settings.hysteresisMs}
                  onChange={(e) => onUpdateSettings({ hysteresisMs: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 font-mono">
                  Controls gesture hold duration before switching displayed chord name to eliminate flicker.
                </p>
              </div>
            </div>
          )}

          {/* Piano Audio Tab */}
          {activeTab === 'audio' && (
            <div className="space-y-5">
              <label className="flex items-center justify-between p-4 rounded-xl bg-slate-950/40 border border-cyan-500/30 cursor-pointer">
                <div>
                  <p className="text-xs font-mono font-bold text-cyan-200">Enable Acoustic Piano Sound</p>
                  <p className="text-[11px] text-slate-400">
                    Play real acoustic piano sound on active gestures
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                  className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
                />
              </label>

              {/* Volume */}
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-slate-300">Piano Master Volume</label>
                  <span className="text-xs font-mono text-slate-400">
                    {Math.round(settings.synthVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.synthVolume}
                  onChange={(e) => onUpdateSettings({ synthVolume: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer shadow-[0_0_15px_rgba(0,243,255,0.2)]"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
