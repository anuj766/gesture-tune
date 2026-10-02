'use client';

import { useState } from 'react';
import { useHandTracking } from '@/hooks/useHandTracking';
import { CameraFeed } from '@/components/CameraFeed';
import { NoteDisplay } from '@/components/NoteDisplay';
import { MappingLegend } from '@/components/MappingLegend';
import { SettingsPanel } from '@/components/SettingsPanel';
import { AudioControl } from '@/components/AudioControl';
import { CircularDialHUD } from '@/components/CircularDialHUD';
import { SitarBackground } from '@/components/SitarBackground';
import { ViolinBackground } from '@/components/ViolinBackground';
import { getThemeConfig } from '@/lib/theme';
import { Music2 } from 'lucide-react';

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
  const isCircular = settings.inputMode === 'circular-keyboard';

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-3 sm:p-5 lg:p-7"
      style={{
        background: 'var(--app-backdrop)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Background instrument layers (subtle, non-interfering) */}
      <SitarBackground active={isSitar} activeNotesCount={activeNotes.length} />
      <ViolinBackground active={isViolin} />

      {/* ── Native macOS Creative Studio Window Shell (Inspired by Ref Image 2) ── */}
      <div className="macos-window w-full max-w-[1600px] flex flex-col">

        {/* ── 1. macOS Window Header & Toolbar (56px) ── */}
        <header
          style={{
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            borderBottom: '1px solid var(--separator)',
            background: 'var(--window-bg)',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          {/* Left: Window Chrome & App Identity */}
          <div className="flex items-center gap-4 select-none">
            {/* macOS Traffic Lights */}
            <div className="flex items-center gap-2">
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'var(--traffic-close)',
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'var(--traffic-minimize)',
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'var(--traffic-maximize)',
                  display: 'inline-block',
                }}
              />
            </div>

            <div style={{ width: '1px', height: '18px', background: 'var(--separator)' }} />

            {/* App Brand & Instrument Badge */}
            <div className="flex items-center gap-2.5">
              <Music2 style={{ width: '16px', height: '16px', color: 'var(--text-primary)' }} />
              <span
                style={{
                  fontSize: '14.5px',
                  fontWeight: 600,
                  letterSpacing: '-0.015em',
                  color: 'var(--text-primary)',
                }}
              >
                Chordture
              </span>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  background: 'var(--surface-inset)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
              >
                {theme.name}
              </span>
            </div>
          </div>

          {/* Right: Toolbar Controls */}
          <AudioControl
            settings={settings}
            mappingConfig={mappingConfig}
            onUpdateSettings={updateSettings}
            onUpdateMapping={updateMappingConfig}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </header>

        {/* ── 2. MAIN APPLICATION WORKSPACE (Camera ~75% + Inspector ~25%) ── */}
        <main
          className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_350px]"
          style={{ minHeight: '580px' }}
        >
          {/* Left: Studio Camera Workspace Canvas */}
          <div
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background: '#f8f8fa',
            }}
          >
            <div
              className="w-full aspect-[4/3] sm:aspect-video"
              style={{
                maxHeight: 'calc(100vh - 240px)',
                minHeight: '360px',
              }}
            >
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
            </div>
          </div>

          {/* Right: Integrated Studio Inspector Sidebar (Inspired by Ref Image 2) */}
          <aside
            style={{
              width: '100%',
              padding: '22px 20px',
              borderLeft: '1px solid var(--separator)',
              background: 'var(--sidebar-bg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '22px',
            }}
          >
            {/* Active Notes */}
            <NoteDisplay
              activeNotes={activeNotes}
              instrumentId={settings.instrumentId}
            />

            <div style={{ height: '1px', background: 'var(--separator-subtle)' }} />

            {/* Finger Mapping / Chords / Dial Guide */}
            <MappingLegend
              mappingConfig={mappingConfig}
              detectedHands={detectedHands}
              inputMode={settings.inputMode}
              activeGestureId={activeGestureId}
              capoFret={settings.capoFret}
              instrumentId={settings.instrumentId}
            />

            {/* Circular Dial HUD in sidebar if in circular-keyboard mode */}
            {isCircular && (
              <>
                <div style={{ height: '1px', background: 'var(--separator-subtle)' }} />
                <CircularDialHUD
                  activeNote={activeNotes[0]?.note}
                  detectedHands={detectedHands}
                  mirrorVideo={settings.mirrorVideo}
                  instrumentId={settings.instrumentId}
                />
              </>
            )}
          </aside>
        </main>

        {/* ── 3. Integrated macOS Status Bar (34px) ── */}
        <footer
          style={{
            height: '34px',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            borderTop: '1px solid var(--separator)',
            background: 'var(--window-bg)',
          }}
        >
          {/* Tracking state */}
          <div className="flex items-center gap-2">
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
            <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
              {detectedHands.length > 0
                ? `Tracking Active (${detectedHands.length} hand${detectedHands.length > 1 ? 's' : ''})`
                : 'Tracking Ready (Scanning)'}
            </span>
            <span style={{ color: 'var(--separator)' }}>•</span>
            <span>MediaPipe Vision WASM</span>
          </div>

          {/* Performance & input metrics */}
          <div className="flex items-center gap-3">
            <span>21 Landmarks / hand</span>
            <span style={{ color: 'var(--separator)' }}>•</span>
            <span>~60 fps</span>
          </div>
        </footer>
      </div>

      {/* Settings Modal Sheet */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        mappingConfig={mappingConfig}
        settings={settings}
        availableDevices={availableDevices}
        onUpdateMapping={updateMappingConfig}
        onUpdateSettings={updateSettings}
      />
    </div>
  );
}
