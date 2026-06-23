import { useAppStore } from '../../store/app-store.js';
import { useTranslation, useTheme, Panel, PanelHeader } from '@avhos/ui';

export function PlannerPanel() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { workspaceRoot, activeTabId, openTabs, activityLog } = useAppStore();

  const activeTab = openTabs.find((tab) => tab.id === activeTabId);
  const projectName = workspaceRoot
    ? workspaceRoot.split(/[\\/]/).pop()
    : null;
  const recentEvents = activityLog.slice(-5).reverse();

  return (
    <Panel>
      <PanelHeader title={t('planner.title')} />
      <div
        style={{
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          height: '100%',
        }}
      >
        <div
          style={{
            fontSize: 'var(--font-base)',
            color: theme.colors.textPrimary,
            fontWeight: 600,
          }}
        >
          Planificador no disponible
        </div>

        <div
          style={{
            fontSize: 'var(--font-sm)',
            color: theme.colors.textMuted,
            lineHeight: 1.6,
          }}
        >
          El planificador requiere un motor de orquestación conectado
          a un modelo de IA para generar y gestionar tareas automáticamente.
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
            {projectName
              ? `Proyecto: ${projectName}`
              : 'Sin proyecto abierto'}
          </div>
          <div style={{ fontSize: 'var(--font-xs)', color: theme.colors.textMuted }}>
            {activeTab
              ? `Archivo activo: ${activeTab.filePath.split(/[\\/]/).pop()}`
              : 'Ningún archivo abierto'}
          </div>
          <div style={{ fontSize: 'var(--font-xs)', color: theme.colors.textMuted }}>
            {`Pestañas abiertas: ${openTabs.length}`}
          </div>
        </div>

        {recentEvents.length > 0 && (
          <div
            style={{
              padding: '12px',
              background: theme.colors.bgTertiary,
              borderRadius: '6px',
              border: `1px solid ${theme.colors.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: theme.colors.textSecondary }}>
              Actividad reciente
            </div>
            {recentEvents.map((entry) => (
              <div
                key={entry.id}
                style={{
                  fontSize: 'var(--font-xs)',
                  color: entry.level === 'error'
                    ? theme.colors.danger
                    : entry.level === 'warn'
                      ? theme.colors.warning
                      : theme.colors.textMuted,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={entry.message}
              >
                {entry.message}
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            fontSize: 'var(--font-xs)',
            color: theme.colors.textMuted,
            fontStyle: 'italic',
          }}
        >
          Cuando el motor esté disponible, el planificador generará tareas
          a partir del contexto del proyecto y del archivo activo.
        </div>
      </div>
    </Panel>
  );
}
