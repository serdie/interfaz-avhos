import { useRef, useEffect } from 'react';
import { useAppStore, type ActivityEntry } from '../store/app-store.js';
import { useTheme } from '@avhos/ui';

const CATEGORY_LABELS: Record<ActivityEntry['category'], string> = {
  workspace: 'Workspace',
  editor: 'Editor',
  explorer: 'Explorador',
  system: 'Sistema',
};

const CATEGORY_ICONS: Record<ActivityEntry['category'], string> = {
  workspace: '📂',
  editor: '📝',
  explorer: '🗂',
  system: '⚙',
};

const LEVEL_COLORS: Record<ActivityEntry['level'], string> = {
  info: 'var(--color-text-secondary)',
  warn: 'var(--color-warning)',
  error: 'var(--color-danger)',
};

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return iso;
  }
}

export function BottomPanel() {
  const { theme } = useTheme();
  const { activityLog, bottomPanelVisible, toggleBottomPanel, clearActivity } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activityLog]);

  if (!bottomPanelVisible) return null;

  return (
    <div
      style={{
        height: '200px',
        minHeight: '100px',
        background: theme.colors.bgPrimary,
        borderTop: `1px solid ${theme.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Cabecera del panel */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 12px',
          background: theme.colors.bgSecondary,
          borderBottom: `1px solid ${theme.colors.border}`,
          fontSize: 'var(--font-sm)',
          color: theme.colors.textSecondary,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600 }}>Actividad</span>
          {activityLog.length > 0 && (
            <span style={{ color: theme.colors.textMuted, fontSize: 'var(--font-xs)' }}>
              {activityLog.length} evento{activityLog.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {activityLog.length > 0 && (
            <button
              onClick={clearActivity}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.colors.textMuted,
                cursor: 'pointer',
                fontSize: 'var(--font-xs)',
              }}
              title="Limpiar actividad"
            >
              Limpiar
            </button>
          )}
          <button
            onClick={toggleBottomPanel}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.colors.textMuted,
              cursor: 'pointer',
              fontSize: 'var(--font-base)',
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Lista de eventos */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '4px 0',
          fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
          fontSize: '12px',
          lineHeight: 1.6,
        }}
      >
        {activityLog.length === 0 ? (
          <div
            style={{
              padding: '16px 12px',
              color: theme.colors.textMuted,
              fontSize: 'var(--font-sm)',
              fontFamily: 'inherit',
            }}
          >
            Sin actividad registrada. Los eventos aparecerán aquí según interactúes con la aplicación.
          </div>
        ) : (
          activityLog.map((entry) => (
            <div
              key={entry.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px',
                padding: '1px 12px',
              }}
            >
              <span
                style={{
                  color: theme.colors.textMuted,
                  flexShrink: 0,
                  minWidth: '64px',
                }}
              >
                {formatTime(entry.timestamp)}
              </span>
              <span style={{ flexShrink: 0, width: '16px', textAlign: 'center' }}>
                {CATEGORY_ICONS[entry.category]}
              </span>
              <span
                style={{
                  flexShrink: 0,
                  minWidth: '70px',
                  color: theme.colors.textMuted,
                  fontSize: '11px',
                }}
              >
                {CATEGORY_LABELS[entry.category]}
              </span>
              <span
                style={{
                  color: LEVEL_COLORS[entry.level] === 'var(--color-text-secondary)'
                    ? theme.colors.textSecondary
                    : LEVEL_COLORS[entry.level] === 'var(--color-warning)'
                      ? theme.colors.warning
                      : theme.colors.danger,
                  flex: 1,
                  wordBreak: 'break-word',
                }}
              >
                {entry.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
