'use client';

import { useState } from 'react';
import { useHandTracking } from '@/hooks/useHandTracking';
import { CameraFeed } from '@/components/CameraFeed';
import { ChordDisplay } from '@/components/ChordDisplay';
import { NoteDisplay } from '@/components/NoteDisplay';
import { MappingLegend } from '@/components/MappingLegend';
import { SettingsPanel } from '@/components/SettingsPanel';
import { BackgroundEffect } from '@/components/BackgroundEffect';
import { AudioControl } from '@/components/AudioControl';
import { Music2, Sparkles, Activity } from 'lucide-react';

import { CircularDialHUD } from '@/components/CircularDialHUD';

import { SitarBackground } from '@/components/SitarBackground';
import { ViolinBackground } from '@/components/ViolinBackground';
import { getThemeConfig } from '@/lib/theme';

export default function Home() {
  const {
    videoRef,
    canvasRef,
    isLoading,
    error,
    activeNotes,
    chordResult,
    activeGestureId,
    detectedHands,
    availableDevices,
    mappingConfig,
    settings,
    updateMappingConfig,
    updateSettings,
    refreshDevices,
  } = useHandTracking();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const theme = getThemeConfig(settings.instrumentId);
  const isSitar = settings.instrumentId === 'sitar';
  const isViolin = settings.instrumentId === 'violin';

  return (
    <main className={`relative min-h-screen text-slate-100 font-sans transition-colors duration-700 ease-in-out ${theme.bgColor} overflow-x-hidden selection:bg-amber-500 selection:text-black pb-12`}>
      {/* Background Particle & Mesh Animation */}
      <BackgroundEffect />

      {/* Sitar Classical Ambient & 3D Model Layer */}
      <SitarBackground active={isSitar} activeNotesCount={activeNotes.length} />

      {/* Western Classical Violin Symphony & Sheet Music Layer */}
      <ViolinBackground active={isViolin} />

      {/* Main HUD Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Header HUD Navigation */}
        <header className={`relative z-50 flex flex-col lg:flex-row items-center justify-between gap-4 p-5 rounded-2xl transition-all duration-700 ease-in-out backdrop-blur-xl ${theme.headerBg} border ${theme.headerBorder} ${theme.headerGlow}`}>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-700 ${
              isSitar
                ? 'bg-gradient-to-tr from-amber-600 via-rose-700 to-yellow-500 shadow-[0_0_20px_rgba(212,175,55,0.5)]'
                : 'bg-gradient-to-tr from-cyan-500 via-violet-600 to-pink-500 shadow-[0_0_20px_rgba(0,243,255,0.4)]'
            }`}>
              <Music2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-xl sm:text-2xl font-black font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r ${
                  isSitar
                    ? 'from-amber-200 via-amber-400 to-amber-100'
                    : 'from-cyan-300 via-violet-200 to-pink-300'
                }`}>
                  CHORDTURE
                </h1>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                  isSitar
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                }`}>
                  {isSitar ? '🪕 SITAR MODE' : 'v1.4 MULTI-MODE'}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono flex items-center gap-1.5 mt-0.5 opacity-90">
                <Sparkles className={`w-3 h-3 ${isSitar ? 'text-amber-400' : 'text-cyan-400'}`} />
                {isSitar ? 'Indian Classical Sitar Aesthetics & Polyphonic Sound Engine' : 'Real-Time Hand Gesture & Multi-Input Chord Music System'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <AudioControl
              settings={settings}
              mappingConfig={mappingConfig}
              onUpdateSettings={updateSettings}
              onUpdateMapping={updateMappingConfig}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </div>
        </header>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left/Full Column: Camera Feed & In-Video Overlays */}
          <div className={settings.inputMode === 'circular-keyboard' ? 'lg:col-span-12 space-y-4' : 'lg:col-span-8 space-y-4'}>
            <CameraFeed
              videoRef={videoRef}
              canvasRef={canvasRef}
              isLoading={isLoading}
              error={error}
              mirrorVideo={settings.mirrorVideo}
              detectedHands={detectedHands}
              chordResult={chordResult}
              instrumentId={settings.instrumentId}
              inputMode={settings.inputMode}
              activeNote={activeNotes[0]?.note}
              onRetry={refreshDevices}
            />

            {/* Quick Status / FPS Indicator Card */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 backdrop-blur-md text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>MediaPipe Tasks Vision WASM • 21 Landmarks</span>
              </div>
              <span className="text-cyan-400">FPS: ~60 (Native RAF)</span>
            </div>
          </div>

          {/* Right Column: Sidebar (Hidden in Circular Dial Mode for full-width performance view) */}
          {settings.inputMode !== 'circular-keyboard' && (
            <div className="lg:col-span-4 space-y-4">
              {/* Active Notes Matrix */}
              <NoteDisplay activeNotes={activeNotes} instrumentId={settings.instrumentId} />

              {/* Gesture Reference Legend */}
              <MappingLegend
                mappingConfig={mappingConfig}
                detectedHands={detectedHands}
                inputMode={settings.inputMode}
                activeGestureId={activeGestureId}
                capoFret={settings.capoFret}
                instrumentId={settings.instrumentId}
              />
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        mappingConfig={mappingConfig}
        settings={settings}
        availableDevices={availableDevices}
        onUpdateMapping={updateMappingConfig}
        onUpdateSettings={updateSettings}
      />
    </main>
  );
}
