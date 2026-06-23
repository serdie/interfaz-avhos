import { useRef, useEffect, useState } from 'react';
import { useAppStore, type ActivityEntry } from '../store/app-store.js';
import { useTheme, useTranslation } from '@avhos/ui';

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
  const { t } = useTranslation();
  const { activityLog, bottomPanelVisible, toggleBottomPanel, clearActivity } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'activity' | 'terminal'>('activity');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activityLog]);

  if (!bottomPanelVisible) return null;

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '4px 12px',
    cursor: 'pointer',
    fontSize: 'var(--font-sm)',
    fontWeight: isActive ? 600 : 400,
    color: isActive ? theme.colors.textPrimary : theme.colors.textMuted,
    borderBottom: isActive ? `2px solid ${theme.colors.accent}` : '2px solid transparent',
    background: isActive ? theme.colors.bgPrimary : 'transparent',
  });

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
      {/* Cabecera con pestañas */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: theme.colors.bgSecondary,
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={tabStyle(activeTab === 'activity')} onClick={() => setActiveTab('activity')}>
            {t('activity.title')}
            {activityLog.length > 0 && (
              <span style={{ color: theme.colors.textMuted, fontSize: 'var(--font-xs)', marginLeft: '4px' }}>
                {activityLog.length}
              </span>
            )}
          </div>
          <div style={tabStyle(activeTab === 'terminal')} onClick={() => setActiveTab('terminal')}>
            {t('terminal.title')}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '12px' }}>
          {activeTab === 'activity' && activityLog.length > 0 && (
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

      {/* Contenido de pestaña Actividad */}
      {activeTab === 'activity' && (
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
              {t('activity.empty')}. Los eventos aparecerán aquí según interactúes con la aplicación.
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
      )}

      {/* Contenido de pestaña Terminal */}
      {activeTab === 'terminal' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: 'var(--font-base)', color: theme.colors.textPrimary, fontWeight: 600 }}>
            {t('terminal.notAvailable')}
          </div>
          <div style={{ fontSize: 'var(--font-sm)', color: theme.colors.textMuted, textAlign: 'center', maxWidth: '400px', lineHeight: 1.6 }}>
            {t('terminal.notAvailableDesc')}
          </div>
        </div>
      )}
    </div>
  );
}
