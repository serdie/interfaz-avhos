import { useAppStore } from '../../store/app-store.js';
import { useTranslation, useTheme, Panel, PanelHeader, EmptyState, ScrollList, Badge, IconButton } from '@avhos/ui';

const STATUS_COLORS: Record<string, string> = {
  connected: '#3fb950',
  disconnected: '#6e7681',
  error: '#f85149',
  connecting: '#d29922',
};

export function McpPanel() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { mcpServers } = useAppStore();

  return (
    <Panel>
      <PanelHeader
        title={t('mcp.title')}
        actions={<IconButton title={t('mcp.addServer')}>+</IconButton>}
      />
      {mcpServers.length === 0 ? (
        <EmptyState message={t('mcp.empty')} />
      ) : (
        <ScrollList>
          {mcpServers.map((server) => (
            <div
              key={server.id}
              style={{
                padding: '10px 12px',
                borderBottom: `1px solid ${theme.colors.border}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: theme.colors.textPrimary, fontSize: 'var(--font-base)', fontWeight: 500 }}>
                  {server.name}
                </span>
                <Badge color={STATUS_COLORS[server.status]}>
                  {t(`mcp.status.${server.status}`)}
                </Badge>
              </div>
              <div style={{ color: theme.colors.textSecondary, fontSize: 'var(--font-sm)', marginBottom: '4px' }}>
                {server.command} {server.args.join(' ')}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ color: theme.colors.textMuted, fontSize: 'var(--font-xs)' }}>
                  {server.transport}
                </span>
                {server.status === 'disconnected' ? (
                  <button
                    style={{
                      marginLeft: 'auto',
                      background: 'transparent',
                      border: `1px solid ${theme.colors.border}`,
                      color: theme.colors.accent,
                      borderRadius: '3px',
                      padding: '2px 8px',
                      cursor: 'pointer',
                      fontSize: 'var(--font-xs)',
                    }}
                  >
                    {t('mcp.connect')}
                  </button>
                ) : server.status === 'connected' ? (
                  <button
                    style={{
                      marginLeft: 'auto',
                      background: 'transparent',
                      border: `1px solid ${theme.colors.border}`,
                      color: theme.colors.danger,
                      borderRadius: '3px',
                      padding: '2px 8px',
                      cursor: 'pointer',
                      fontSize: 'var(--font-xs)',
                    }}
                  >
                    {t('mcp.disconnect')}
                  </button>
                ) : null}
              </div>
              <div style={{ marginTop: '8px', display: 'flex', gap: '12px', color: theme.colors.textMuted, fontSize: 'var(--font-xs)' }}>
                <span>{t('mcp.tools')}: 0</span>
                <span>{t('mcp.prompts')}: 0</span>
                <span>{t('mcp.resources')}: 0</span>
              </div>
            </div>
          ))}
        </ScrollList>
      )}
    </Panel>
  );
}
