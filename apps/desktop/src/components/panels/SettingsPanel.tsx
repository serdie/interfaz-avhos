import { useAppStore } from '../../store/app-store.js';
import { useTranslation, useTheme, Panel, PanelHeader } from '@avhos/ui';

export function SettingsPanel() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { workspaceRoot, activeTabId, openTabs } = useAppStore();

  const activeTab = openTabs.find((tab) => tab.id === activeTabId);
  const projectName = workspaceRoot
    ? workspaceRoot.split(/[\\/]/).pop()
    : null;

  return (
    <Panel>
      <PanelHeader title={t('settings.title')} />
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
          Configuración no disponible
        </div>
        <div style={{ fontSize: 'var(--font-sm)', color: theme.colors.textMuted, lineHeight: 1.6 }}>
          La configuración persistente de AVHOS (apariencia, editor, terminal,
          modelos, MCP, agente) requiere un backend de ajustes que guarde
          preferencias entre sesiones. Aún no está implementado.
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
          Cuando el backend de ajustes esté disponible, podrás configurar
          tema, fuente, atajos de teclado y preferencias del agente.
        </div>
      </div>
    </Panel>
  );
}
