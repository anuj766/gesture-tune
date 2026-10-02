'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Sliders, Hand, Disc, Music, Lock } from 'lucide-react';
import { InputModeId } from '@/types';
import { INPUT_MODES } from '@/lib/inputModes/registry';

interface InputModeSelectorProps {
  currentMode: InputModeId;
  onSelectMode: (modeId: InputModeId) => void;
}

export function InputModeSelector({ currentMode, onSelectMode }: InputModeSelectorProps) {
  const [isOpen, setIsOpen]   = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number; width: number }>({ top: 0, right: 0, width: 280 });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef   = useRef<HTMLDivElement | null>(null);

  const activeModeDef = INPUT_MODES.find((m) => m.id === currentMode) || INPUT_MODES[0];

  useEffect(() => { setMounted(true); }, []);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect  = buttonRef.current.getBoundingClientRect();
      const right = window.innerWidth - rect.right;
      setMenuPos({
        top:   rect.bottom + 6,
        right: Math.max(8, right),
        width: Math.min(300, window.innerWidth - 16),
      });
    }
  };

  const handleToggle = () => {
    if (!isOpen) updatePosition();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        menuRef.current   && !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    function handleScrollOrResize() { if (isOpen) updatePosition(); }

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
    const style = { width: '13px', height: '13px', color: 'var(--text-secondary)' };
    switch (iconName) {
      case 'Hand':    return <Hand    style={style} />;
      case 'Sliders': return <Sliders style={style} />;
      case 'Disc':    return <Disc    style={style} />;
      case 'Music':   return <Music   style={style} />;
      default:        return <Hand    style={style} />;
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="mac-btn"
        title="Select Input Mode"
      >
        {getIcon(activeModeDef.iconName)}
        <span style={{ fontWeight: 500 }}>{activeModeDef.name}</span>
        <ChevronDown
          style={{
            width: '11px',
            height: '11px',
            color: 'var(--text-tertiary)',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s ease',
          }}
        />
      </button>

      {/* Popover Menu (Apple macOS Native Style) */}
      {isOpen && mounted && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${menuPos.top}px`,
            right: `${menuPos.right}px`,
            width: `${menuPos.width}px`,
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)',
            zIndex: 9999,
            overflow: 'hidden',
            padding: '5px',
          }}
          className="animate-fade-up"
        >
          <div style={{ padding: '6px 9px 4px', borderBottom: '1px solid var(--separator-subtle)', marginBottom: '3px' }}>
            <span className="mac-section-title">
              Input Mode
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
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
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 9px',
                    borderRadius: '8px',
                    background: isSelected ? 'var(--surface-inset)' : 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.38 : 1,
                    transition: 'background 0.1s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isDisabled && !isSelected) {
                      e.currentTarget.style.background = 'var(--surface-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDisabled && !isSelected) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getIcon(mode.iconName)}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: isSelected ? 600 : 450, color: 'var(--text-primary)' }}>
                          {mode.name}
                        </span>
                        {mode.badge && (
                          <span
                            style={{
                              fontSize: '9.5px',
                              fontWeight: 600,
                              color: 'var(--apple-green)',
                              background: 'var(--apple-green-bg)',
                              padding: '1px 5px',
                              borderRadius: '4px',
                            }}
                          >
                            {mode.badge}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '1px 0 0 0', lineHeight: 1.3 }}>
                        {mode.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <Check style={{ width: '13px', height: '13px', color: 'var(--apple-green)', flexShrink: 0 }} />
                  )}
                  {isDisabled && (
                    <Lock style={{ width: '12px', height: '12px', color: 'var(--text-quaternary)', flexShrink: 0 }} />
                  )}
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
