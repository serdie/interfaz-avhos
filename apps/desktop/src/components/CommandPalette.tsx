import { useState, useEffect, useRef } from 'react';
import { useAppStore, type ActivityView } from '../store/app-store.js';
import { useTranslation, useTheme } from '@avhos/ui';

export function CommandPalette() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { paletteOpen, closePalette, setActiveView, toggleSidebar, toggleBottomPanel, toggleRightPanel } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: { id: string; label: string; hint: string; action: () => void }[] = [
    { id: 'view-explorer', label: t('activity.explorer'), hint: t('commandPalette.goTo'), action: () => { setActiveView('explorer' as ActivityView); if (!useAppStore.getState().sidebarVisible) toggleSidebar(); } },
    { id: 'view-chat', label: t('activity.chat'), hint: t('commandPalette.goTo'), action: () => { setActiveView('chat' as ActivityView); if (!useAppStore.getState().sidebarVisible) toggleSidebar(); } },
    { id: 'view-planner', label: t('activity.planner'), hint: t('commandPalette.goTo'), action: () => { setActiveView('planner' as ActivityView); if (!useAppStore.getState().sidebarVisible) toggleSidebar(); } },
    { id: 'view-memory', label: t('activity.memory'), hint: t('commandPalette.goTo'), action: () => { setActiveView('memory' as ActivityView); if (!useAppStore.getState().sidebarVisible) toggleSidebar(); } },
    { id: 'view-skills', label: t('activity.skills'), hint: t('commandPalette.goTo'), action: () => { setActiveView('skills' as ActivityView); if (!useAppStore.getState().sidebarVisible) toggleSidebar(); } },
    { id: 'view-mcp', label: t('activity.mcp'), hint: t('commandPalette.goTo'), action: () => { setActiveView('mcp' as ActivityView); if (!useAppStore.getState().sidebarVisible) toggleSidebar(); } },
    { id: 'view-models', label: t('activity.models'), hint: t('commandPalette.goTo'), action: () => { setActiveView('models' as ActivityView); if (!useAppStore.getState().sidebarVisible) toggleSidebar(); } },
    { id: 'view-logs', label: t('activity.logs'), hint: t('commandPalette.goTo'), action: () => { setActiveView('logs' as ActivityView); if (!useAppStore.getState().sidebarVisible) toggleSidebar(); } },
    { id: 'view-settings', label: t('activity.settings'), hint: t('commandPalette.goTo'), action: () => { setActiveView('settings' as ActivityView); if (!useAppStore.getState().sidebarVisible) toggleSidebar(); } },
    { id: 'toggle-sidebar', label: t('rightPanel.toggleSidebar'), hint: t('commandPalette.toggle'), action: toggleSidebar },
    { id: 'toggle-bottom', label: t('rightPanel.toggleBottom'), hint: t('commandPalette.toggle'), action: toggleBottomPanel },
    { id: 'toggle-right', label: t('rightPanel.toggleRight'), hint: t('commandPalette.toggle'), action: toggleRightPanel },
  ];

  const filtered = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  useEffect(() => {
    if (paletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [paletteOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!paletteOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closePalette();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[selectedIndex];
      if (cmd) {
        cmd.action();
        closePalette();
      }
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closePalette}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 1000,
        }}
      />
      {/* Palette */}
      <div
        style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          maxWidth: '90vw',
          background: theme.colors.bgSecondary,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 1001,
          overflow: 'hidden',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('commandPalette.placeholder')}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: `1px solid ${theme.colors.border}`,
            color: theme.colors.textPrimary,
            fontSize: 'var(--font-base)',
            outline: 'none',
          }}
        />
        <div style={{ maxHeight: '300px', overflow: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '16px', color: theme.colors.textMuted, textAlign: 'center', fontSize: 'var(--font-sm)' }}>
              {t('commandPalette.noResults')}
            </div>
          ) : (
            filtered.map((cmd, i) => (
              <div
                key={cmd.id}
                onClick={() => {
                  cmd.action();
                  closePalette();
                }}
                onMouseEnter={() => setSelectedIndex(i)}
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  background: i === selectedIndex ? theme.colors.bgHover : 'transparent',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: theme.colors.textPrimary, fontSize: 'var(--font-base)' }}>
                  {cmd.label}
                </span>
                <span style={{ color: theme.colors.textMuted, fontSize: 'var(--font-xs)' }}>
                  {cmd.hint}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
