import { useAppStore } from '../store/app-store.js';
import { useTheme } from '@avhos/ui';
import { isTauriEnvironment } from '../services/fs-adapter-factory.js';
import type { FileTreeNode } from '@avhos/core';

function countTreeNodes(nodes: FileTreeNode[]): number {
  let count = 0;
  for (const node of nodes) {
    count++;
    if (node.children) count += countTreeNodes(node.children);
  }
  return count;
}

function shortenPath(path: string, maxLen = 38): string {
  if (path.length <= maxLen) return path;
  const parts = path.split(/[\\/]/);
  if (parts.length <= 3) return path;
  return parts[0] + '/.../' + parts.slice(-2).join('/');
}

export function RightPanel() {
  const { theme } = useTheme();
  const {
    rightPanelVisible,
    workspaceRoot,
    fileTree,
    treeLoading,
    treeError,
    openTabs,
    activeTabId,
    tabContents,
    activityLog,
  } = useAppStore();

  if (!rightPanelVisible) return null;

  const isTauri = isTauriEnvironment();
  const activeTab = openTabs.find((tab) => tab.id === activeTabId);
  const tabContent = activeTab ? tabContents[activeTab.id] : undefined;
  const fileCount = countTreeNodes(fileTree);
  const recentActivity = activityLog.slice(-3);

  return (
    <div
      style={{
        width: '260px',
        minWidth: '200px',
        background: theme.colors.bgSecondary,
        borderLeft: `1px solid ${theme.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      {/* ── Proyecto ── */}
      <div style={{ padding: '12px', borderBottom: `1px solid ${theme.colors.border}` }}>
        <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: theme.colors.textPrimary, marginBottom: '8px' }}>
          Proyecto
        </div>
        {workspaceRoot ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Row label="Ruta" value={shortenPath(workspaceRoot)} title={workspaceRoot} />
            <Row label="Entorno" value={isTauri ? 'Tauri Desktop' : 'Vite Dev'} />
            <Row label="Adaptador" value={isTauri ? 'TauriFsAdapter' : 'ViteDevFsAdapter'} />
            <Row
              label="Elementos"
              value={treeLoading ? 'Cargando...' : treeError ? 'Error' : `${fileCount}`}
            />
            {treeError && (
              <div style={{ fontSize: 'var(--font-xs)', color: theme.colors.danger, marginTop: '2px' }}>
                ⚠ {treeError}
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 'var(--font-sm)', color: theme.colors.textMuted }}>
            Sin proyecto abierto
          </div>
        )}
      </div>

      {/* ── Editor ── */}
      <div style={{ padding: '12px', borderBottom: `1px solid ${theme.colors.border}` }}>
        <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: theme.colors.textPrimary, marginBottom: '8px' }}>
          Editor
        </div>
        {activeTab ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Row label="Archivo" value={activeTab.filePath.split(/[\\/]/).pop() ?? activeTab.filePath} />
            <Row label="Lenguaje" value={activeTab.language} />
            <Row label="Pestañas" value={`${openTabs.length}`} />
            <Row
              label="Estado"
              value={tabContent?.loading
                ? 'Cargando...'
                : tabContent?.error
                  ? 'Error'
                  : activeTab.isDirty
                    ? 'Sin guardar ●'
                    : 'Guardado'}
              valueColor={activeTab.isDirty
                ? theme.colors.warning
                : tabContent?.error
                  ? theme.colors.danger
                  : theme.colors.success}
            />
            {tabContent?.error && (
              <div style={{ fontSize: 'var(--font-xs)', color: theme.colors.danger, marginTop: '2px' }}>
                ⚠ {tabContent.error}
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 'var(--font-sm)', color: theme.colors.textMuted }}>
            Ningún archivo abierto
          </div>
        )}
      </div>

      {/* ── Actividad reciente ── */}
      {recentActivity.length > 0 && (
        <div style={{ padding: '12px', borderBottom: `1px solid ${theme.colors.border}` }}>
          <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: theme.colors.textPrimary, marginBottom: '8px' }}>
            Actividad reciente
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {recentActivity.map((entry) => (
              <div
                key={entry.id}
                style={{
                  fontSize: 'var(--font-xs)',
                  color: entry.level === 'error'
                    ? theme.colors.danger
                    : entry.level === 'warn'
                      ? theme.colors.warning
                      : theme.colors.textMuted,
                  lineHeight: 1.4,
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
        </div>
      )}

      {/* ── Funcionalidades no disponibles ── */}
      <div style={{ padding: '12px', borderBottom: `1px solid ${theme.colors.border}` }}>
        <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: theme.colors.textPrimary, marginBottom: '8px' }}>
          Funcionalidades
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {['Chat IA', 'Planificador', 'Memoria', 'Skills', 'MCP', 'Modelos'].map((name) => (
            <div
              key={name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 'var(--font-xs)',
              }}
            >
              <span style={{ color: theme.colors.textMuted }}>{name}</span>
              <span style={{ color: theme.colors.textMuted, fontStyle: 'italic' }}>No disponible</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Atajos ── */}
      <div style={{ padding: '12px', marginTop: 'auto' }}>
        <div style={{ fontSize: 'var(--font-xs)', color: theme.colors.textMuted, lineHeight: 1.8 }}>
          <div><kbd style={kbdStyle(theme)}>Ctrl+P</kbd> Paleta de comandos</div>
          <div><kbd style={kbdStyle(theme)}>Ctrl+B</kbd> Alternar sidebar</div>
          <div><kbd style={kbdStyle(theme)}>Ctrl+J</kbd> Alternar panel inferior</div>
          <div><kbd style={kbdStyle(theme)}>Ctrl+L</kbd> Alternar panel derecho</div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, title, valueColor }: { label: string; value: string; title?: string; valueColor?: string }) {
  const { theme } = useTheme();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-xs)', gap: '8px' }}>
      <span style={{ color: theme.colors.textMuted, flexShrink: 0 }}>{label}</span>
      <span
        title={title}
        style={{
          color: valueColor ?? theme.colors.textSecondary,
          textAlign: 'right',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function kbdStyle(theme: ReturnType<typeof useTheme>['theme']): React.CSSProperties {
  return {
    background: theme.colors.bgTertiary,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '3px',
    padding: '1px 4px',
    fontSize: 'var(--font-xs)',
    color: theme.colors.textSecondary,
    marginRight: '4px',
  };
}
