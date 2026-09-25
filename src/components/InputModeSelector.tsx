'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Sliders, Hand, Disc, Music, Sparkles, Lock } from 'lucide-react';
import { InputModeId } from '@/types';
import { INPUT_MODES } from '@/lib/inputModes/registry';

interface InputModeSelectorProps {
  currentMode: InputModeId;
  onSelectMode: (modeId: InputModeId) => void;
}

export function InputModeSelector({ currentMode, onSelectMode }: InputModeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number; width: number }>({
    top: 0,
    right: 0,
    width: 320,
  });
  const [mounted, setMounted] = useState(false);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const activeModeDef = INPUT_MODES.find((m) => m.id === currentMode) || INPUT_MODES[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const right = window.innerWidth - rect.right;
      setMenuPos({
        top: rect.bottom + 8,
        right: Math.max(8, right),
        width: Math.min(340, window.innerWidth - 16),
      });
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    function handleScrollOrResize() {
      if (isOpen) {
        updatePosition();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Hand':
        return <Hand className="w-4 h-4 text-cyan-400" />;
      case 'Sliders':
        return <Sliders className="w-4 h-4 text-cyan-400" />;
      case 'Disc':
        return <Disc className="w-4 h-4 text-pink-400" />;
      case 'Music':
        return <Music className="w-4 h-4 text-violet-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="relative inline-block text-left">
      {/* Dropdown Toggle Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-900/90 text-cyan-200 border border-cyan-500/50 hover:border-cyan-400 hover:bg-slate-900 transition-all cursor-pointer shadow-[0_0_20px_rgba(0,243,255,0.25)]"
      >
        <span className="text-slate-400 font-normal">Input Mode:</span>
        <span className="flex items-center gap-1.5 font-black text-cyan-300">
          {getIcon(activeModeDef.iconName)}
          {activeModeDef.name}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-cyan-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menu Options - Rendered via React Portal directly into body for 100% Foreground Priority */}
      {isOpen &&
        mounted &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              top: `${menuPos.top}px`,
              right: `${menuPos.right}px`,
              width: `${menuPos.width}px`,
            }}
            className="fixed rounded-2xl bg-slate-950/98 border border-cyan-500/50 backdrop-blur-3xl shadow-[0_25px_70px_rgba(0,0,0,0.98)] z-[9999] overflow-hidden divide-y divide-slate-800/80 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-slate-900/90 flex items-center justify-between border-b border-cyan-500/20">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-300">
                Select Interaction Mode
              </span>
              <span className="text-[9px] font-mono text-cyan-400/80">3 Active Modes</span>
            </div>

            {/* Active / Selectable Modes */}
            <div className="p-2 space-y-1 max-h-[75vh] overflow-y-auto">
              {INPUT_MODES.map((mode) => {
                const isSelected = mode.id === currentMode;
                const isDisabled = !mode.isAvailable;

                return (
                  <button
                    key={mode.id}
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) {
                        onSelectMode(mode.id);
                        setIsOpen(false);
                      }
                    }}
                    className={`w-full flex items-start justify-between p-3 rounded-xl transition-all font-mono text-left ${
                      isDisabled
                        ? 'opacity-40 cursor-not-allowed hover:bg-transparent'
                        : isSelected
                        ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-400/60 shadow-[0_0_20px_rgba(0,243,255,0.25)] cursor-pointer'
                        : 'hover:bg-slate-900 text-slate-300 hover:text-white cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                        {getIcon(mode.iconName)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold">{mode.name}</span>
                          {mode.badge && (
                            <span
                              className={`px-1.5 py-0.3 rounded text-[9px] font-mono border font-bold ${
                                mode.badge === 'DEFAULT'
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                  : mode.badge === 'NEW'
                                  ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                                  : mode.badge === '9 CHORDS'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              {mode.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans leading-snug mt-1">
                          {mode.description}
                        </p>
                      </div>
                    </div>

                    <div className="ml-2 mt-0.5 flex-shrink-0">
                      {isSelected ? (
                        <Check className="w-4 h-4 text-cyan-400" />
                      ) : isDisabled ? (
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
