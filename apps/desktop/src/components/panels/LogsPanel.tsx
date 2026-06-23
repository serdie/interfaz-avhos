import { useAppStore } from '../../store/app-store.js';
import { useTranslation, useTheme, Panel, PanelHeader, EmptyState, ScrollList, Badge, IconButton } from '@avhos/ui';

const LEVEL_COLORS: Record<string, string> = {
  info: '#2f81f7',
  warn: '#d29922',
  error: '#f85149',
};

const CATEGORY_LABELS: Record<string, string> = {
  workspace: 'Workspace',
  editor: 'Editor',
  explorer: 'Explorador',
  system: 'Sistema',
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return iso;
  }
}

export function LogsPanel() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { activityLog, clearActivity } = useAppStore();

  return (
    <Panel>
      <PanelHeader
        title={t('logs.title')}
        actions={
          <IconButton
            title={t('logs.clear')}
            onClick={clearActivity}
          >
            ✕
          </IconButton>
        }
      />
      {activityLog.length === 0 ? (
        <EmptyState message="Sin actividad registrada. Los eventos aparecerán aquí según interactúes con la aplicación." />
      ) : (
        <ScrollList>
          {activityLog.map((entry) => (
            <div
              key={entry.id}
              style={{
                padding: '6px 12px',
                borderBottom: `1px solid ${theme.colors.border}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                fontSize: 'var(--font-sm)',
              }}
            >
              <span style={{ color: theme.colors.textMuted, fontSize: 'var(--font-xs)', flexShrink: 0, minWidth: '60px' }}>
                {formatTime(entry.timestamp)}
              </span>
              <Badge color={LEVEL_COLORS[entry.level] ?? '#6e7681'}>
                {entry.level}
              </Badge>
              <span style={{ color: theme.colors.textMuted, minWidth: '60px', flexShrink: 0 }}>
                {CATEGORY_LABELS[entry.category] ?? entry.category}
              </span>
              <span style={{ color: theme.colors.textPrimary, flex: 1 }}>{entry.message}</span>
            </div>
          ))}
        </ScrollList>
      )}
    </Panel>
  );
}
