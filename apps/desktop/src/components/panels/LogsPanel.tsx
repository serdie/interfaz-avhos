import { useAppStore } from '../../store/app-store.js';
import { useTranslation, useTheme, Panel, PanelHeader, EmptyState, ScrollList, Badge, IconButton } from '@avhos/ui';

const LEVEL_COLORS: Record<string, string> = {
  debug: '#6e7681',
  info: '#2f81f7',
  warn: '#d29922',
  error: '#f85149',
};

export function LogsPanel() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { logs } = useAppStore();

  return (
    <Panel>
      <PanelHeader
        title={t('logs.title')}
        actions={<IconButton title={t('logs.clear')}>✕</IconButton>}
      />
      {logs.length === 0 ? (
        <EmptyState message={t('logs.empty')} />
      ) : (
        <ScrollList>
          {logs.map((log) => (
            <div
              key={log.id}
              style={{
                padding: '6px 12px',
                borderBottom: `1px solid ${theme.colors.border}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                fontSize: 'var(--font-sm)',
              }}
            >
              <Badge color={LEVEL_COLORS[log.level]}>{t(`logs.level.${log.level}`)}</Badge>
              <span style={{ color: theme.colors.textMuted, minWidth: '60px' }}>
                {t(`logs.category.${log.category}`)}
              </span>
              <span style={{ color: theme.colors.textPrimary, flex: 1 }}>{log.message}</span>
            </div>
          ))}
        </ScrollList>
      )}
    </Panel>
  );
}
