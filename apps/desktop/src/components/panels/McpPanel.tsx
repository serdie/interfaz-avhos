import { useAppStore } from '../../store/app-store.js';
import { useTranslation, useTheme, Panel, PanelHeader } from '@avhos/ui';

export function McpPanel() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { workspaceRoot, activeTabId, openTabs } = useAppStore();

  const activeTab = openTabs.find((tab) => tab.id === activeTabId);
  const projectName = workspaceRoot
    ? workspaceRoot.split(/[\\/]/).pop()
    : null;

  return (
    <Panel>
      <PanelHeader title={t('mcp.title')} />
      <div
        style={{
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          height: '100%',
        }}
      >
        <div style={{ fontSize: 'var(--font-base)', color: theme.colors.textPrimary, fontWeight: 600 }}>
          MCP no disponible
        </div>
        <div style={{ fontSize: 'var(--font-sm)', color: theme.colors.textMuted, lineHeight: 1.6 }}>
          El Model Context Protocol (MCP) permite conectar servidores de
          herramientas externas. Requiere un cliente MCP integrado que
          gestione conexiones, descubrimiento de herramientas y ejecución.
          Aún no está implementado.
        </div>
        <div
          style={{
            padding: '12px',
            background: theme.colors.bgTertiary,
            borderRadius: '6px',
            border: `1px solid ${theme.colors.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: theme.colors.textSecondary }}>
            Contexto actual
          </div>
          <div style={{ fontSize: 'var(--font-xs)', color: theme.colors.textMuted }}>
            {projectName ? `Proyecto: ${projectName}` : 'Sin proyecto abierto'}
          </div>
          <div style={{ fontSize: 'var(--font-xs)', color: theme.colors.textMuted }}>
            {activeTab ? `Archivo activo: ${activeTab.filePath.split(/[\\/]/).pop()}` : 'Ningún archivo abierto'}
          </div>
          <div style={{ fontSize: 'var(--font-xs)', color: theme.colors.textMuted }}>
            {`Pestañas abiertas: ${openTabs.length}`}
          </div>
        </div>
        <div style={{ fontSize: 'var(--font-xs)', color: theme.colors.textMuted, fontStyle: 'italic' }}>
          Cuando el cliente MCP esté disponible, podrás conectar servidores
          de herramientas y exponerlas al agente IA.
        </div>
      </div>
    </Panel>
  );
}
